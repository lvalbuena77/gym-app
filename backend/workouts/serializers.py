from rest_framework import serializers

from exercises.serializers import ExerciseSerializer
from users.models import User

from .models import Workout, WorkoutExercise


class WorkoutExerciseSerializer(serializers.ModelSerializer):
    exercise = ExerciseSerializer(read_only=True)

    class Meta:
        model = WorkoutExercise
        fields = ["id", "exercise", "order", "sets", "reps", "weight_kg", "rest_seconds", "note"]


class WorkoutSerializer(serializers.ModelSerializer):
    exercises = WorkoutExerciseSerializer(many=True, read_only=True)
    client_name = serializers.CharField(source="client.get_full_name", read_only=True)
    monitor_name = serializers.CharField(source="monitor.get_full_name", read_only=True)

    class Meta:
        model = Workout
        fields = [
            "id", "client", "client_name", "monitor", "monitor_name",
            "title", "scheduled_date", "status", "exercises",
        ]


class WorkoutExerciseWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkoutExercise
        fields = ["exercise", "order", "sets", "reps", "weight_kg", "rest_seconds", "note"]


class WorkoutWriteSerializer(serializers.ModelSerializer):
    exercises = WorkoutExerciseWriteSerializer(many=True)

    class Meta:
        model = Workout
        fields = ["id", "client", "title", "scheduled_date", "status", "exercises"]

    def validate_client(self, client):
        monitor = self.context["request"].user
        if client.role != User.Role.CLIENT or client.monitor_id != monitor.id:
            raise serializers.ValidationError("This client is not assigned to you.")
        return client

    def create(self, validated_data):
        exercises_data = validated_data.pop("exercises")
        workout = Workout.objects.create(
            monitor=self.context["request"].user, **validated_data
        )
        for exercise_data in exercises_data:
            WorkoutExercise.objects.create(workout=workout, **exercise_data)
        return workout

    def update(self, instance, validated_data):
        exercises_data = validated_data.pop("exercises", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if exercises_data is not None:
            instance.exercises.all().delete()
            for exercise_data in exercises_data:
                WorkoutExercise.objects.create(workout=instance, **exercise_data)
        return instance
