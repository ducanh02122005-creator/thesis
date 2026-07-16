import axiosClient from "./axiosClient";
import { PurchaseRequest, PurchaseResponse } from "../types/purchase";

export const purchaseApi = {
    buy: (data: PurchaseRequest) => {
        return axiosClient.post<PurchaseResponse>("/purchase", data);
    },
    getMyTransactions: () => {
        return axiosClient.get<any[]>("/transactions/me");
    },
    getMyRiskProfile: (userId: number) => {
        return axiosClient.get<any>(`/users/${userId}/risk-profile`);
    }
};