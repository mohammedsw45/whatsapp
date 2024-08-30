from django.shortcuts import get_object_or_404
from django.db.models import Count
from rest_framework import generics,status,serializers
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from account.permissions import IsAdminUser
from account.models import User,Profile
from account.serializers import ProfileSerializer
from .models import Chat, Message
from .serializers import ChatSerializer, MessageSerializer
from django.db.models import OuterRef, Subquery
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


#Chat
def get_chat_by_users(user_ids):
    chat_queryset = Chat.objects.filter(users__in=user_ids).distinct()

    for user_id in user_ids:
        chat_queryset = chat_queryset.filter(users__id=user_id)

    chat_queryset = chat_queryset.annotate(num_users=Count('users')).filter(num_users=len(user_ids))
    return chat_queryset

class ChatCreateView(generics.CreateAPIView):
    queryset = Chat.objects.all()
    serializer_class = ChatSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        request_data = request.data
        
        # Ensure 'users' key exists and is a list
        users = request_data.get('users', [])
        if not isinstance(users, list) or len(users)<=0:
            return Response({"Error": "Invalid users data format"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Ensure the current user is in the list of users
        current_user_id = request.user.id
        if current_user_id not in users:
            users.append(current_user_id)
        
        # Update the request data with the modified users list
        request_data['users'] = users
        
        # Check if a chat with these users already exists
        chat = get_chat_by_users(users)  # Ensure this function handles a list of user IDs correctly
        
        if chat:
            return Response({"Error": "This chat already exists"}, status=status.HTTP_400_BAD_REQUEST)

        # Proceed with creating the chat
        serializer = self.get_serializer(data=request_data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response({"chat": serializer.data}, status=status.HTTP_201_CREATED)

class ChatListView(generics.ListAPIView):
    serializer_class = ChatSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        # Get the latest message timestamp for each chat
        latest_message_subquery = Message.objects.filter(chat=OuterRef('pk')).order_by('-timestamp').values('timestamp')[:1]

        # Annotate the queryset with the latest message timestamp
        queryset = Chat.objects.filter(users=user).annotate(
            last_message_timestamp=Subquery(latest_message_subquery)
        ).order_by('-last_message_timestamp')

        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({"chats": serializer.data}, status=status.HTTP_200_OK)

class ChatRetrieveAPIView(generics.RetrieveAPIView):
    queryset = Chat.objects.all()
    serializer_class = ChatSerializer
    permission_classes = [IsAuthenticated]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()

        # Check if the request user is in the list of users for this chat
        if request.user not in instance.users.all():
            raise PermissionDenied("You do not have permission to access this chat.")

        serializer = self.get_serializer(instance)
        return Response({"chat": serializer.data}, status=status.HTTP_200_OK)


class ChatDetailsView(generics.RetrieveAPIView):
    queryset = Chat.objects.all()
    serializer_class = ChatSerializer
    permission_classes = [IsAuthenticated]

    def retrieve(self, request, *args, **kwargs):
        request_user = request.user
        dist_user = get_object_or_404(User, id=self.kwargs['user'])

        if request_user != dist_user:
            user_ids = [request_user.id, dist_user.id]
            chat_queryset = get_chat_by_users(user_ids)  

            # If a chat is found, serialize it and return the response
            chat_instance = get_object_or_404(chat_queryset)
            serializer = self.get_serializer(chat_instance)
            return Response({"chat": serializer.data}, status=status.HTTP_200_OK)

        # Handle the case where the requesting user is the same as dist_user (optional logic)
        return Response({'detail': 'You cannot chat with yourself.'}, status=400)

class ChatUpdateView(generics.UpdateAPIView):
    queryset = Chat.objects.all()
    serializer_class = ChatSerializer
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if request.user in instance.users.all() or request.user.is_superuser:
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)

            return Response({"chat": serializer.data}, status=status.HTTP_202_ACCEPTED)
        else:
            return Response({'Error': 'You are not in this chat'}, status=status.HTTP_403_FORBIDDEN)

class ChatDeleteView(generics.DestroyAPIView):
    queryset = Chat.objects.all()
    serializer_class = ChatSerializer
    permission_classes = [IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if request.user in instance.users.all() or request.user.is_superuser:
            self.perform_destroy(instance)
            return Response({"Result": "The Chat is deleted successfully"},status=status.HTTP_200_OK)
        else:
            return Response({'Error': 'You are not in this chat'}, status=status.HTTP_403_FORBIDDEN)



class UsersWithChatsAPIView(generics.ListAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Get all chats that include the authenticated user
        chats = Chat.objects.filter(users=user)
        # Get all users from those chats
        chat_users = User.objects.filter(chats__in=chats).distinct()
        # Exclude the current user
        chat_profiles = Profile.objects.filter(user__in=chat_users).exclude(user=user)
        return chat_profiles

    def get(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
            profiles = list(queryset)  # Convert QuerySet to a list for easier manipulation
            serializer = self.get_serializer(profiles, many=True)
            
            # Prepare a map of profile IDs to their serialized data
            profile_data_map = {profile.id: data for profile, data in zip(profiles, serializer.data)}
            response_data = []

            user = self.request.user
            
            for profile in profiles:
                # Retrieve the serialized data for the current profile
                profile_data = profile_data_map[profile.id]
                
                # Find chats for the current profile's user
                user_chats = Chat.objects.filter(users=profile.user)
                
                # Find common chats between the authenticated user and the profile's user
                common_chat_ids = [chat.id for chat in user_chats if chat in Chat.objects.filter(users=user)]
                
                # Add the chat IDs to the profile data
                profile_data['chat_ids'] = common_chat_ids
                response_data.append(profile_data)

            return Response({"profiles": response_data}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"message": f"An error occurred: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )



# # Message
# class MessageCreateView(generics.CreateAPIView):
#     serializer_class = MessageSerializer
#     permission_classes = [IsAuthenticated]
    
#     def create(self, request, *args, **kwargs):
#         request_data = request.data
#         sender = self.request.user
#         chat = get_object_or_404(Chat, id=self.kwargs['chat_id'])      
#         if sender not in chat.users.all():
#             return Response({"Error": "Sender must be a participant in the chat."}, status=status.HTTP_400_BAD_REQUEST)
        
#         message = Message.objects.create(chat=chat, sender=sender, text = request_data['text'])
        
#         serializer = MessageSerializer(message, many=False)


#         return Response({"message": serializer.data}, status=status.HTTP_201_CREATED)

# Message
class MessageCreateView(generics.CreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        request_data = request.data
        sender = self.request.user
        chat = get_object_or_404(Chat, id=self.kwargs['chat_id'])      

        # Ensure the sender is a participant in the chat
        if sender not in chat.users.all():
            return Response({"Error": "Sender must be a participant in the chat."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create the message
        message = Message.objects.create(chat=chat, sender=sender, text=request_data['text'])
        
        # Serialize the message data
        serializer = MessageSerializer(message, many=False)
        
        # Send message to WebSocket group
        channel_layer = get_channel_layer()
        group_name = f'chat_{chat.id}'#_{sender.profile_user.id}'
        async_to_sync(channel_layer.group_send)(
            group_name,  # Room group name
            {
                'type': 'chat_message',
                'message': message.text,
                'sender_id': sender.id,  # Ensure sender's profile ID is used
                'timestamp': message.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            }
        )

        return Response({"message": serializer.data}, status=status.HTTP_201_CREATED)
    
class MessageListView(generics.ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        chat_id = self.kwargs['chat_id']
        chat = get_object_or_404(Chat, id=chat_id)
        if self.request.user not in chat.users.all():
            raise serializers.ValidationError("You must be a participant in the chat.")
        return Message.objects.filter(chat_id=chat_id)
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({"messages": serializer.data}, status=status.HTTP_200_OK)

class MessageRetrieveView(generics.RetrieveAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        chat_id = self.kwargs['chat_id']
        chat = get_object_or_404(Chat, id=chat_id)
        if self.request.user not in chat.users.all():
            raise serializers.ValidationError("You must be a participant in the chat.")
        message_id = self.kwargs['pk']
        return get_object_or_404(Message, chat_id=chat_id, id=message_id)
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({"message": serializer.data}, status=status.HTTP_200_OK)

class MessageUpdateView(generics.UpdateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        chat_id = self.kwargs['chat_id']
        chat = get_object_or_404(Chat, id=chat_id)
        message = get_object_or_404(Message, chat_id=chat_id, id=kwargs['pk'])
        if request.user in chat.users.all() or request.user.is_superuser:
            serializer = self.get_serializer(message, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response({"message": serializer.data}, status=status.HTTP_202_ACCEPTED)
        else:
            return Response({'Error': 'You are not in this chat'}, status=status.HTTP_403_FORBIDDEN)

class MessageDeleteView(generics.DestroyAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        chat_id = self.kwargs['chat_id']
        chat = get_object_or_404(Chat, id=chat_id)
        message = get_object_or_404(Message, chat_id=chat_id, id=kwargs['pk'])
        if request.user in chat.users.all() or request.user.is_superuser:
            self.perform_destroy(message)
            return Response({"Result": "Message deleted successfully"}, status=status.HTTP_200_OK)
        else:
            return Response({'Error': 'You are not in this chat'}, status=status.HTTP_403_FORBIDDEN)


'''


from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Post
from .serializers import PostSerializer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        post = serializer.save(user=self.request.user)
        # Notify users in the specific group for this user
        channel_layer = get_channel_layer()
        group_name = f'chat_{self.request.user.id}'  # Ensure the group name matches

        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                'type': 'new_post',
                'message': f'New post created: {post.title}'
            }
        )

'''