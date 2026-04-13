from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group as DjangoGroup
from social_media_4P.models import User, Post, Interaction, InteractionType
from django.utils import timezone
from datetime import timedelta

class Command(BaseCommand):
    help = 'Create sample data for posts'

    def handle(self, *args, **kwargs):
        # Create interaction types first
        interaction_types = ['comment', 'reaction', 'share']
        for itype in interaction_types:
            InteractionType.objects.get_or_create(name=itype)
        self.stdout.write(self.style.SUCCESS('✓ Created interaction types'))
        
        # Get or create Django Groups
        employee_group, _ = DjangoGroup.objects.get_or_create(name='Employee')
        manager_group, _ = DjangoGroup.objects.get_or_create(name='Manager')
        
        # Get or create users
        users_data = [
            {
                'username': 'minh.nv',
                'first_name': 'Minh',
                'last_name': 'Nguyen Van',
                'group': employee_group,
                'avatar_initials': 'NM',
                'avatar_gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            },
            {
                'username': 'huong.lt',
                'first_name': 'Huong',
                'last_name': 'Le Thi',
                'group': manager_group,
                'avatar_initials': 'LH',
                'avatar_gradient': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
            },
            {
                'username': 'thuong.px',
                'first_name': 'Thuong',
                'last_name': 'Pham Xuan',
                'group': manager_group,
                'avatar_initials': 'PT',
                'avatar_gradient': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
            },
        ]
        
        users = []
        for user_data in users_data:
            user, created = User.objects.get_or_create(
                username=user_data['username'],
                defaults={
                    'first_name': user_data['first_name'],
                    'last_name': user_data['last_name'],
                    'avatar_initials': user_data['avatar_initials'],
                    'avatar_gradient': user_data['avatar_gradient'],
                }
            )
            if created:
                user.set_password('password123')
                user.save()
                self.stdout.write(self.style.SUCCESS(f'✓ Created user: {user.username}'))
            
            # Assign to group
            user.groups.add(user_data['group'])
            users.append(user)
        
        # Delete old posts
        Post.objects.all().delete()
        
        # Create sample posts
        posts_data = [
            {
                'user': users[0],
                'content': '🎉 Training announcement for new check-in skills\n\nThe training session will be held at 2 PM today in the main hall. Please be on time to not miss important skills. There will be a quiz to test everyone\'s understanding.',
                'created_at': timezone.now() - timedelta(hours=2),
            },
            {
                'user': users[1],
                'content': '📢 Congratulations on completing F&B II\n\nCongratulations to the restaurant team for successfully completing last night\'s buffet party! Customers were very satisfied with the service quality and food. Thank you all for your best efforts!',
                'created_at': timezone.now() - timedelta(hours=4),
            },
            {
                'user': users[2],
                'content': '🏨 Next week\'s schedule announcement\n\nNext week\'s work schedule has been updated. Please check your personal schedule and confirm. If there are any issues that need adjustment, please contact HR before Friday this week.',
                'created_at': timezone.now() - timedelta(days=1, hours=5, minutes=30),
            },
        ]
        
        reaction_type = InteractionType.objects.get(name='reaction')
        
        for post_data in posts_data:
            post = Post.objects.create(**post_data)
            self.stdout.write(self.style.SUCCESS(f'✓ Created post: {post.id}'))
            
            # Create sample reactions
            if post.user == users[0]:
                Interaction.objects.create(post=post, user=users[1], interaction_type=reaction_type, content='like')
                Interaction.objects.create(post=post, user=users[2], interaction_type=reaction_type, content='love')
            elif post.user == users[1]:
                Interaction.objects.create(post=post, user=users[0], interaction_type=reaction_type, content='love')
                Interaction.objects.create(post=post, user=users[2], interaction_type=reaction_type, content='celebrate')
            else:
                Interaction.objects.create(post=post, user=users[0], interaction_type=reaction_type, content='like')
        
        self.stdout.write(self.style.SUCCESS('\n✓ Sample data created successfully!'))

