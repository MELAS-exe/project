const API_BASE_URL = 'http://localhost:8081';

class ApiService {
    // Small HAL helpers to keep UI contracts simple
    private extractIdFromSelfHref(entity: any): number | undefined {
        try {
            const href: string | undefined = entity?._links?.self?.href;
            if (!href) return entity?.id;
            const parts = href.split('/').filter(Boolean);
            const last = parts[parts.length - 1];
            const id = Number(last);
            return Number.isFinite(id) ? id : entity?.id;
        } catch {
            return entity?.id;
        }
    }

    // Remove empty strings / null / undefined from PATCH payloads
    private sanitizePatchBody<T extends Record<string, any>>(obj: T): Partial<T> {
        const clean: Record<string, any> = {};
        for (const [key, value] of Object.entries(obj)) {
            if (value === undefined || value === null) continue;
            if (typeof value === 'string' && value.trim() === '') continue;
            clean[key] = value;
        }
        return clean;
    }

    private mapHalCollection(items: any[] | undefined): any[] {
        if (!Array.isArray(items)) return [];
        return items.map((it) => ({ id: this.extractIdFromSelfHref(it), ...it }));
    }
    // Try PATCH with application/json then fallback to application/merge-patch+json for SDR quirks
    private async patchWithFallback(url: string, body: any, includeAuth = true) {
        // First try application/json
        let response = await fetch(url, {
            method: 'PATCH',
            headers: this.getHeaders(includeAuth, { contentType: 'application/json' }),
            body: JSON.stringify(body),
        });

        if (response.ok) return response;

        // If server complains about payload (400) or media type (415), retry with merge-patch
        if (response.status === 400 || response.status === 415) {
            response = await fetch(url, {
                method: 'PATCH',
                headers: this.getHeaders(includeAuth, { mergePatch: true }),
                body: JSON.stringify(body),
            });
        }

        return response;
    }
    private getHeaders(
        includeAuth = false,
        options?: { mergePatch?: boolean; contentType?: string }
    ): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': options?.contentType
                ? options.contentType
                : options?.mergePatch
                ? 'application/merge-patch+json'
                : 'application/json',
            'Accept': 'application/hal+json'
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

    async test() {
        const response = await fetch(`${API_BASE_URL}/auth/test`, {
            method: 'POST',
            headers: this.getHeaders(true),
        });

        if (!response.ok) throw new Error('Test failed');
        return response.text();
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
        return this.mapHalCollection(data._embedded?.admins);
    }

    async getAdmin(id: number) {
        const response = await fetch(`${API_BASE_URL}/admins/${id}`, {
            headers: this.getHeaders(true),
        });

        if (!response.ok) throw new Error('Failed to fetch admin');
        const data = await response.json();
        return { id: this.extractIdFromSelfHref(data), ...data };
    }

    async getAdminByUsername(username: string) {
        const response = await fetch(
            `${API_BASE_URL}/admins/search/findByUsername?username=${encodeURIComponent(username)}`,
            {
                headers: this.getHeaders(true),
            }
        );

        if (!response.ok) throw new Error('Failed to fetch admin by username');
        const data = await response.json();
        return { id: this.extractIdFromSelfHref(data), ...data };
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
        const response = await this.patchWithFallback(
            `${API_BASE_URL}/admins/${id}`,
            this.sanitizePatchBody(adminData),
            true
        );

        if (!response.ok) {
            const text = await response.text().catch(() => '');
            throw new Error(`Failed to update admin: ${response.status} ${text}`);
        }
        if (response.status === 204) return null;
        const ct = response.headers.get('content-type') || '';
        return ct.includes('application/json') ? response.json() : null;
    }

    async patchAdmin(id: number, adminData: Partial<{
        username: string;
        password: string;
        prenom: string;
        nom: string;
        role: string;
    }>) {
        const response = await fetch(`${API_BASE_URL}/admins/${id}`, {
            method: 'PATCH',
            headers: this.getHeaders(true, { mergePatch: true }),
            body: JSON.stringify(adminData),
        });

        if (!response.ok) throw new Error('Failed to patch admin');
        return response.json();
    }

