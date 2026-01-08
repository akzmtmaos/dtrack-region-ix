from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import action_required

urlpatterns = [
    path('', include('rest_framework.urls')),
    path('health/', views.health_check, name='health-check'),
    
    # Action Required endpoints
    path('action-required/', action_required.action_required_list, name='action-required-list'),
    path('action-required/create/', action_required.action_required_create, name='action-required-create'),
    path('action-required/<int:item_id>/', action_required.action_required_update, name='action-required-update'),
    path('action-required/<int:item_id>/delete/', action_required.action_required_delete, name='action-required-delete'),
    path('action-required/bulk-delete/', action_required.action_required_bulk_delete, name='action-required-bulk-delete'),
]

