import { useState } from "react";
import { authApi } from "../../../api/authApi";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            alert("Please fill in email and password");
            return;
        }
        try {
            setLoading(true);
            const res = await authApi.login({ email, password });

            // Lưu thông tin đăng nhập
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("userId", String(res.data.userId));
            localStorage.setItem("email", res.data.email);
            localStorage.setItem("role", res.data.role);

            // Điều hướng dựa vào Role
            if (res.data.role === "ADMIN") {
                navigate("/admin/dashboard");
            } else {
                navigate("/market");
            }
        } catch (err: any) {
            alert(err.response?.data?.message || "Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={containerStyle}>
            <h2 style={titleStyle}>🔐 Fraud Detection System</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={inputStyle}
                />
                <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={inputStyle}
                />
                <button onClick={handleLogin} disabled={loading} style={btnStyle}>
                    {loading ? "Verifying..." : "Sign In"}
                </button>

                <p style={{ textAlign: "center", fontSize: 14, color: "#6b7280" }}>
                    Don't have an account?{" "}
                    <span onClick={() => navigate("/register")} style={linkStyle}>
                        Register here
                    </span>
                </p>
            </div>
        </div>
    );
}

/* ==========================================================================
   STYLING SYSTEM (Dùng chung cho cả Login và Register để đồng bộ UI)
   ========================================================================== */
const containerStyle = {
    maxWidth: 400,
    margin: "80px auto",
    padding: "30px 25px",
    borderRadius: 16,
    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
    background: "white",
    fontFamily: "system-ui, sans-serif"
};

const titleStyle = {
    textAlign: "center" as const,
    margin: "0 0 25px 0",
    color: "#111827",
    fontSize: 24
};

const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    fontSize: 15,
    outline: "none",
    boxSizing: "border-box" as const,
    transition: "border-color 0.2s"
};

const btnStyle = {
    width: "100%",
    padding: "12px",
    borderRadius: 8,
    background: "#111827",
    color: "white",
    border: "none",
    fontWeight: 600,
    fontSize: 15,
    cursor: "pointer",
    marginTop: 5,
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)"
};

const linkStyle = {
    color: "#2563eb",
    fontWeight: 600,
    cursor: "pointer",
    textDecoration: "underline"
};