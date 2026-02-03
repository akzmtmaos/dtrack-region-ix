from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import action_required, action_officer, action_taken, document_type, document_action_required_days, office, region, user_levels
from .views import document_source, document_destination

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
    
    # Document Type endpoints
    path('document-type/', document_type.document_type_list, name='document-type-list'),
    path('document-type/create/', document_type.document_type_create, name='document-type-create'),
    path('document-type/<int:item_id>/', document_type.document_type_update, name='document-type-update'),
    path('document-type/<int:item_id>/delete/', document_type.document_type_delete, name='document-type-delete'),
    path('document-type/bulk-delete/', document_type.document_type_bulk_delete, name='document-type-bulk-delete'),
    
    # Document Action Required Days endpoints
    path('document-action-required-days/', document_action_required_days.document_action_required_days_list, name='document-action-required-days-list'),
    path('document-action-required-days/create/', document_action_required_days.document_action_required_days_create, name='document-action-required-days-create'),
    path('document-action-required-days/<int:item_id>/', document_action_required_days.document_action_required_days_update, name='document-action-required-days-update'),
    path('document-action-required-days/<int:item_id>/delete/', document_action_required_days.document_action_required_days_delete, name='document-action-required-days-delete'),
    path('document-action-required-days/bulk-delete/', document_action_required_days.document_action_required_days_bulk_delete, name='document-action-required-days-bulk-delete'),
    
    # Office endpoints
    path('office/', office.office_list, name='office-list'),
    path('office/create/', office.office_create, name='office-create'),
    path('office/<int:item_id>/', office.office_update, name='office-update'),
    path('office/<int:item_id>/delete/', office.office_delete, name='office-delete'),
    path('office/bulk-delete/', office.office_bulk_delete, name='office-bulk-delete'),
    
    # Region endpoints
    path('region/', region.region_list, name='region-list'),
    path('region/create/', region.region_create, name='region-create'),
    path('region/<int:item_id>/', region.region_update, name='region-update'),
    path('region/<int:item_id>/delete/', region.region_delete, name='region-delete'),
    path('region/bulk-delete/', region.region_bulk_delete, name='region-bulk-delete'),
    
    # User Levels endpoints
    path('user-levels/', user_levels.user_levels_list, name='user-levels-list'),
    path('user-levels/create/', user_levels.user_levels_create, name='user-levels-create'),
    path('user-levels/<int:item_id>/', user_levels.user_levels_update, name='user-levels-update'),
    path('user-levels/<int:item_id>/delete/', user_levels.user_levels_delete, name='user-levels-delete'),
    path('user-levels/bulk-delete/', user_levels.user_levels_bulk_delete, name='user-levels-bulk-delete'),

    # Document Source (Outbox) endpoints
    path('document-source/', document_source.document_source_list, name='document-source-list'),
    path('document-source/create/', document_source.document_source_create, name='document-source-create'),
    path('document-source/<int:item_id>/', document_source.document_source_update, name='document-source-update'),
    path('document-source/<int:item_id>/delete/', document_source.document_source_delete, name='document-source-delete'),
    path('document-source/bulk-delete/', document_source.document_source_bulk_delete, name='document-source-bulk-delete'),

    # Document Destination endpoints
    path('document-destination/', document_destination.document_destination_list, name='document-destination-list'),
    path('document-destination/create/', document_destination.document_destination_create, name='document-destination-create'),
    path('document-destination/<int:item_id>/', document_destination.document_destination_update, name='document-destination-update'),
    path('document-destination/<int:item_id>/delete/', document_destination.document_destination_delete, name='document-destination-delete'),
    path('document-destination/bulk-delete/', document_destination.document_destination_bulk_delete, name='document-destination-bulk-delete'),
]

