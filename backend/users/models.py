from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        MONITOR = "MONITOR", "Monitor"
        CLIENT = "CLIENT", "Cliente"

    role = models.CharField(max_length=10, choices=Role.choices, default=Role.CLIENT)
    # Only set for CLIENT users: which monitor manages them.
    monitor = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="clients",
        limit_choices_to={"role": Role.MONITOR},
    )

    @property
    def is_admin_role(self):
        return self.role == self.Role.ADMIN

    @property
    def is_monitor_role(self):
        return self.role == self.Role.MONITOR

    @property
    def is_client_role(self):
        return self.role == self.Role.CLIENT

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.role})"
