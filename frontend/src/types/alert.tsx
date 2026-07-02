export interface AlertResponse {
    alertId: number;
    transactionId: number;
    riskScore: number;
    status: string;
    createdAt: string;
}

export interface AlertRequest {
    alertId: number;
    status: string;
}