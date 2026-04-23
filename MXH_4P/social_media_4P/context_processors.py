from .models import Conversation, Message

def unread_messages(request):
    """Context processor to provide unread messages count"""
    if request.user.is_authenticated:
        # For now, return 0. In the future, implement proper read/unread tracking
        # You would need to add a 'read' field to Message model or create a MessageRead model
        unread_count = 0
        
        # TODO: Implement proper unread tracking
        # Example: Count messages in user's conversations that are not from user and not read
        # unread_count = Message.objects.filter(
        #     conversation__members__user=request.user,
        #     read=False
        # ).exclude(sender=request.user).count()
        
        return {'unread_messages_count': unread_count}
    return {'unread_messages_count': 0}
