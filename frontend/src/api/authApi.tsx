import axiosClient from "./axiosClient";
import { AuthenticationRequest, RegisterRequest, AuthenticationResponse } from "../types/auth";

export const authApi = {
    login: (data: AuthenticationRequest) => {
        return axiosClient.post<AuthenticationResponse>("/auth/login", data);
    },

    registerCustomer: (data: RegisterRequest) => {
        return axiosClient.post<AuthenticationResponse>("/auth/register", data);
    },

    registerAdmin: (data: RegisterRequest) => {
        return axiosClient.post<AuthenticationResponse>("/auth/register/admin", data);
    },
};