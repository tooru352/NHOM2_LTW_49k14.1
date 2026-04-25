"""
Script tạo conversations mẫu vào DB cho TẤT CẢ users.
Chạy: python seed_conversations.py
"""
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'MXH_4P.settings')
django.setup()

from django.utils import timezone
from datetime import timedelta
from social_media_4P.models import User, Conversation, ConversationMember, Message
import random

all_users = list(User.objects.all())
print(f"Tìm thấy {len(all_users)} users")

sample_sets = [
    [
        (False, 'Chào anh/chị! Chúc buổi sáng tốt lành ạ 😊', 180),
        (True,  'Chào em! Có việc gì cần hỗ trợ không?', 174),
        (False, 'Dạ em đã hoàn thành công việc rồi ạ.', 168),
        (True,  'Tốt lắm! Cảm ơn em nhé!', 162),
    ],
    [
        (False, 'Anh ơi, em cần hỗ trợ về công việc ạ.', 120),
        (True,  'Được, anh sẽ hỗ trợ em ngay.', 114),
    ],
    [
        (False, 'Báo cáo công việc hôm nay đã xong ạ!', 1440),
        (True,  'Tốt lắm, cảm ơn em!', 1430),
    ],
    [
        (False, 'Họp lúc 9h sáng mai nhé anh/chị!', 60),
        (True,  'OK em, anh/chị sẽ tham dự.', 55),
    ],
]

created = 0
skipped = 0

for me in all_users:
    others = [u for u in all_users if u.id != me.id]
    if not others:
        continue
    targets = random.sample(others, min(3, len(others)))

    for other in targets:
        # Kiểm tra đã có chưa
        existing = Conversation.objects.filter(
            status='private', members__user=me
        ).filter(members__user=other).first()

        if existing:
            skipped += 1
            continue

        conv = Conversation.objects.create(status='private')
        ConversationMember.objects.create(conversation=conv, user=me)
        ConversationMember.objects.create(conversation=conv, user=other)

        msgs = random.choice(sample_sets)
        now = timezone.now()
        for from_me, content, minutes_ago in msgs:
            sender = me if from_me else other
            Message.objects.create(
                conversation=conv, sender=sender, content=content,
                created_at=now - timedelta(minutes=minutes_ago),
            )

        created += 1

print(f"Hoàn thành: {created} conversations mới, {skipped} bỏ qua.")
