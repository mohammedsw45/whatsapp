from django.urls import path
from .views import (
    MyTokenObtainPairView,UserRegisterAPIView, UpdateProfileView,
    ProfileListAPIView, ProfileRetrieveAPIView,DestroyProfileView)

urlpatterns = [
    #User
    path('login/', MyTokenObtainPairView.as_view(), name='login'), ## Login
    path('register/', UserRegisterAPIView.as_view(), name='register'), ## Register

    path('profiles/', ProfileListAPIView.as_view(), name='get_profile_list'), ## Profile list 
    path('profiles/<str:pk>/', ProfileRetrieveAPIView.as_view(), name='get_profile'), ## Get Profile
    
    path('profile/update/', UpdateProfileView.as_view(), name='Update_profile'), ## Update Profile for user
    path('profile/delete/', DestroyProfileView.as_view(), name='delete_profile'), ## Delete Profile
]

