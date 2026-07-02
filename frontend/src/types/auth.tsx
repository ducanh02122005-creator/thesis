export interface AuthenticationRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    fullName: string;
}

export interface AuthenticationResponse {
    token: string;
    userId: number;
    email: string;
    role: string;
}