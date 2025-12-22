from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

urlpatterns = [
    path('', include('rest_framework.urls')),
    path('health/', views.health_check, name='health-check'),
]

