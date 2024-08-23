from .serializers import MyTokenObtainPairSerializer,SingUpSerializer,EditUserSerializer, ProfileSerializer,EditProfileSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics,status,serializers
from django.contrib.auth.hashers import make_password
from rest_framework.response import Response
from .permissions import IsAdminUser
from .models import User,Profile



from rest_framework_simplejwt.views import TokenObtainPairView


#Login   
class MyTokenObtainPairView(TokenObtainPairView):
    
    serializer_class = MyTokenObtainPairSerializer

# Register User - (Profile built in)
class UserRegisterAPIView(generics.CreateAPIView):
    serializer_class = SingUpSerializer

    def create(self, request, *args, **kwargs):
        data = request.data
        data._mutable = True
        email = data.get('email')
        password = data.get('password')
        
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError({"error": "This Email already exists!"})
        
        # Ensure password validation happens before hashing
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)

        # Hash the password
        data['password'] = make_password(password)
        serializer.validated_data['password'] = data['password']
        
        # Create the user with the validated data
        user = User.objects.create(**serializer.validated_data)

        prof = Profile.objects.get(user=user)
        
        # Set additional profile data
        profile_picture = data.get('profile_picture')
        if profile_picture:
            prof.profile_picture = profile_picture

        profile_photo = data.get('profile_photo')
        if profile_photo:
            prof.profile_photo = profile_photo

        display_status = data.get('display_status')
        if display_status:
            prof.display_status = display_status
        
        prof.save()

        serializer = ProfileSerializer(prof, many=False)
        
        return Response({
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)


    
# Get Profile
class ProfileRetrieveAPIView(generics.RetrieveAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            # Retrieve the post instance
            instance =  self.get_object()

            serializer = self.get_serializer(instance)
            return Response(
                {"profile": serializer.data},
                status=status.HTTP_200_OK
            )
        except Profile.DoesNotExist:
            return Response(
                {"message": "The profile does not exist."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"message": f"An error occurred: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )       
# Get List Profiles
class ProfileListAPIView(generics.ListAPIView): 
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            user = self.request.user
            if user.is_superuser:
                serializer = self.list(request, *args, **kwargs)
                if serializer.data:
                    return Response(
                        {"profiles": serializer.data},
                        status=status.HTTP_200_OK
                    )
            else:
                return Response(
                    {"message": "You do not have permission to view profiles."},
                    status=status.HTTP_403_FORBIDDEN
                )
        except Exception as e:
            return Response(
                {"message": f"An error occurred: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
# Update Profile  
class UpdateProfileView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = EditProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user.profile_user
    
    def update(self, request, *args, **kwargs):
        requested_data = request.data
        profile = self.get_object()
        serializer = self.get_serializer(profile, data=requested_data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        user = profile.user


        user_serializer = EditUserSerializer(user, data=requested_data, partial=True)
        if user_serializer.is_valid():
            self.perform_update(user_serializer)
            response_data = {
                "data": ProfileSerializer(profile).data
            }
            return Response(response_data, status=status.HTTP_202_ACCEPTED)
        
# Delete Profile          
class DestroyProfileView(generics.DestroyAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user.profile_user
    
    def perform_destroy(self, instance):
        user = instance.user
        if user == self.request.user:
            user.delete()
            instance.delete()

    def delete(self, request, *args, **kwargs):
        profile = self.get_object()
        self.perform_destroy(profile)
        return Response({"result": "The profile and associated user were deleted"}, status=status.HTTP_200_OK)