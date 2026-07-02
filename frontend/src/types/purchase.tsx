export interface PurchaseItemRequest {
    productId: number;
    quantity: number;
}

export interface PurchaseRequest {
    userId: number;
    items: PurchaseItemRequest[];
}

export interface PurchaseResponse {
    transactionId: string;
    amount: number;
    fraudProbability: number;
    status: "APPROVED" | "FRAUD_ALERT";
}