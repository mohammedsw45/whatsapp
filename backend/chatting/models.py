from django.db import models
from django.core.exceptions import ValidationError
from account.models import User

class Chat(models.Model):
    title = models.CharField(max_length=100, blank=True, null=True)
    users = models.ManyToManyField(User, related_name='chats')
    is_group_chat = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):        
        if self.is_group_chat:
            return f"Group Chat {self.id}"
        else:
            return f"Chat between {', '.join([user.username for user in self.users.all()])}"
 

class Message(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='messages')
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"Message from {self.sender.username} in Chat {self.chat.id}"