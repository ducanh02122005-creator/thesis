import axiosClient from "./axiosClient";

import {
    DashboardSummaryResponse,
    FraudByHourResponse,
    FraudByCategoryResponse,
    TopUserResponse,
} from "../types/dashbroad";

import { AlertResponse, AlertRequest } from "../types/alert";

export const adminApi = {

    // ===== DASHBOARD =====
    getSummary: () =>
        axiosClient.get<DashboardSummaryResponse>("/dashboard/summary"),

    getFraudByHour: () =>
        axiosClient.get<FraudByHourResponse[]>("/dashboard/fraud-by-hour"),

    getFraudByCategory: () =>
        axiosClient.get<FraudByCategoryResponse[]>("/dashboard/fraud-by-category"),

    getTopUsers: () =>
        axiosClient.get<TopUserResponse[]>("/dashboard/top-users"),

    getAllUsersRisk: () =>
        axiosClient.get<TopUserResponse[]>("/dashboard/all-users"),

    getUserRiskProfile: (userId: number) =>
        axiosClient.get<any>(`/users/${userId}/risk-profile`),

    getUserTransactions: (userId: number) =>
        axiosClient.get<any[]>(`/transactions/user/${userId}`),

    verifyEmail: (userId: number) =>
        axiosClient.post<any>(`/users/${userId}/risk-profile/verify-email`),

    verifyPhone: (userId: number) =>
        axiosClient.post<any>(`/users/${userId}/risk-profile/verify-phone`),

    updateTransactionDecision: (transactionId: number, decision: string) =>
        axiosClient.put(`/transactions/${transactionId}/decision?decision=${decision}`),

    deleteTransaction: (transactionId: number) =>
        axiosClient.delete(`/transactions/${transactionId}`),

    // ===== ALERT =====
    getAllAlerts: () =>
        axiosClient.get<AlertResponse[]>("/dashboard/alert"),

    getOpenAlerts: () =>
        axiosClient.get<AlertResponse[]>("/dashboard/openAlert"),

    updateStatus: (data: AlertRequest) =>
        axiosClient.put<AlertResponse>("/dashboard/updateStatus", data),
};