    async deleteAdmin(id: number) {
        const response = await fetch(`${API_BASE_URL}/admins/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders(true),
        });

        if (!response.ok) throw new Error('Failed to delete admin');
    }

    async getAdminMissions(adminId: number) {
        const response = await fetch(`${API_BASE_URL}/admins/${adminId}/missions`, {
            headers: this.getHeaders(true),
        });

        if (!response.ok) throw new Error('Failed to fetch admin missions');
        const data = await response.json();
        return data._embedded?.missions || [];
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
        return this.mapHalCollection(data._embedded?.agents);
    }

    async getAgent(id: number) {
        const response = await fetch(`${API_BASE_URL}/agents/${id}`, {
            headers: this.getHeaders(true),
        });

        if (!response.ok) throw new Error('Failed to fetch agent');
        const data = await response.json();
        return { id: this.extractIdFromSelfHref(data), ...data };
    }

    async getAgentByUsername(username: string) {
        const response = await fetch(
            `${API_BASE_URL}/agents/search/findByUsername?username=${encodeURIComponent(username)}`,
            {
                headers: this.getHeaders(true),
            }
        );

        if (!response.ok) throw new Error('Failed to fetch agent by username');
        const data = await response.json();
        return { id: this.extractIdFromSelfHref(data), ...data };
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
        const response = await this.patchWithFallback(
            `${API_BASE_URL}/agents/${id}`,
            this.sanitizePatchBody(agentData),
            true
        );

        if (!response.ok) {
            const text = await response.text().catch(() => '');
            throw new Error(`Failed to update agent: ${response.status} ${text}`);
        }
        if (response.status === 204) return null;
        const ct = response.headers.get('content-type') || '';
        return ct.includes('application/json') ? response.json() : null;
    }

    async patchAgent(id: number, agentData: Partial<{
        prenom: string;
        nom: string;
        username: string;
        password: string;
        adresse: string;
    }>) {
        const response = await fetch(`${API_BASE_URL}/agents/${id}`, {
            method: 'PATCH',
            headers: this.getHeaders(true, { mergePatch: true }),
            body: JSON.stringify(agentData),
        });

        if (!response.ok) throw new Error('Failed to patch agent');
        return response.json();
    }

    async deleteAgent(id: number) {
        const response = await fetch(`${API_BASE_URL}/agents/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders(true),
        });

