from django.urls import path
from .views import (
    ChatDetailsView,ChatCreateView,ChatListView,ChatRetrieveAPIView,ChatUpdateView, ChatDeleteView, # Chats
    MessageCreateView, MessageListView, MessageRetrieveView, MessageUpdateView, MessageDeleteView, # Messages
)

urlpatterns = [
    # Chat
    path('userchat/<str:user>/', ChatDetailsView.as_view(), name='get_one_chat_by_user'),
    path('chats/create', ChatCreateView.as_view(), name='create_chat'),
    path('chats/', ChatListView.as_view(), name='get_list_chat'),
    path('chats/<str:pk>', ChatRetrieveAPIView.as_view(), name='get_one_chat'),
    path('chats/<str:pk>/update/', ChatUpdateView.as_view(), name='update_Chat'),
    path('chats/<str:pk>/delete/', ChatDeleteView.as_view(), name='delete_Chat'),

    # Message
    path('chats/<int:chat_id>/messages/create/', MessageCreateView.as_view(), name='create_message'),
    path('chats/<int:chat_id>/messages/', MessageListView.as_view(), name='get_message_list'),
    path('chats/<int:chat_id>/messages/<int:pk>/', MessageRetrieveView.as_view(), name='get_message'),
    path('chats/<int:chat_id>/messages/<int:pk>/update/', MessageUpdateView.as_view(), name='update_message'),
    path('chats/<int:chat_id>/messages/<int:pk>/delete/', MessageDeleteView.as_view(), name='delete_message'),


]