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

    // ===== ALERT =====
    getAllAlerts: () =>
        axiosClient.get<AlertResponse[]>("/dashboard/alert"),

    getOpenAlerts: () =>
        axiosClient.get<AlertResponse[]>("/dashboard/openAlert"),

    updateStatus: (data: AlertRequest) =>
        axiosClient.put<AlertResponse>("/dashboard/updateStatus", data),
};