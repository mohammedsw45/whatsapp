from django.shortcuts import get_object_or_404
from django.db.models import Count
from rest_framework import generics,status,serializers
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from account.permissions import IsAdminUser
from account.models import User
from .models import Chat, Message
from .serializers import ChatSerializer, MessageSerializer

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
        chat = get_chat_by_users(request_data['users'])        
        if chat:
            return Response({"Error": "This chat is already exists"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data=request_data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response({"chat":serializer.data}, status=status.HTTP_201_CREATED)

class ChatListView(generics.ListAPIView):
    queryset = Chat.objects.all()
    serializer_class = ChatSerializer
    permission_classes = [IsAuthenticated]

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({"chats": serializer.data}, status=status.HTTP_200_OK)

class ChatRetrieveAPIView(generics.RetrieveAPIView):
    queryset = Chat.objects.all()
    serializer_class = ChatSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
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


# Message
class MessageCreateView(generics.CreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        request_data = request.data
        sender = self.request.user
        chat = get_object_or_404(Chat, id=self.kwargs['chat_id'])      
        if sender not in chat.users.all():
            return Response({"Error": "Sender must be a participant in the chat."}, status=status.HTTP_400_BAD_REQUEST)
        
        message = Message.objects.create(chat=chat, sender=sender, text = request_data['text'])
        
        serializer = MessageSerializer(message, many=False)


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
