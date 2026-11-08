from datetime import timedelta

from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.dateparse import parse_date
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from users.models import User
from users.permissions import IsMonitor
from users.serializers import UserSerializer

from .models import Workout
from .serializers import WorkoutSerializer, WorkoutWriteSerializer


class MyWorkoutsView(APIView):
    def get(self, request):
        week_param = request.query_params.get("week")
        if week_param:
            reference_date = parse_date(week_param)
            if reference_date is None:
                return Response(
                    {"detail": "Invalid 'week' date, expected YYYY-MM-DD."}, status=400
                )
        else:
            reference_date = timezone.localdate()

        monday = reference_date - timedelta(days=reference_date.weekday())
        sunday = monday + timedelta(days=6)

        workouts = Workout.objects.filter(
            client=request.user, scheduled_date__range=(monday, sunday)
        )
        return Response(WorkoutSerializer(workouts, many=True).data)


class WorkoutDetailView(APIView):
    def get(self, request, pk):
        workout = get_object_or_404(Workout, pk=pk)
        if request.user not in (workout.client, workout.monitor):
            return Response({"detail": "Not found."}, status=404)
        return Response(WorkoutSerializer(workout).data)


class CompleteWorkoutView(APIView):
    def post(self, request, pk):
        workout = get_object_or_404(Workout, pk=pk)
        if request.user != workout.client:
            return Response({"detail": "Not found."}, status=404)
        workout.status = Workout.Status.DONE
        workout.save()
        return Response(WorkoutSerializer(workout).data)


class MonitorClientsView(APIView):
    permission_classes = [IsAuthenticated, IsMonitor]

    def get(self, request):
        clients = User.objects.filter(monitor=request.user, role=User.Role.CLIENT)
        return Response(UserSerializer(clients, many=True).data)


class MonitorWorkoutsView(APIView):
    permission_classes = [IsAuthenticated, IsMonitor]

    def get(self, request):
        client_id = request.query_params.get("client")
        if not client_id:
            return Response({"detail": "Missing 'client' query param."}, status=400)
        workouts = Workout.objects.filter(monitor=request.user, client_id=client_id)
        return Response(WorkoutSerializer(workouts, many=True).data)

    def post(self, request):
        serializer = WorkoutWriteSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        workout = serializer.save()
        return Response(WorkoutSerializer(workout).data, status=201)


class MonitorWorkoutDetailView(APIView):
    permission_classes = [IsAuthenticated, IsMonitor]

    def put(self, request, pk):
        workout = get_object_or_404(Workout, pk=pk, monitor=request.user)
        serializer = WorkoutWriteSerializer(
            workout, data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        workout = serializer.save()
        return Response(WorkoutSerializer(workout).data)
