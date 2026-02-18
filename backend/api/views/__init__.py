# Views package - re-export submodules so urls.py can do: from .views import document_source, ...
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from . import action_required
from . import action_officer
from . import action_taken
from . import document_type
from . import document_action_required_days
from . import office
from . import region
from . import user_levels
from . import document_source
from . import document_destination


@api_view(['GET'])
def health_check(request):
    """Health check endpoint"""
    return Response({
        'status': 'healthy',
        'message': 'DOH Document Tracking System API is running'
    }, status=status.HTTP_200_OK)