export type RiskLevel = 'unclassified' | 'minimal' | 'limited' | 'high' | 'unacceptable';
export type ComplianceStatus = 'draft' | 'under_review' | 'approved' | 'retired';
export type PolicyScope = 'global' | 'organization' | 'environment';
export type PolicyConditionType = 'require_evaluation_before_approval' | 'block_high_risk_without_approval' | 'require_review_for_high_risk';
export type Environment = 'dev' | 'test' | 'staging' | 'prod';

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
    organization_id?: number;
    environment?: Environment;
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

export interface Policy {
    id: number;
    name: string;
    description?: string;
    scope: PolicyScope;
    condition_type: PolicyConditionType;
    is_active: boolean;
    organization_id?: number;
    created_at: string;
    updated_at?: string;
}

export interface PolicyViolation {
    id: number;
    policy_id: number;
    model_id?: number;
    model_version_id?: number;
    user_id?: number;
    action: string;
    details?: Record<string, unknown>;
    created_at: string;
}

export interface Organization {
    id: number;
    name: string;
    description?: string;
    is_active: boolean;
    created_at: string;
}


