import { Navigate } from "react-router-dom";

interface Props {
    children: JSX.Element;
    requiredRole?: string;
}

export default function ProtectedRoute({
    children,
    requiredRole,
}: Props) {

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && role !== requiredRole) {
        return <Navigate to="/market" replace />;
    }

    return children;
}