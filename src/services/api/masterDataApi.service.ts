import { ApiService } from '../../components/MasterData/GenericMasterData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface StoreProfileItem {
    id?: string | number;
    storeCode: string;
    costCenter: string;
    storeNameEn: string;
    storeNameTh: string | null;
    goDate: string;
    format: string;
    region: string;
    closeDate?: string;
    status?: string;
    isActive?: boolean;
    lastUpdate?: string;
    updateBy?: string;
}

class StoreProfileApiService implements ApiService<StoreProfileItem> {
    protected endpoint = `${API_BASE_URL}/store-profiles`;

    async getAll(): Promise<StoreProfileItem[]> {
        try {
            const response = await fetch(this.endpoint);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching store profiles:', error);
            return [];
        }
    }

    async create(item: Partial<StoreProfileItem>): Promise<StoreProfileItem> {
        const response = await fetch(this.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(item),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    async update(id: string | number, item: Partial<StoreProfileItem>): Promise<StoreProfileItem> {
        const response = await fetch(`${this.endpoint}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(item),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    async delete(id: string | number): Promise<void> {
        const response = await fetch(`${this.endpoint}/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    }
}

class StoreProfileClosedApiService extends StoreProfileApiService {
    protected endpoint = `${API_BASE_URL}/store-profiles-closed`;
}

export const storeProfileApiService = new StoreProfileApiService();
export const storeProfileClosedApiService = new StoreProfileClosedApiService();