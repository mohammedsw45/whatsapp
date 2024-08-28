from rest_framework import serializers
from .models import Chat, Message
from account.models import User,Profile
from account.serializers import UserSerializer,ProfileSerializer

class MessageSerializer(serializers.ModelSerializer):
    chat = serializers.PrimaryKeyRelatedField(queryset=Chat.objects.all())
    sender = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())

    class Meta:
        model = Message
        fields = ['id', 'chat', 'sender', 'text', 'timestamp', 'is_read']


class ChatSerializer(serializers.ModelSerializer):
    users = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), many=True)
    messages = MessageSerializer(many=True, read_only=True)
    profiles = serializers.SerializerMethodField()

    class Meta:
        model = Chat
        fields = ['id', 'title', 'is_group_chat', 'users', 'created_at', 'messages', 'profiles']

    def get_profiles(self, obj):
        profiles = Profile.objects.filter(user__in=obj.users.all())
        return ProfileSerializer(profiles, many=True).data

    