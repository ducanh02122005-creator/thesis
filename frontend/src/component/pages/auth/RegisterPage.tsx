import { useState } from "react";
import { authApi } from "../../../api/authApi";
import { useNavigate } from "react-router-dom";

type RegisterType = "CUSTOMER" | "ADMIN";

export default function RegisterPage() {
    const navigate = useNavigate();

    const [registerType, setRegisterType] = useState<RegisterType>("CUSTOMER");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    // Bật/tắt phân quyền admin qua State nếu cần (hoặc bạn có thể cho hiển thị mặc định)
    const [showAdminOption] = useState(true);

    const handleRegister = async () => {
        if (!email || !password || !fullName) {
            alert("Please fill in all registration fields");
            return;
        }
        try {
            setLoading(true);
            const payload = { fullName, email, password };

            if (registerType === "CUSTOMER") {
                await authApi.registerCustomer(payload);
            } else {
                await authApi.registerAdmin(payload);
            }

            alert("Account created successfully! Redirecting to Login...");

            // CHUYỂN HƯỚNG VỀ TRANG ĐĂNG NHẬP
            navigate("/login");

        } catch (err: any) {
            alert(err.response?.data?.message || "Registration failed. Account might already exist.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={containerStyle}>
            <h2 style={titleStyle}>🔐 Create Account</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <input
                    placeholder="Your Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={inputStyle}
                />
                <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={inputStyle}
                />
                <input
                    type="password"
                    placeholder="Create Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={inputStyle}
                />

                {showAdminOption && (
                    <select
                        value={registerType}
                        onChange={(e) => setRegisterType(e.target.value as RegisterType)}
                        style={inputStyle}
                    >
                        <option value="CUSTOMER">👤 Register as Customer</option>
                        <option value="ADMIN">🛡️ Register as Admin (Restricted)</option>
                    </select>
                )}

                <button onClick={handleRegister} disabled={loading} style={btnStyle}>
                    {loading ? "Processing..." : "Register"}
                </button>

                <p style={{ textAlign: "center", fontSize: 14, color: "#6b7280" }}>
                    Already have an account?{" "}
                    <span onClick={() => navigate("/login")} style={linkStyle}>
                        Sign In
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