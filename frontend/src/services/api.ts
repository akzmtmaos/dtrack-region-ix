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

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP error! status: ${response.status}`,
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
    actionTakenCode: string
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
      actionTakenCode?: string
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
}

export const apiService = new ApiService()
