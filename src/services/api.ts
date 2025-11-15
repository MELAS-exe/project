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

  // ==================== Authentication ====================

  async login(username: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) throw new Error('Login failed');
    return response.json();
  }

  // ==================== Admins ====================

  async getAdmins(page = 0, size = 100) {
    const response = await fetch(
      `${API_BASE_URL}/admins?page=${page}&size=${size}`,
      {
        headers: this.getHeaders(true),
      }
    );

    if (!response.ok) throw new Error('Failed to fetch admins');
    const data = await response.json();
    return data._embedded?.admins || [];
  }

  async getAdmin(id: number) {
    const response = await fetch(`${API_BASE_URL}/admins/${id}`, {
      headers: this.getHeaders(true),
    });

    if (!response.ok) throw new Error('Failed to fetch admin');
    return response.json();
  }

  async createAdmin(adminData: {
    username: string;
    password: string;
    prenom: string;
    nom: string;
    role: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/auth/register/admin`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(adminData),
    });

    if (!response.ok) throw new Error('Failed to create admin');
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    return response.text();
  }

  async updateAdmin(
    id: number,
    adminData: {
      username: string;
      password?: string;
      prenom: string;
      nom: string;
      role: string;
    }
  ) {
    const response = await fetch(`${API_BASE_URL}/admins/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(adminData),
    });

    if (!response.ok) throw new Error('Failed to update admin');
    return response.json();
  }

  async deleteAdmin(id: number) {
    const response = await fetch(`${API_BASE_URL}/admins/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });

    if (!response.ok) throw new Error('Failed to delete admin');
  }

  // ==================== Agents ====================

  async getAgents(page = 0, size = 100) {
    const response = await fetch(
      `${API_BASE_URL}/agents?page=${page}&size=${size}`,
      {
        headers: this.getHeaders(true),
      }
    );

    if (!response.ok) throw new Error('Failed to fetch agents');
    const data = await response.json();
    return data._embedded?.agents || [];
  }

  async getAgent(id: number) {
    const response = await fetch(`${API_BASE_URL}/agents/${id}`, {
      headers: this.getHeaders(true),
    });

    if (!response.ok) throw new Error('Failed to fetch agent');
    return response.json();
  }

  async createAgent(agentData: {
    prenom: string;
    nom: string;
    username: string;
    password: string;
    adresse: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/auth/register/agent`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(agentData),
    });

    if (!response.ok) throw new Error('Failed to create agent');
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    return response.text();
  }

  async updateAgent(
    id: number,
    agentData: {
      prenom: string;
      nom: string;
      username: string;
      password?: string;
      adresse: string;
    }
  ) {
    const response = await fetch(`${API_BASE_URL}/agents/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(agentData),
    });

    if (!response.ok) throw new Error('Failed to update agent');
    return response.json();
  }

  async deleteAgent(id: number) {
    const response = await fetch(`${API_BASE_URL}/agents/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });

    if (!response.ok) throw new Error('Failed to delete agent');
  }

  // ==================== Chauffeurs ====================

  async getChauffeurs(page = 0, size = 100) {
    const response = await fetch(
      `${API_BASE_URL}/chauffeurs?page=${page}&size=${size}`,
      {
        headers: this.getHeaders(true),
      }
    );

    if (!response.ok) throw new Error('Failed to fetch chauffeurs');
    const data = await response.json();
    return data._embedded?.chauffeurs || [];
  }

  async getChauffeur(id: number) {
    const response = await fetch(`${API_BASE_URL}/chauffeurs/${id}`, {
      headers: this.getHeaders(true),
    });

    if (!response.ok) throw new Error('Failed to fetch chauffeur');
    return response.json();
  }

  async createChauffeur(chauffeurData: {
    nom: string;
    prenom: string;
    username: string;
    password: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/auth/register/chauffeur`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(chauffeurData),
    });

    if (!response.ok) throw new Error('Failed to create chauffeur');
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    return response.text();
  }

  async updateChauffeur(
    id: number,
    chauffeurData: {
      nom: string;
      prenom: string;
      username: string;
      password?: string;
    }
  ) {
    const response = await fetch(`${API_BASE_URL}/chauffeurs/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(chauffeurData),
    });

    if (!response.ok) throw new Error('Failed to update chauffeur');
    return response.json();
  }

  async deleteChauffeur(id: number) {
    const response = await fetch(`${API_BASE_URL}/chauffeurs/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });

    if (!response.ok) throw new Error('Failed to delete chauffeur');
  }

  // ==================== Chef Garages ====================

  async getChefGarages(page = 0, size = 100) {
    const response = await fetch(
      `${API_BASE_URL}/chefGarages?page=${page}&size=${size}`,
      {
        headers: this.getHeaders(true),
      }
    );

    if (!response.ok) throw new Error('Failed to fetch chef garages');
    const data = await response.json();
    return data._embedded?.chefGarages || [];
  }

  async getChefGarage(id: number) {
    const response = await fetch(`${API_BASE_URL}/chefGarages/${id}`, {
      headers: this.getHeaders(true),
    });

    if (!response.ok) throw new Error('Failed to fetch chef garage');
    return response.json();
  }

  async createChefGarage(chefGarageData: {
    nom: string;
    prenom: string;
    username: string;
    password: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/auth/register/chefGarage`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(chefGarageData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create chef garage: ${response.status} - ${errorText}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    return response.text();
  }

  async updateChefGarage(
    id: number,
    chefGarageData: {
      nom: string;
      prenom: string;
      username: string;
      password?: string;
    }
  ) {
    const response = await fetch(`${API_BASE_URL}/chefGarages/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(chefGarageData),
    });

    if (!response.ok) throw new Error('Failed to update chef garage');
    return response.json();
  }

  async deleteChefGarage(id: number) {
    const response = await fetch(`${API_BASE_URL}/chefGarages/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });

    if (!response.ok) throw new Error('Failed to delete chef garage');
  }

  // ==================== Missions ====================

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
    const response = await fetch(
      `${API_BASE_URL}/mission/update/${missionId}`,
      {
        method: 'PUT',
        headers: this.getHeaders(true),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) throw new Error('Failed to update mission');
    return response.json();
  }

  async deleteMission(missionId: number) {
    const response = await fetch(
      `${API_BASE_URL}/mission/delete/${missionId}`,
      {
        method: 'DELETE',
        headers: this.getHeaders(true),
      }
    );

    if (!response.ok) throw new Error('Failed to delete mission');
    return response.text();
  }

  async validateMission(missionId: number) {
    const response = await fetch(
      `${API_BASE_URL}/admin/validateMission/${missionId}`,
      {
        method: 'PUT',
        headers: this.getHeaders(true),
      }
    );

    if (!response.ok) throw new Error('Failed to validate mission');
    return response.json();
  }

  // ==================== Vehicules ====================

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
    const response = await fetch(
      `${API_BASE_URL}/vehicule/update/${vehiculeId}`,
      {
        method: 'PUT',
        headers: this.getHeaders(true),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) throw new Error('Failed to update vehicle');
    return response.json();
  }

  // ==================== Affectations ====================

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

  async createAffectation(
    chefId: number,
    chauffeurId: number,
    vehiculeId: number,
    missionId: number
  ) {
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
    const response = await fetch(
      `${API_BASE_URL}/chef/deleteAffectation/${affectationId}`,
      {
        method: 'DELETE',
        headers: this.getHeaders(true),
      }
    );

    if (!response.ok) throw new Error('Failed to delete assignment');
    return response.json();
  }

  // ==================== Rapports ====================

  async createRapport(affectationId: number, data: any) {
    const response = await fetch(
      `${API_BASE_URL}/rapport/create/forAffectation/${affectationId}`,
      {
        method: 'POST',
        headers: this.getHeaders(true),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) throw new Error('Failed to create report');
    return response.json();
  }
}

export const apiService = new ApiService();