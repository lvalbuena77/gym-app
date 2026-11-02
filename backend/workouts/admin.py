from django.contrib import admin

from .models import Workout, WorkoutExercise


class WorkoutExerciseInline(admin.TabularInline):
    model = WorkoutExercise
    extra = 1


@admin.register(Workout)
class WorkoutAdmin(admin.ModelAdmin):
    list_display = ("title", "client", "monitor", "scheduled_date", "status")
    list_filter = ("status", "scheduled_date")
    inlines = [WorkoutExerciseInline]
