"""
Script tạo conversations mẫu vào DB cho TẤT CẢ users.
Chạy: python seed_conversations.py
(từ thư mục MXH_4P)
"""
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'MXH_4P.settings')
django.setup()

from django.utils import timezone
from datetime import timedelta
from social_media_4P.models import User, Conversation, ConversationMember, Message
import random

# Lấy TẤT CẢ users
all_users = list(User.objects.all())
print(f"Tìm thấy {len(all_users)} users trong hệ thống")

# Tin nhắn mẫu
sample_messages = [
    (False, 'Chào anh/chị! Chúc buổi sáng tốt lành ạ 😊', 180),
    (True,  'Chào em! Có việc gì cần hỗ trợ không?', 174),
    (False, 'Dạ em đã hoàn thành công việc rồi ạ.', 168),
    (True,  'Tốt lắm! Cảm ơn em nhé!', 162),
]

sample_messages_2 = [
    (False, 'Anh ơi, em cần hỗ trợ về công việc ạ.', 120),
    (True,  'Được, anh sẽ hỗ trợ em ngay.', 114),
]

sample_messages_3 = [
    (False, 'Báo cáo công việc hôm nay đã xong ạ!', 1440),
    (True,  'Tốt lắm, cảm ơn em!', 1430),
]

all_sample_msgs = [sample_messages, sample_messages_2, sample_messages_3]

created = 0
skipped = 0

# Với mỗi user, tạo 2-3 conversations với các users khác
for me in all_users:
    print(f"\n--- Tạo conversations cho: {me.username} ({me.get_full_name()}) ---")
    
    # Chọn ngẫu nhiên 2-3 users khác để tạo conversation
    other_users = [u for u in all_users if u.id != me.id]
    if len(other_users) < 2:
        print(f"  Không đủ users khác để tạo conversations")
        continue
    
    num_convs = min(3, len(other_users))
    selected_others = random.sample(other_users, num_convs)
    
    for other in selected_others:
        # Kiểm tra đã có conversation chưa
        existing = Conversation.objects.filter(
            members__user=me
        ).filter(
            members__user=other
        ).first()

        if existing:
            skipped += 1
            continue

        # Tạo conversation mới
        conv = Conversation.objects.create(status='private')
        ConversationMember.objects.create(conversation=conv, user=me)
        ConversationMember.objects.create(conversation=conv, user=other)

        # Chọn ngẫu nhiên một bộ tin nhắn mẫu
        msgs = random.choice(all_sample_msgs)
        
        # Tạo messages
        now = timezone.now()
        for from_me, content, minutes_ago in msgs:
            sender = me if from_me else other
            Message.objects.create(
                conversation=conv,
                sender=sender,
                content=content,
                created_at=now - timedelta(minutes=minutes_ago),
            )

        print(f"  ✓ Tạo conversation với {other.get_full_name() or other.username} ({len(msgs)} tin nhắn)")
        created += 1

print(f"\n{'='*60}")
print(f"Hoàn thành: {created} conversations mới, {skipped} đã tồn tại (bỏ qua).")
print(f"{'='*60}")
