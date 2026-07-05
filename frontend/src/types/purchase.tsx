export interface PurchaseItemRequest {
    productId: number;
    quantity: number;
}

export interface PurchaseRequest {
    userId: number;
    items: PurchaseItemRequest[];
}

export interface PurchaseResponse {
    purchaseId?: number;
    transactionId: number;
    totalAmount: number;
    fraudProbability: number;
    status: "PAID" | "PENDING" | "CANCELLED";
    fraudDetected?: boolean;
    riskLevel?: string;
    decision?: string;
}