from django.conf import settings
from django.db import models

from exercises.models import Exercise


class Workout(models.Model):
    class Status(models.TextChoices):
        PLANNED = "PLANNED", "Planificado"
        DONE = "DONE", "Hecho"
        PENDING = "PENDING", "Pendiente"

    client = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="workouts"
    )
    monitor = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="assigned_workouts"
    )
    title = models.CharField(max_length=150)
    scheduled_date = models.DateField()
    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.PLANNED
    )

    class Meta:
        ordering = ["scheduled_date"]

    def __str__(self):
        return f"{self.title} - {self.client} ({self.scheduled_date})"


class WorkoutExercise(models.Model):
    workout = models.ForeignKey(Workout, on_delete=models.CASCADE, related_name="exercises")
    exercise = models.ForeignKey(Exercise, on_delete=models.PROTECT)
    order = models.PositiveIntegerField()
    sets = models.PositiveIntegerField()
    reps = models.PositiveIntegerField()
    weight_kg = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    rest_seconds = models.PositiveIntegerField()
    note = models.TextField(blank=True)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.exercise} in {self.workout}"
