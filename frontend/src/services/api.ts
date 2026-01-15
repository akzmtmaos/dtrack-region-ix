/**
 * API service for making HTTP requests to the backend
 */

const API_BASE_URL = '/api'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      // Check if response has content before parsing JSON
      const contentType = response.headers.get('content-type')
      const hasJsonContent = contentType && contentType.includes('application/json')
      const text = await response.text()
      
      let data: any = {}
      if (text && hasJsonContent) {
        try {
          data = JSON.parse(text)
        } catch (parseError) {
          // If JSON parsing fails, return error
          return {
            success: false,
            error: 'Invalid JSON response from server',
          }
        }
      } else if (text && !hasJsonContent) {
        // If response is not JSON but has content, treat as error message
        return {
          success: false,
          error: text || `HTTP error! status: ${response.status}`,
        }
      }

      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.message || `HTTP error! status: ${response.status}`,
        }
      }

      return {
        success: true,
        ...data,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      }
    }
  }

  // Action Required endpoints
  async getActionRequired(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/action-required/')
  }

  async createActionRequired(data: { actionRequired: string }): Promise<ApiResponse<any>> {
    return this.request<any>('/action-required/create/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateActionRequired(id: number, data: { actionRequired: string }): Promise<ApiResponse<any>> {
    return this.request<any>(`/action-required/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteActionRequired(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/action-required/${id}/delete/`, {
      method: 'DELETE',
    })
  }

  async bulkDeleteActionRequired(ids: number[]): Promise<ApiResponse<void>> {
    return this.request<void>('/action-required/bulk-delete/', {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
    })
  }

  // Action Officer endpoints
  async getActionOfficer(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/action-officer/')
  }

  async createActionOfficer(data: {
    employeeCode: string
    lastName: string
    firstName: string
    middleName: string
    office: string
    userPassword: string
    userLevel: string
    officeRepresentative: string
  }): Promise<ApiResponse<any>> {
    return this.request<any>('/action-officer/create/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateActionOfficer(
    id: number,
    data: {
      employeeCode?: string
      lastName?: string
      firstName?: string
      middleName?: string
      office?: string
      userPassword?: string
      userLevel?: string
      officeRepresentative?: string
    }
  ): Promise<ApiResponse<any>> {
    return this.request<any>(`/action-officer/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteActionOfficer(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/action-officer/${id}/delete/`, {
      method: 'DELETE',
    })
  }

  async bulkDeleteActionOfficer(ids: number[]): Promise<ApiResponse<void>> {
    return this.request<void>('/action-officer/bulk-delete/', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    })
  }

  // Action Taken endpoints
  async getActionTaken(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/action-taken/')
  }

  async createActionTaken(data: {
    actionTaken: string
  }): Promise<ApiResponse<any>> {
    return this.request<any>('/action-taken/create/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateActionTaken(
    id: number,
    data: {
      actionTaken?: string
    }
  ): Promise<ApiResponse<any>> {
    return this.request<any>(`/action-taken/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteActionTaken(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/action-taken/${id}/delete/`, {
      method: 'DELETE',
    })
  }

  async bulkDeleteActionTaken(ids: number[]): Promise<ApiResponse<void>> {
    return this.request<void>('/action-taken/bulk-delete/', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    })
  }

  // Document Type endpoints
  async getDocumentType(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/document-type/')
  }

  async createDocumentType(data: {
    documentType: string
  }): Promise<ApiResponse<any>> {
    return this.request<any>('/document-type/create/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateDocumentType(
    id: number,
    data: {
      documentType?: string
    }
  ): Promise<ApiResponse<any>> {
    return this.request<any>(`/document-type/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteDocumentType(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/document-type/${id}/delete/`, {
      method: 'DELETE',
    })
  }

  async bulkDeleteDocumentType(ids: number[]): Promise<ApiResponse<void>> {
    return this.request<void>('/document-type/bulk-delete/', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    })
  }

  // Document Action Required Days endpoints
  async getDocumentActionRequiredDays(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/document-action-required-days/')
  }

  async createDocumentActionRequiredDays(data: {
    documentType: string
    actionRequired: string
    requiredDays: number
  }): Promise<ApiResponse<any>> {
    return this.request<any>('/document-action-required-days/create/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateDocumentActionRequiredDays(
    id: number,
    data: {
      documentType?: string
      actionRequired?: string
      requiredDays?: number
    }
  ): Promise<ApiResponse<any>> {
    return this.request<any>(`/document-action-required-days/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteDocumentActionRequiredDays(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/document-action-required-days/${id}/delete/`, {
      method: 'DELETE',
    })
  }

  async bulkDeleteDocumentActionRequiredDays(ids: number[]): Promise<ApiResponse<void>> {
    return this.request<void>('/document-action-required-days/bulk-delete/', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    })
  }

  // Office endpoints
  async getOffice(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/office/')
  }

  async createOffice(data: {
    office: string
    region: string
    shortName: string
    headOffice: string
  }): Promise<ApiResponse<any>> {
    return this.request<any>('/office/create/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateOffice(
    id: number,
    data: {
      office?: string
      region?: string
      shortName?: string
      headOffice?: string
    }
  ): Promise<ApiResponse<any>> {
    return this.request<any>(`/office/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteOffice(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/office/${id}/delete/`, {
      method: 'DELETE',
    })
  }

  async bulkDeleteOffice(ids: number[]): Promise<ApiResponse<void>> {
    return this.request<void>('/office/bulk-delete/', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    })
  }

  // Region endpoints
  async getRegion(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/region/')
  }

  async createRegion(data: {
    regionName: string
    nscbCode: string
    nscbName: string
    addedBy: string
    status: string
  }): Promise<ApiResponse<any>> {
    return this.request<any>('/region/create/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateRegion(
    id: number,
    data: {
      regionName?: string
      nscbCode?: string
      nscbName?: string
      addedBy?: string
      status?: string
    }
  ): Promise<ApiResponse<any>> {
    return this.request<any>(`/region/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteRegion(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/region/${id}/delete/`, {
      method: 'DELETE',
    })
  }

  async bulkDeleteRegion(ids: number[]): Promise<ApiResponse<void>> {
    return this.request<void>('/region/bulk-delete/', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    })
  }

  // User Levels endpoints
  async getUserLevels(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/user-levels/')
  }

  async createUserLevel(data: { userLevelName: string }): Promise<ApiResponse<any>> {
    return this.request<any>('/user-levels/create/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateUserLevel(id: number, data: { userLevelName: string }): Promise<ApiResponse<any>> {
    return this.request<any>(`/user-levels/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteUserLevel(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/user-levels/${id}/delete/`, {
      method: 'DELETE',
    })
  }

  async bulkDeleteUserLevels(ids: number[]): Promise<ApiResponse<void>> {
    return this.request<void>('/user-levels/bulk-delete/', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    })
  }
}

export const apiService = new ApiService()
