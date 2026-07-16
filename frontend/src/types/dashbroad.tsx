export interface DashboardSummaryResponse {
    totalTransactions: number;
    totalFrauds: number;
    fraudRate: number;
    totalAlerts: number;
    highRiskUsers: number;
}

export interface FraudByHourResponse {
    hour: number;
    fraudCount: number;
}

export interface FraudByCategoryResponse {
    category: string;
    fraudCount: number;
}

export interface TopUserResponse {
    userId: number;
    fullName: string;
    email: string;
    fraudCount: number;
    riskScore: number;
    riskLevel?: string;
    trustScore?: number;
    trustLevel?: string;
}