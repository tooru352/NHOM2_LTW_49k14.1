import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'MXH_4P.settings')
django.setup()

from social_media_4P.models import Meeting, MeetingParticipant, User, Group, GroupMember
from django.db.models import Q

def fix_meeting_participants():
    """Add participants to all meetings based on location or group"""
    
    # Department-specific usernames (including managers)
    fb_usernames = ['doanxuantoan', 'vothikimhoa', 'doanthianhth', 'tranvanminh', 'lethilan',
                   'tranvantuan', 'dangthiyen', 'vothixuan']
    hk_usernames = ['phamxuanthuong', 'nguyendinhkhoa', 'nguyentruonggiang', 'ngovantung', 'phanthiha',
                   'phanvanthang', 'tathivan', 'buithinga']
    fo_usernames = ['nguyennhatha', 'lamvandat', 'trinhthingoc', 'duongvanhung', 'lethiphuong',
                   'luuvanphong', 'hoangvanquan', 'lyvanhai']
    
    meetings = Meeting.objects.all()
    
    for meeting in meetings:
        print(f"\nProcessing meeting: {meeting.title}")
        print(f"  Location: {meeting.location}")
        print(f"  Group: {meeting.group}")
        print(f"  Current participants: {meeting.participants.count()}")
        
        # Skip if already has participants
        if meeting.participants.count() > 0:
            print(f"  ✓ Already has participants, skipping")
            continue
        
        users_to_add = []
        
        # Priority 1: If group is specified, add all group members
        if meeting.group:
            group_members = GroupMember.objects.filter(group=meeting.group).select_related('user')
            users_to_add = [member.user for member in group_members]
            print(f"  → Adding {len(users_to_add)} members from group '{meeting.group.name}'")
        
        # Priority 2: If location specifies department, add department members
        elif meeting.location:
            location = meeting.location
            
            if 'F&B' in location or 'fb' in location.lower() or 'f&b' in location.lower():
                users_to_add = list(User.objects.filter(username__in=fb_usernames))
                print(f"  → Adding {len(users_to_add)} F&B members")
            elif 'HK' in location or 'housekeeping' in location.lower() or 'hk' in location.lower():
                users_to_add = list(User.objects.filter(username__in=hk_usernames))
                print(f"  → Adding {len(users_to_add)} HK members")
            elif 'FO' in location or 'front' in location.lower() or 'fo' in location.lower():
                users_to_add = list(User.objects.filter(username__in=fo_usernames))
                print(f"  → Adding {len(users_to_add)} FO members")
            elif 'Ban giám đốc' in location or 'giám đốc' in location.lower() or 'BGĐ' in location:
                users_to_add = list(User.objects.filter(groups__name='Manager'))
                print(f"  → Adding {len(users_to_add)} managers")
            else:
                # If location doesn't match any department, add all users
                users_to_add = list(User.objects.filter(Q(groups__name='Manager') | Q(groups__name='Employee')).distinct())
                print(f"  → Adding {len(users_to_add)} all users (no specific department)")
        
        # Create MeetingParticipant for each user
        participants_added = 0
        for user in users_to_add:
            MeetingParticipant.objects.get_or_create(meeting=meeting, user=user)
            participants_added += 1
        
        print(f"  ✓ Added {participants_added} participants")

if __name__ == '__main__':
    print("=" * 60)
    print("FIXING MEETING PARTICIPANTS")
    print("=" * 60)
    fix_meeting_participants()
    print("\n" + "=" * 60)
    print("DONE!")
    print("=" * 60)
