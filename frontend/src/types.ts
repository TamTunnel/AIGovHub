export interface ModelRegistry {
    id: number;
    name: string;
    description?: string;
    owner: string;
    created_at: string;
}

export interface ModelVersion {
    id: number;
    model_id: number;
    version_tag: string;
    s3_path?: string;
    created_at: string;
}

export interface EvaluationMetric {
    id: number;
    version_id: number;
    metric_name: string;
    value: number;
    timestamp: string;
}

export interface ComplianceLog {
    id: number;
    entity_type: string;
    entity_id: string;
    action: string;
    details?: any;
    timestamp: string;
}
