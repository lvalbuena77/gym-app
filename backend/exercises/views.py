from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from users.permissions import IsMonitor

from .models import Exercise
from .serializers import ExerciseSerializer


class ExerciseListView(APIView):
    permission_classes = [IsAuthenticated, IsMonitor]

    def get(self, request):
        exercises = Exercise.objects.all()
        return Response(ExerciseSerializer(exercises, many=True).data)
