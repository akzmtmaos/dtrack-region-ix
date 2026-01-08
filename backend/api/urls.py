from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import action_required, action_officer, action_taken

urlpatterns = [
    path('', include('rest_framework.urls')),
    path('health/', views.health_check, name='health-check'),
    
    # Action Required endpoints
    path('action-required/', action_required.action_required_list, name='action-required-list'),
    path('action-required/create/', action_required.action_required_create, name='action-required-create'),
    path('action-required/<int:item_id>/', action_required.action_required_update, name='action-required-update'),
    path('action-required/<int:item_id>/delete/', action_required.action_required_delete, name='action-required-delete'),
    path('action-required/bulk-delete/', action_required.action_required_bulk_delete, name='action-required-bulk-delete'),
    
    # Action Officer endpoints
    path('action-officer/', action_officer.action_officer_list, name='action-officer-list'),
    path('action-officer/create/', action_officer.action_officer_create, name='action-officer-create'),
    path('action-officer/<int:item_id>/', action_officer.action_officer_update, name='action-officer-update'),
    path('action-officer/<int:item_id>/delete/', action_officer.action_officer_delete, name='action-officer-delete'),
    path('action-officer/bulk-delete/', action_officer.action_officer_bulk_delete, name='action-officer-bulk-delete'),
    
    # Action Taken endpoints
    path('action-taken/', action_taken.action_taken_list, name='action-taken-list'),
    path('action-taken/create/', action_taken.action_taken_create, name='action-taken-create'),
    path('action-taken/<int:item_id>/', action_taken.action_taken_update, name='action-taken-update'),
    path('action-taken/<int:item_id>/delete/', action_taken.action_taken_delete, name='action-taken-delete'),
    path('action-taken/bulk-delete/', action_taken.action_taken_bulk_delete, name='action-taken-bulk-delete'),
]