        if (!response.ok) throw new Error('Failed to delete agent');
    }

    async getAgentMissions(agentId: number) {
        const response = await fetch(`${API_BASE_URL}/agents/${agentId}/missions`, {
            headers: this.getHeaders(true),
        });

        if (!response.ok) throw new Error('Failed to fetch agent missions');
        const data = await response.json();
        return data._embedded?.missions || [];
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
        return this.mapHalCollection(data._embedded?.chauffeurs);
    }

    async getChauffeur(id: number) {
        const response = await fetch(`${API_BASE_URL}/chauffeurs/${id}`, {
            headers: this.getHeaders(true),
        });

        if (!response.ok) throw new Error('Failed to fetch chauffeur');
        const data = await response.json();
        return { id: this.extractIdFromSelfHref(data), ...data };
    }

    async getChauffeurByUsername(username: string) {
        const response = await fetch(
            `${API_BASE_URL}/chauffeurs/search/findByUsername?username=${encodeURIComponent(username)}`,
            {
                headers: this.getHeaders(true),
            }
        );

        if (!response.ok) throw new Error('Failed to fetch chauffeur by username');
        const data = await response.json();
        return { id: this.extractIdFromSelfHref(data), ...data };
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
        const response = await this.patchWithFallback(
            `${API_BASE_URL}/chauffeurs/${id}`,
            this.sanitizePatchBody(chauffeurData),
            true
        );

        if (!response.ok) {
            const text = await response.text().catch(() => '');
            throw new Error(`Failed to update chauffeur: ${response.status} ${text}`);
        }
        if (response.status === 204) return null;
        const ct = response.headers.get('content-type') || '';
        return ct.includes('application/json') ? response.json() : null;
    }

    async patchChauffeur(id: number, chauffeurData: Partial<{
        nom: string;
        prenom: string;
        username: string;
        password: string;
    }>) {
        const response = await fetch(`${API_BASE_URL}/chauffeurs/${id}`, {
            method: 'PATCH',
            headers: this.getHeaders(true, { mergePatch: true }),
            body: JSON.stringify(chauffeurData),
        });

        if (!response.ok) throw new Error('Failed to patch chauffeur');
        return response.json();
    }

    async deleteChauffeur(id: number) {
        const response = await fetch(`${API_BASE_URL}/chauffeurs/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders(true),
        });

        if (!response.ok) throw new Error('Failed to delete chauffeur');
    }

    async getChauffeurAffectations(chauffeurId: number) {
        const response = await fetch(`${API_BASE_URL}/chauffeurs/${chauffeurId}/affectations`, {
            headers: this.getHeaders(true),
        });

        if (!response.ok) throw new Error('Failed to fetch chauffeur affectations');
        const data = await response.json();
        return data._embedded?.affectations || [];
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
        return this.mapHalCollection(data._embedded?.chefGarages);
    }

    async getChefGarage(id: number) {
        const response = await fetch(`${API_BASE_URL}/chefGarages/${id}`, {
            headers: this.getHeaders(true),
        });

        if (!response.ok) throw new Error('Failed to fetch chef garage');
        const data = await response.json();
        return { id: this.extractIdFromSelfHref(data), ...data };
    }

    async getChefGarageByUsername(username: string) {
        const response = await fetch(
            `${API_BASE_URL}/chefGarages/search/findByUsername?username=${encodeURIComponent(username)}`,
            {
                headers: this.getHeaders(true),
            }
        );

        if (!response.ok) throw new Error('Failed to fetch chef garage by username');
        const data = await response.json();
        return { id: this.extractIdFromSelfHref(data), ...data };
    }

    async createChefGarage(chefGarageData: {
        nom: string;
        prenom: string;
        username: string;
        password: string;
    }) {
        const response = await fetch(`${API_BASE_URL}/auth/register/chef`, {
            method: 'POST',
            headers: this.getHeaders(),
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
        const response = await this.patchWithFallback(
            `${API_BASE_URL}/chefGarages/${id}`,
            this.sanitizePatchBody(chefGarageData),
            true
        );

        if (!response.ok) {
            const text = await response.text().catch(() => '');
            throw new Error(`Failed to update chef garage: ${response.status} ${text}`);
        }
        if (response.status === 204) return null;
        const ct = response.headers.get('content-type') || '';
        return ct.includes('application/json') ? response.json() : null;
    }

    async patchChefGarage(id: number, chefGarageData: Partial<{
        nom: string;
        prenom: string;
        username: string;
        password: string;
    }>) {
        const response = await fetch(`${API_BASE_URL}/chefGarages/${id}`, {
            method: 'PATCH',
            headers: this.getHeaders(true, { mergePatch: true }),
            body: JSON.stringify(chefGarageData),
        });

        if (!response.ok) throw new Error('Failed to patch chef garage');
        return response.json();
    }

    async deleteChefGarage(id: number) {
        const response = await fetch(`${API_BASE_URL}/chefGarages/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders(true),
        });

        if (!response.ok) throw new Error('Failed to delete chef garage');
    }

    async getChefGarageAffectations(chefGarageId: number) {
        const response = await fetch(`${API_BASE_URL}/chefGarages/${chefGarageId}/affectations`, {
            headers: this.getHeaders(true),
        });

        if (!response.ok) throw new Error('Failed to fetch chef garage affectations');
        const data = await response.json();
        return this.mapHalCollection(data._embedded?.affectations);
    }

    // ==================== Missions ====================

    async getMissions(page = 0, size = 100) {
        const response = await fetch(
            `${API_BASE_URL}/missions?page=${page}&size=${size}`,
            {
                headers: this.getHeaders(true),
            }
        );

        if (!response.ok) throw new Error('Failed to fetch missions');
        const data = await response.json();
        return this.mapHalCollection(data._embedded?.missions);
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

    async createMission(agentId: number, missionData: {
        titre: string;
        detail: string;
        date: string; // ISO format date-time
        destination: string;
        statut?: boolean;
    }) {
        const response = await fetch(`${API_BASE_URL}/mission/create/${agentId}`, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify(missionData),
        });

        if (!response.ok) throw new Error('Failed to create mission');
        return response.json();
    }

    async updateMission(missionId: number, missionData: {
        titre: string;
        detail: string;
        date: string; // ISO format date-time
        destination: string;
        statut?: boolean;
    }) {
        const response = await fetch(
            `${API_BASE_URL}/mission/update/${missionId}`,
            {
                method: 'PUT',
                headers: this.getHeaders(true),
                body: JSON.stringify(missionData),
            }
        );

        if (!response.ok) throw new Error('Failed to update mission');
        return response.json();
    }

    async patchMission(id: number, missionData: Partial<{
        titre: string;
        detail: string;
        date: string;
        destination: string;
        statut: boolean;
    }>) {
        const response = await fetch(`${API_BASE_URL}/missions/${id}`, {
            method: 'PATCH',
            headers: this.getHeaders(true, { mergePatch: true }),
            body: JSON.stringify(missionData),
        });

        if (!response.ok) throw new Error('Failed to patch mission');
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

    async deleteMissionByAdmin(missionId: number) {
        const response = await fetch(
            `${API_BASE_URL}/admin/deleteMission/${missionId}`,
            {
                method: 'DELETE',
                headers: this.getHeaders(true),
            }
        );

        if (!response.ok) throw new Error('Failed to delete mission');
        return response.json();
    }

    async getMissionAgent(missionId: number) {
        const response = await fetch(`${API_BASE_URL}/missions/${missionId}/agent`, {
            headers: this.getHeaders(true),
        });

        if (!response.ok) throw new Error('Failed to fetch mission agent');
        return response.json();
    }

    async getMissionAdmin(missionId: number) {
        const response = await fetch(`${API_BASE_URL}/missions/${missionId}/admin`, {
            headers: this.getHeaders(true),
        });

        if (!response.ok) throw new Error('Failed to fetch mission admin');
        return response.json();
    }

    async getMissionAffectation(missionId: number) {
        const response = await fetch(`${API_BASE_URL}/missions/${missionId}/affectation`, {
            headers: this.getHeaders(true),
        });

        if (!response.ok) throw new Error('Failed to fetch mission affectation');
        return response.json();
    }

    // ==================== Vehicules ====================

    async getVehicules(page = 0, size = 100) {
        const response = await fetch(
            `${API_BASE_URL}/vehicules?page=${page}&size=${size}`,
            {
                headers: this.getHeaders(true),
            }
        );

        if (!response.ok) throw new Error('Failed to fetch vehicles');
        const data = await response.json();
        return this.mapHalCollection(data._embedded?.vehicules);
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
        const data = await response.json();
        return { id: this.extractIdFromSelfHref(data), ...data };
    }

    async createVehicule(vehiculeData: {
        plaque: string;
        type: string;
        capacite: number;
    }) {
        const response = await fetch(`${API_BASE_URL}/vehicule/create`, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify(vehiculeData),
        });

        if (!response.ok) throw new Error('Failed to create vehicle');
        return response.json();
    }

    async updateVehicule(vehiculeId: number, vehiculeData: {
        plaque: string;
        type: string;
        capacite: number;
    }) {
        const response = await fetch(
            `${API_BASE_URL}/vehicule/update/${vehiculeId}`,
            {
                method: 'PUT',
                headers: this.getHeaders(true),
                body: JSON.stringify(vehiculeData),
            }
        );

        if (!response.ok) throw new Error('Failed to update vehicle');
        return response.json();
    }

    async patchVehicule(id: number, vehiculeData: Partial<{
        plaque: string;
        type: string;
        capacite: number;
    }>) {
        const response = await fetch(`${API_BASE_URL}/vehicules/${id}`, {
            method: 'PATCH',
            headers: this.getHeaders(true, { mergePatch: true }),
            body: JSON.stringify(vehiculeData),
        });

        if (!response.ok) throw new Error('Failed to patch vehicle');
        return response.json();
    }

    async deleteVehicule(id: number) {
        const response = await fetch(`${API_BASE_URL}/vehicules/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders(true),
        });

        if (!response.ok) throw new Error('Failed to delete vehicle');
    }

    async getVehiculeAffectations(vehiculeId: number) {
        const response = await fetch(`${API_BASE_URL}/vehicules/${vehiculeId}/affectations`, {
            headers: this.getHeaders(true),
        });

        if (!response.ok) throw new Error('Failed to fetch vehicle affectations');
        const data = await response.json();
        return this.mapHalCollection(data._embedded?.affectations);
    }

    // ==================== Affectations ====================

    async getAffectations(page = 0, size = 100) {
        const response = await fetch(
            `${API_BASE_URL}/affectations?page=${page}&size=${size}`,
            {
                headers: this.getHeaders(true),
            }
        );

        if (!response.ok) throw new Error('Failed to fetch affectations');
        const data = await response.json();
        return this.mapHalCollection(data._embedded?.affectations);
    }

    async getAllAffectations() {
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
        const data = await response.json();
        return { id: this.extractIdFromSelfHref(data), ...data };
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

    async updateAffectation(id: number, affectationData: {
        date: string; // ISO format date-time
    }) {
        const response = await fetch(`${API_BASE_URL}/affectations/${id}`, {
            method: 'PATCH',
            headers: this.getHeaders(true, { mergePatch: true }),
            body: JSON.stringify(affectationData),
        });

        if (!response.ok) {
            const text = await response.text().catch(() => '');
            throw new Error(`Failed to update affectation: ${response.status} ${text}`);
        }
        return response.json();
    }

    async patchAffectation(id: number, affectationData: Partial<{
        date: string;
    }>) {
        const response = await fetch(`${API_BASE_URL}/affectations/${id}`, {
            method: 'PATCH',
            headers: this.getHeaders(true, { mergePatch: true }),
            body: JSON.stringify(affectationData),
        });

        if (!response.ok) throw new Error('Failed to patch affectation');
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

    async getAffectationChauffeur(affectationId: number) {
        const response = await fetch(`${API_BASE_URL}/affectations/${affectationId}/chauffeur`, {
            headers: this.getHeaders(true),
        });

        if (!response.ok) throw new Error('Failed to fetch affectation chauffeur');
        const data = await response.json();
        return { id: this.extractIdFromSelfHref(data), ...data };
    }

    async getAffectationChefGarage(affectationId: number) {
        const response = await fetch(`${API_BASE_URL}/affectations/${affectationId}/chefGarage`, {
            headers: this.getHeaders(true),
        });

        if (!response.ok) throw new Error('Failed to fetch affectation chef garage');
        const data = await response.json();
        return { id: this.extractIdFromSelfHref(data), ...data };
    }

    async getAffectationMission(affectationId: number) {
        const response = await fetch(`${API_BASE_URL}/affectations/${affectationId}/mission`, {
            headers: this.getHeaders(true),
        });

        if (!response.ok) throw new Error('Failed to fetch affectation mission');
        const data = await response.json();
        return { id: this.extractIdFromSelfHref(data), ...data };
    }

    async getAffectationVehicule(affectationId: number) {
        const response = await fetch(`${API_BASE_URL}/affectations/${affectationId}/vehicule`, {
            headers: this.getHeaders(true),
        });

        if (!response.ok) throw new Error('Failed to fetch affectation vehicule');
        const data = await response.json();
        return { id: this.extractIdFromSelfHref(data), ...data };
    }

    async getAffectationRapport(affectationId: number) {
        const response = await fetch(`${API_BASE_URL}/affectations/${affectationId}/rapport`, {
            headers: this.getHeaders(true),
        });

        if (!response.ok) throw new Error('Failed to fetch affectation rapport');
        const data = await response.json();
        return { id: this.extractIdFromSelfHref(data), ...data };
    }

    async checkAffectationExistsByMission(missionId: number) {
        const response = await fetch(
            `${API_BASE_URL}/affectations/search/existsByMissionId?missionId=${missionId}`,
            {
                headers: this.getHeaders(true),
            }
        );

        if (!response.ok) throw new Error('Failed to check affectation existence');
        return response.json();
    }

    // ==================== Rapports ====================

    async getRapports(page = 0, size = 100) {
        const response = await fetch(
            `${API_BASE_URL}/rapports?page=${page}&size=${size}`,
            {
                headers: this.getHeaders(true),
            }
        );

        if (!response.ok) throw new Error('Failed to fetch rapports');
        const data = await response.json();
        return this.mapHalCollection(data._embedded?.rapports);
    }

    async getRapport(id: number) {
        const response = await fetch(`${API_BASE_URL}/rapports/${id}`, {
            headers: this.getHeaders(true),
        });

        if (!response.ok) throw new Error('Failed to fetch rapport');
        const data = await response.json();
        return { id: this.extractIdFromSelfHref(data), ...data };
    }

    async createRapport(affectationId: number, rapportData: {
        titre: string;
        texte: string;
    }) {
        // Try custom controller first
        let response = await fetch(
            `${API_BASE_URL}/rapport/create/forAffectation/${affectationId}`,
            {
                method: 'POST',
                headers: this.getHeaders(true),
                body: JSON.stringify(rapportData),
            }
        );

        // If forbidden or not found, fallback to SDR repository POST /rapports with relation URI in body
        if (!response.ok && (response.status === 403 || response.status === 404)) {
            try {
                const repoBody = {
                    titre: rapportData.titre,
                    texte: rapportData.texte,
                    date: new Date().toISOString(),
                    // Spring Data REST accepts relation as a URI string in JSON body for associations
                    affectation: `${API_BASE_URL}/affectations/${affectationId}`,
                } as any;

                const repoResp = await fetch(`${API_BASE_URL}/rapports`, {
                    method: 'POST',
                    headers: this.getHeaders(true),
                    body: JSON.stringify(repoBody),
                });

                if (repoResp.ok) {
                    const ct2 = repoResp.headers.get('content-type') || '';
                    return ct2.includes('application/json') ? repoResp.json() : repoResp.text();
                } else {
                    // If repository creation fails, surface both errors
                    const firstText = await response.text().catch(() => '');
                    const secondText = await repoResp.text().catch(() => '');
                    throw new Error(
                        `Failed to create report (custom: ${response.status} ${firstText}; repo: ${repoResp.status} ${secondText})`
                    );
                }
            } catch (e: any) {
                // If fallback itself throws (network, parsing), rethrow with original status context
                const firstText = await response.text().catch(() => '');
                throw new Error(
                    `Failed to create report (custom: ${response.status} ${firstText}; repo error: ${e?.message || e})`
                );
            }
        }

        if (!response.ok) {
            const text = await response.text().catch(() => '');
            throw new Error(`Failed to create report: ${response.status} ${text}`);
        }
        const ct = response.headers.get('content-type') || '';
        return ct.includes('application/json') ? response.json() : response.text();
    }

    async updateRapport(id: number, rapportData: {
        titre: string;
        texte: string;
        date: string; // ISO format date-time
    }) {
        const response = await fetch(`${API_BASE_URL}/rapports/${id}`, {
            method: 'PATCH',
            headers: this.getHeaders(true, { mergePatch: true }),
            body: JSON.stringify(rapportData),
        });

        if (!response.ok) {
            const text = await response.text().catch(() => '');
            throw new Error(`Failed to update rapport: ${response.status} ${text}`);
        }
        return response.json();
    }

    async patchRapport(id: number, rapportData: Partial<{
        titre: string;
        texte: string;
        date: string;
    }>) {
        const response = await fetch(`${API_BASE_URL}/rapports/${id}`, {
            method: 'PATCH',
            headers: this.getHeaders(true, { mergePatch: true }),
            body: JSON.stringify(rapportData),
        });

        if (!response.ok) throw new Error('Failed to patch rapport');
        return response.json();
    }

    async deleteRapport(id: number) {
        const response = await fetch(`${API_BASE_URL}/rapports/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders(true),
        });

        if (!response.ok) throw new Error('Failed to delete rapport');
    }

    async getRapportAffectation(rapportId: number) {
        const response = await fetch(`${API_BASE_URL}/rapports/${rapportId}/affectation`, {
            headers: this.getHeaders(true),
        });

        if (!response.ok) throw new Error('Failed to fetch rapport affectation');
        const data = await response.json();
        return { id: this.extractIdFromSelfHref(data), ...data };
    }

    // ==================== Profile ====================

    async getProfile() {
        const response = await fetch(`${API_BASE_URL}/profile`, {
            headers: this.getHeaders(true),
        });

        if (!response.ok) throw new Error('Failed to fetch profile');
        return response.json();
    }
}

export const apiService = new ApiService();