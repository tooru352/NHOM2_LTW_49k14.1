"""
Management command to create sample data for MXH_4P project
Usage: python manage.py create_sample_data
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from social_media_4P.models import (
    Post, Interaction, InteractionType,
    Group as CustomGroup, GroupMember,
    Task, TaskResponse,
    Meeting, MeetingParticipant,
    Conversation, ConversationMember, Message,
    WorkShift, WorkSchedule
)
from datetime import datetime, date, time, timedelta
from django.utils import timezone

User = get_user_model()


class Command(BaseCommand):
    help = 'Create sample data for MXH_4P project'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating sample data...')
        
        # 1. Create Django Groups
        self.create_django_groups()
        
        # 2. Create Users
        users = self.create_users()
        
        # 3. Create Interaction Types
        interaction_types = self.create_interaction_types()
        
        # 4. Create Posts
        posts = self.create_posts(users)
        
        # 5. Create Interactions
        self.create_interactions(posts, users, interaction_types)
        
        # 6. Create Custom Groups
        groups = self.create_custom_groups(users)
        
        # 7. Create Group Members
        self.create_group_members(groups, users)
        
        # 8. Create Tasks
        tasks = self.create_tasks(users)
        
        # 9. Create Task Responses
        self.create_task_responses(tasks, users)
        
        # 10. Create Meetings
        meetings = self.create_meetings(users)
        
        # 11. Create Meeting Participants
        self.create_meeting_participants(meetings, users)
        
        # 12. Create Conversations
        conversations = self.create_conversations(users)
        
        # 13. Create Messages
        self.create_messages(conversations, users)
        
        # 14. Create Work Shifts
        shifts = self.create_work_shifts()
        
        # 15. Create Work Schedules
        self.create_work_schedules(users, shifts)
        
        self.stdout.write(self.style.SUCCESS('Successfully created sample data!'))

    def create_django_groups(self):
        """Create Django Groups for permissions"""
        self.stdout.write('Creating Django Groups...')
        
        manager_group, created = Group.objects.get_or_create(name='Manager')
        if created:
            self.stdout.write(self.style.SUCCESS('  - Created Manager group'))
        
        employee_group, created = Group.objects.get_or_create(name='Employee')
        if created:
            self.stdout.write(self.style.SUCCESS('  - Created Employee group'))

    def create_users(self):
        """Create sample users"""
        self.stdout.write('Creating users...')
        
        users_data = [
            {
                'username': 'admin',
                'email': 'admin@hotel.com',
                'password': 'admin123',
                'first_name': 'Admin',
                'last_name': 'Hotel',
                'is_staff': True,
                'is_superuser': True,
                'avatar_initials': 'AH',
                'avatar_gradient': 'linear-gradient(135deg, #667eea, #764ba2)',
                'group': 'Manager'
            },
            {
                'username': 'phamthuong',
                'email': 'thuong@hotel.com',
                'password': 'thuong123',
                'first_name': 'Phạm Xuân',
                'last_name': 'Thương',
                'avatar_initials': 'PT',
                'avatar_gradient': 'linear-gradient(135deg, #3498db, #2980b9)',
                'group': 'Manager'
            },
            {
                'username': 'nguyenan',
                'email': 'an@hotel.com',
                'password': 'an123',
                'first_name': 'Nguyễn Hải',
                'last_name': 'An',
                'avatar_initials': 'NA',
                'avatar_gradient': 'linear-gradient(135deg, #e74c3c, #c0392b)',
                'group': 'Employee'
            },
            {
                'username': 'tranhung',
                'email': 'hung@hotel.com',
                'password': 'hung123',
                'first_name': 'Trần Văn',
                'last_name': 'Hùng',
                'avatar_initials': 'TH',
                'avatar_gradient': 'linear-gradient(135deg, #2ecc71, #27ae60)',
                'group': 'Employee'
            },
            {
                'username': 'lechau',
                'email': 'chau@hotel.com',
                'password': 'chau123',
                'first_name': 'Lê Minh',
                'last_name': 'Châu',
                'avatar_initials': 'LC',
                'avatar_gradient': 'linear-gradient(135deg, #f39c12, #e67e22)',
                'group': 'Employee'
            },
            {
                'username': 'lehuong',
                'email': 'huong@hotel.com',
                'password': 'huong123',
                'first_name': 'Lê Thị',
                'last_name': 'Hường',
                'avatar_initials': 'LH',
                'avatar_gradient': 'linear-gradient(135deg, #9b59b6, #8e44ad)',
                'group': 'Employee'
            },
        ]
        
        users = []
        for user_data in users_data:
            group_name = user_data.pop('group')
            password = user_data.pop('password')
            
            user, created = User.objects.get_or_create(
                username=user_data['username'],
                defaults=user_data
            )
            
            if created:
                user.set_password(password)
                user.save()
                
                # Add to group
                group = Group.objects.get(name=group_name)
                user.groups.add(group)
                
                self.stdout.write(self.style.SUCCESS(f'  - Created user: {user.username}'))
            
            users.append(user)
        
        return users

    def create_interaction_types(self):
        """Create interaction types"""
        self.stdout.write('Creating interaction types...')
        
        types_data = [
            {'name': 'reaction', 'description': 'Thả cảm xúc'},
            {'name': 'comment', 'description': 'Bình luận'},
            {'name': 'share', 'description': 'Chia sẻ'},
        ]
        
        types = []
        for type_data in types_data:
            interaction_type, created = InteractionType.objects.get_or_create(
                name=type_data['name'],
                defaults=type_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'  - Created type: {interaction_type.name}'))
            types.append(interaction_type)
        
        return types

    def create_posts(self, users):
        """Create sample posts"""
        self.stdout.write('Creating posts...')
        
        posts_data = [
            {
                'user': users[1],  # phamthuong
                'content': 'Chào mừng tất cả mọi người đến với hệ thống mạng xã hội nội bộ của khách sạn! 🎉',
            },
            {
                'user': users[1],
                'content': 'Thông báo: Cuộc họp toàn thể nhân viên sẽ diễn ra vào 9h sáng thứ Hai tại phòng họp tầng 3.',
            },
            {
                'user': users[2],  # nguyenan
                'content': 'Doanh thu tháng 3 tăng 12% so với cùng kỳ năm ngoái. Cảm ơn sự nỗ lực của tất cả mọi người! 📈',
            },
            {
                'user': users[3],  # tranhung
                'content': 'Menu buffet sáng tuần tới đã được cập nhật với 5 món mới. Mời mọi người tham khảo! 🍳',
            },
            {
                'user': users[4],  # lechau
                'content': 'Kế hoạch đăng bài tháng 4 đã sẵn sàng. Mỗi ngày 2 bài trên Facebook và Instagram.',
            },
            {
                'user': users[5],  # lehuong
                'content': 'Từ tuần tới áp dụng quy trình check-in mới, rút ngắn thời gian xuống còn 3 phút. ⏱️',
            },
        ]
        
        posts = []
        for post_data in posts_data:
            post = Post.objects.create(**post_data)
            posts.append(post)
            self.stdout.write(self.style.SUCCESS(f'  - Created post by {post.user.username}'))
        
        return posts

    def create_interactions(self, posts, users, interaction_types):
        """Create sample interactions"""
        self.stdout.write('Creating interactions...')
        
        reaction_type = interaction_types[0]
        comment_type = interaction_types[1]
        
        # Add reactions
        for post in posts[:3]:
            for user in users[1:4]:
                Interaction.objects.create(
                    post=post,
                    user=user,
                    interaction_type=reaction_type
                )
        
        # Add comments
        comments_data = [
            {'post': posts[0], 'user': users[2], 'content': 'Cảm ơn anh! Rất vui được tham gia!'},
            {'post': posts[1], 'user': users[3], 'content': 'Đã ghi nhận. Tôi sẽ có mặt đúng giờ.'},
            {'post': posts[2], 'user': users[1], 'content': 'Tuyệt vời! Tiếp tục phát huy nhé!'},
        ]
        
        for comment_data in comments_data:
            Interaction.objects.create(
                interaction_type=comment_type,
                **comment_data
            )
        
        self.stdout.write(self.style.SUCCESS(f'  - Created interactions'))

    def create_custom_groups(self, users):
        """Create custom groups"""
        self.stdout.write('Creating custom groups...')
        
        groups_data = [
            {
                'name': 'Ban quản lý',
                'description': 'Nhóm dành cho ban quản lý khách sạn',
                'creator': users[1],
                'status': 'private'
            },
            {
                'name': 'Nhóm lễ tân',
                'description': 'Chia sẻ kinh nghiệm và hỗ trợ khách hàng',
                'creator': users[1],
                'status': 'department'
            },
            {
                'name': 'Bộ phận F&B',
                'description': 'Nhóm cho nhân viên F&B',
                'creator': users[1],
                'status': 'department'
            },
            {
                'name': 'Bộ phận Marketing',
                'description': 'Đề xuất và thảo luận các ý tưởng cải tiến',
                'creator': users[1],
                'status': 'public'
            },
        ]
        
        groups = []
        for group_data in groups_data:
            group, created = CustomGroup.objects.get_or_create(
                name=group_data['name'],
                defaults=group_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'  - Created group: {group.name}'))
            groups.append(group)
        
        return groups

    def create_group_members(self, groups, users):
        """Create group members"""
        self.stdout.write('Creating group members...')
        
        # Ban quản lý
        GroupMember.objects.get_or_create(group=groups[0], user=users[1], defaults={'role': 'admin'})
        GroupMember.objects.get_or_create(group=groups[0], user=users[2], defaults={'role': 'member'})
        
        # Nhóm lễ tân
        GroupMember.objects.get_or_create(group=groups[1], user=users[5], defaults={'role': 'admin'})
        GroupMember.objects.get_or_create(group=groups[1], user=users[2], defaults={'role': 'member'})
        
        # F&B
        GroupMember.objects.get_or_create(group=groups[2], user=users[3], defaults={'role': 'admin'})
        GroupMember.objects.get_or_create(group=groups[2], user=users[4], defaults={'role': 'member'})
        
        self.stdout.write(self.style.SUCCESS('  - Created group members'))

    def create_tasks(self, users):
        """Create sample tasks"""
        self.stdout.write('Creating tasks...')
        
        tasks_data = [
            {
                'title': 'Chuẩn bị báo cáo doanh thu tháng 3',
                'description': 'Tổng hợp và phân tích doanh thu tháng 3, so sánh với tháng trước',
                'assigner': users[1],
                'assignee': users[2],
                'status': 'completed'
            },
            {
                'title': 'Kiểm tra thiết bị phòng họp',
                'description': 'Đảm bảo máy chiếu, micro hoạt động tốt trước cuộc họp',
                'assigner': users[1],
                'assignee': users[3],
                'status': 'in_progress'
            },
            {
                'title': 'Cập nhật menu buffet',
                'description': 'Thêm 5 món mới vào menu buffet sáng',
                'assigner': users[1],
                'assignee': users[3],
                'status': 'pending'
            },
        ]
        
        tasks = []
        for task_data in tasks_data:
            task = Task.objects.create(**task_data)
            tasks.append(task)
            self.stdout.write(self.style.SUCCESS(f'  - Created task: {task.title}'))
        
        return tasks

    def create_task_responses(self, tasks, users):
        """Create task responses"""
        self.stdout.write('Creating task responses...')
        
        TaskResponse.objects.create(
            task=tasks[0],
            responder=users[2],
            status=True,
            reason='Đã hoàn thành báo cáo'
        )
        
        self.stdout.write(self.style.SUCCESS('  - Created task responses'))

    def create_meetings(self, users):
        """Create sample meetings"""
        self.stdout.write('Creating meetings...')
        
        now = timezone.now()
        
        meetings_data = [
            {
                'title': 'Họp toàn thể nhân viên',
                'organizer': users[1],
                'start_time': now + timedelta(days=7, hours=9),
                'end_time': now + timedelta(days=7, hours=11),
            },
            {
                'title': 'Họp bộ phận F&B',
                'organizer': users[3],
                'start_time': now + timedelta(days=3, hours=14),
                'end_time': now + timedelta(days=3, hours=15),
            },
        ]
        
        meetings = []
        for meeting_data in meetings_data:
            meeting = Meeting.objects.create(**meeting_data)
            meetings.append(meeting)
            self.stdout.write(self.style.SUCCESS(f'  - Created meeting: {meeting.title}'))
        
        return meetings

    def create_meeting_participants(self, meetings, users):
        """Create meeting participants"""
        self.stdout.write('Creating meeting participants...')
        
        # Meeting 1 - All users
        for user in users[1:]:
            MeetingParticipant.objects.get_or_create(
                meeting=meetings[0],
                participant=user
            )
        
        # Meeting 2 - F&B staff
        MeetingParticipant.objects.get_or_create(meeting=meetings[1], participant=users[3])
        MeetingParticipant.objects.get_or_create(meeting=meetings[1], participant=users[4])
        
        self.stdout.write(self.style.SUCCESS('  - Created meeting participants'))

    def create_conversations(self, users):
        """Create sample conversations"""
        self.stdout.write('Creating conversations...')
        
        conversations = []
        
        # Conversation 1: phamthuong - nguyenan
        conv1 = Conversation.objects.create()
        ConversationMember.objects.create(conversation=conv1, user=users[1])
        ConversationMember.objects.create(conversation=conv1, user=users[2])
        conversations.append(conv1)
        
        # Conversation 2: phamthuong - tranhung
        conv2 = Conversation.objects.create()
        ConversationMember.objects.create(conversation=conv2, user=users[1])
        ConversationMember.objects.create(conversation=conv2, user=users[3])
        conversations.append(conv2)
        
        self.stdout.write(self.style.SUCCESS('  - Created conversations'))
        return conversations

    def create_messages(self, conversations, users):
        """Create sample messages"""
        self.stdout.write('Creating messages...')
        
        messages_data = [
            {
                'conversation': conversations[0],
                'sender': users[1],
                'content': 'Chào An, báo cáo doanh thu đã xong chưa?'
            },
            {
                'conversation': conversations[0],
                'sender': users[2],
                'content': 'Dạ đã xong rồi anh, em sẽ gửi file trong chiều nay.'
            },
            {
                'conversation': conversations[1],
                'sender': users[1],
                'content': 'Hùng ơi, menu mới chuẩn bị thế nào rồi?'
            },
        ]
        
        for msg_data in messages_data:
            Message.objects.create(**msg_data)
        
        self.stdout.write(self.style.SUCCESS('  - Created messages'))

    def create_work_shifts(self):
        """Create work shifts"""
        self.stdout.write('Creating work shifts...')
        
        shifts_data = [
            {
                'shift_code': 'S',
                'shift_name': 'Ca sáng',
                'start_time': time(6, 0),
                'end_time': time(14, 0),
                'color_code': '#4CAF50'
            },
            {
                'shift_code': 'C',
                'shift_name': 'Ca chiều',
                'start_time': time(14, 0),
                'end_time': time(22, 0),
                'color_code': '#2196F3'
            },
            {
                'shift_code': 'T',
                'shift_name': 'Ca tối',
                'start_time': time(22, 0),
                'end_time': time(6, 0),
                'color_code': '#FF9800'
            },
            {
                'shift_code': 'O',
                'shift_name': 'Nghỉ',
                'start_time': time(0, 0),
                'end_time': time(0, 0),
                'color_code': '#9E9E9E'
            },
        ]
        
        shifts = []
        for shift_data in shifts_data:
            shift, created = WorkShift.objects.get_or_create(
                shift_code=shift_data['shift_code'],
                defaults=shift_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'  - Created shift: {shift.shift_name}'))
            shifts.append(shift)
        
        return shifts

    def create_work_schedules(self, users, shifts):
        """Create work schedules"""
        self.stdout.write('Creating work schedules...')
        
        today = date.today()
        week_start = today - timedelta(days=today.weekday())
        
        # Create schedules for next week
        for i in range(7):
            work_date = week_start + timedelta(days=i)
            
            # Assign shifts to employees
            for j, user in enumerate(users[2:]):  # Skip admin and manager
                shift_index = (i + j) % 3  # Rotate between S, C, T
                
                WorkSchedule.objects.get_or_create(
                    user=user,
                    shift_code=shifts[shift_index],
                    work_date=work_date,
                    defaults={
                        'week_start': week_start,
                        'status': 1  # Accepted
                    }
                )
        
        self.stdout.write(self.style.SUCCESS('  - Created work schedules'))
