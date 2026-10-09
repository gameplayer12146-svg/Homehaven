export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  [key: string]: any;
}

class ApiClient {
  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    const token = localStorage.getItem('homehaven_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: this.getHeaders()
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Request failed');
    }
    return json;
  }

  async post<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Request failed');
    }
    return json;
  }

  async put<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    const res = await fetch(endpoint, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Request failed');
    }
    return json;
  }

  async patch<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    const res = await fetch(endpoint, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Request failed');
    }
    return json;
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    const res = await fetch(endpoint, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Request failed');
    }
    return json;
  }
}

export const api = new ApiClient();
