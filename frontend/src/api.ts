import axios from 'axios';
import type { ModelRegistry, ModelVersion, EvaluationMetric, ComplianceLog } from './types';

const api = axios.create({
    baseURL: 'http://localhost:8000/api/v1',
});

export const getModels = async () => {
    const response = await api.get<ModelRegistry[]>('/models/');
    return response.data;
};

// Create model only requires name, owner, description - backend sets defaults for risk_level, compliance_status
export const createModel = async (model: { name: string; owner: string; description?: string }) => {
    const response = await api.post<ModelRegistry>('/models/', model);
    return response.data;
};

export const getModelVersions = async (modelId: number) => {
    const response = await api.get<ModelVersion[]>(`/models/${modelId}/versions/`);
    return response.data;
};

export const createVersion = async (version: Omit<ModelVersion, 'id' | 'created_at'>) => {
    const response = await api.post<ModelVersion>('/versions/', version);
    return response.data;
};

export const addMetric = async (metric: Omit<EvaluationMetric, 'id' | 'timestamp'>) => {
    const response = await api.post<EvaluationMetric>('/metrics/', metric);
    return response.data;
};

export const getAuditLogs = async () => {
    const response = await api.get<ComplianceLog[]>('/audit-logs/');
    return response.data;
};
