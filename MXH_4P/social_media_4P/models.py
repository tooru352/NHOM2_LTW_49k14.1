from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('quanly', 'Quản Lý'),
        ('nhanvien', 'Nhân Viên'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='nhanvien')
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
