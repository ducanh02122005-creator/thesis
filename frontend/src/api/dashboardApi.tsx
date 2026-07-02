import axiosClient from "./axiosClient";

import {
    DashboardSummaryResponse,
    FraudByHourResponse,
    FraudByCategoryResponse,
    TopUserResponse
}
    from "../types/dashbroad";

import {
    AlertRequest,
    AlertResponse
} from "../types/alert";

export const dashboardApi = {

    getSummary() {
        return axiosClient.get<DashboardSummaryResponse>(
            "/dashboard/summary"
        );
    },

    getFraudByHour() {
        return axiosClient.get<FraudByHourResponse[]>(
            "/dashboard/fraud-by-hour"
        );
    },

    getFraudByCategory() {
        return axiosClient.get<FraudByCategoryResponse[]>(
            "/dashboard/fraud-by-category"
        );
    },

    getTopUsers() {
        return axiosClient.get<TopUserResponse[]>(
            "/dashboard/top-users"
        );
    },

    getAlerts() {
        return axiosClient.get<AlertResponse[]>(
            "/dashboard/alert"
        );
    },

    getOpenAlerts() {
        return axiosClient.get<AlertResponse[]>(
            "/dashboard/openAlert"
        );
    },

    updateStatus(request: AlertRequest) {
        return axiosClient.put<AlertResponse>(
            "/dashboard/updateStatus",
            request
        );
    }
};