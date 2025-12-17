export type RiskLevel = 'unclassified' | 'minimal' | 'limited' | 'high' | 'unacceptable';
export type ComplianceStatus = 'draft' | 'under_review' | 'approved' | 'retired';

export interface ModelRegistry {
    id: number;
    name: string;
    description?: string;
    owner: string;
    created_at: string;
    risk_level: RiskLevel;
    domain?: string;
    potential_harm?: string;
    compliance_status: ComplianceStatus;
    intended_purpose?: string;
    data_sources?: string;
    oversight_plan?: string;
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
    details?: Record<string, unknown>;
    timestamp: string;
}

export interface DashboardStats {
    total_models: number;
    total_versions: number;
    by_risk_level: { risk_level: string; count: number }[];
    by_compliance_status: { status: string; count: number }[];
}

