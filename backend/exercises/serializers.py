from rest_framework import serializers

from .models import MUSCLE_CHOICES, Exercise

VALID_MUSCLE_CODES = {code for code, _label in MUSCLE_CHOICES}


def validate_muscle_list(value):
    invalid = set(value) - VALID_MUSCLE_CODES
    if invalid:
        raise serializers.ValidationError(f"Unknown muscle codes: {sorted(invalid)}")
    return value


class ExerciseSerializer(serializers.ModelSerializer):
    primary_muscles = serializers.ListField(
        child=serializers.CharField(), validators=[validate_muscle_list]
    )
    secondary_muscles = serializers.ListField(
        child=serializers.CharField(), validators=[validate_muscle_list], required=False
    )

    class Meta:
        model = Exercise
        fields = ["id", "name", "description", "primary_muscles", "secondary_muscles"]
