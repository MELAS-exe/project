const API_BASE_URL = 'http://localhost:8081';

class ApiService {
  private getHeaders(includeAuth = false): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async login(username: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) throw new Error('Login failed');
    return response.json();
  }

  async getAllMissions() {
    const response = await fetch(`${API_BASE_URL}/mission/getall`, {
      headers: this.getHeaders(true),
    });

    if (!response.ok) throw new Error('Failed to fetch missions');
    return response.json();
  }

  async getMission(id: number) {
    const response = await fetch(`${API_BASE_URL}/mission/get/${id}`, {
      headers: this.getHeaders(true),
    });

    if (!response.ok) throw new Error('Failed to fetch mission');
    return response.json();
  }

  async createMission(agentId: number, data: any) {
    const response = await fetch(`${API_BASE_URL}/mission/create/${agentId}`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Failed to create mission');
    return response.json();
  }

  async updateMission(missionId: number, data: any) {
    const response = await fetch(`${API_BASE_URL}/mission/update/${missionId}`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Failed to update mission');
    return response.json();
  }

  async deleteMission(missionId: number) {
    const response = await fetch(`${API_BASE_URL}/mission/delete/${missionId}`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });

    if (!response.ok) throw new Error('Failed to delete mission');
    return response.text();
  }

  async validateMission(missionId: number) {
    const response = await fetch(`${API_BASE_URL}/admin/validateMission/${missionId}`, {
      method: 'PUT',
      headers: this.getHeaders(true),
    });

    if (!response.ok) throw new Error('Failed to validate mission');
    return response.json();
  }

  async getAllVehicules() {
    const response = await fetch(`${API_BASE_URL}/vehicule/getall`, {
      headers: this.getHeaders(true),
    });

    if (!response.ok) throw new Error('Failed to fetch vehicles');
    return response.json();
  }

  async getVehicule(id: number) {
    const response = await fetch(`${API_BASE_URL}/vehicule/get/${id}`, {
      headers: this.getHeaders(true),
    });

    if (!response.ok) throw new Error('Failed to fetch vehicle');
    return response.json();
  }

  async createVehicule(data: any) {
    const response = await fetch(`${API_BASE_URL}/vehicule/create`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Failed to create vehicle');
    return response.json();
  }

  async updateVehicule(vehiculeId: number, data: any) {
    const response = await fetch(`${API_BASE_URL}/vehicule/update/${vehiculeId}`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Failed to update vehicle');
    return response.json();
  }

  async getAffectations() {
    const response = await fetch(`${API_BASE_URL}/chef/getAffectations`, {
      headers: this.getHeaders(true),
    });

    if (!response.ok) throw new Error('Failed to fetch assignments');
    return response.json();
  }

  async getAffectation(id: number) {
    const response = await fetch(`${API_BASE_URL}/chef/getAffectation/${id}`, {
      headers: this.getHeaders(true),
    });

    if (!response.ok) throw new Error('Failed to fetch assignment');
    return response.json();
  }

  async createAffectation(chefId: number, chauffeurId: number, vehiculeId: number, missionId: number) {
    const response = await fetch(
      `${API_BASE_URL}/chef/createAffectation/by${chefId}/chauffeur${chauffeurId}/vehicule${vehiculeId}/mission${missionId}`,
      {
        method: 'POST',
        headers: this.getHeaders(true),
      }
    );

    if (!response.ok) throw new Error('Failed to create assignment');
    return response.json();
  }

  async deleteAffectation(affectationId: number) {
    const response = await fetch(`${API_BASE_URL}/chef/deleteAffectation/${affectationId}`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });

    if (!response.ok) throw new Error('Failed to delete assignment');
    return response.json();
  }

  async createRapport(affectationId: number, data: any) {
    const response = await fetch(`${API_BASE_URL}/rapport/create/forAffectation/${affectationId}`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Failed to create report');
    return response.json();
  }
}

export const apiService = new ApiService();
