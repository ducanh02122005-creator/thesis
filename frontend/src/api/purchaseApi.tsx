import axiosClient from "./axiosClient";
import { PurchaseRequest, PurchaseResponse } from "../types/purchase";

export const purchaseApi = {
    buy: (data: PurchaseRequest) => {
        return axiosClient.post<PurchaseResponse>("/purchase", data);
    },
};