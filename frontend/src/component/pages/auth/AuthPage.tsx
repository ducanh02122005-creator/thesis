import { useEffect, useState } from "react";
import { authApi } from "../../../api/authApi";
import { useNavigate, useLocation } from "react-router-dom";

type Mode = "LOGIN" | "REGISTER";
type RegisterType = "CUSTOMER" | "ADMIN";

export default function AuthPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const [mode, setMode] = useState<Mode>("LOGIN");
    const [registerType, setRegisterType] = useState<RegisterType>("CUSTOMER");

    // Quản lý việc hiển thị nút Đăng ký Admin (Bảo mật giao diện)
    const [showAdminOption, setShowAdminOption] = useState(false);

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const role = params.get("role");

        // Chỉ khi truy cập bằng đường dẫn chuyên dụng: /auth?role=ADMIN
        if (role === "ADMIN") {
            setMode("REGISTER");
            setRegisterType("ADMIN");
            setShowAdminOption(true);
        }
    }, [location]);

    /* =========================
       XỬ LÝ ĐĂNG NHẬP
    ========================= */
    const handleLogin = async () => {
        if (!email || !password) {
            alert("Please fill in email and password");
            return;
        }
        try {
            setLoading(true);
            const res = await authApi.login({ email, password });
            saveAuth(res.data);
        } catch (err: any) {
            alert(err.response?.data?.message || "Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    /* =========================
       XỬ LÝ ĐĂNG KÝ (ĐÃ CẬP NHẬT)
    ========================= */
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
                // Endpoint này yêu cầu Header Token hợp lệ của một Admin hiện tại
                await authApi.registerAdmin(payload);
            }

            alert("Account created successfully! Please sign in.");

            // CHUYỂN HƯỚNG VỀ FORM ĐĂNG NHẬP
            setMode("LOGIN");
            setPassword(""); // Reset password để bảo mật
            setFullName(""); // Reset fullname 
            // Giữ lại `email` để người dùng tiện đăng nhập luôn

        } catch (err: any) {
            alert(err.response?.data?.message || "Registration failed. Account might already exist.");
        } finally {
            setLoading(false);
        }
    };

    /* =========================
       LƯU THÔNG TIN ĐỊNH DANH
    ========================= */
    const saveAuth = (data: any) => {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", String(data.userId));
        localStorage.setItem("email", data.email);
        localStorage.setItem("role", data.role);

        if (data.role === "ADMIN") {
            navigate("/admin/dashboard");
        } else {
            navigate("/market");
        }
    };

    return (
        <div style={{
            maxWidth: 400,
            margin: "80px auto",
            padding: "30px 25px",
            borderRadius: 16,
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
            background: "white",
            fontFamily: "system-ui, sans-serif"
        }}>
            {/* LOGO TIÊU ĐỀ */}
            <h2 style={{ textAlign: "center", margin: "0 0 25px 0", color: "#111827", fontSize: 24 }}>
                🔐 Fraud Detection System
            </h2>

            {/* ĐIỀU HƯỚNG TAB CHUYỂN MODE */}
            <div style={{ display: "flex", background: "#f3f4f6", padding: 4, borderRadius: 8, marginBottom: 25 }}>
                <button
                    onClick={() => setMode("LOGIN")}
                    style={{
                        flex: 1, padding: "10px", borderRadius: 6, fontSize: 15, fontWeight: 500, cursor: "pointer", border: "none",
                        background: mode === "LOGIN" ? "white" : "transparent",
                        color: mode === "LOGIN" ? "#111827" : "#6b7280",
                        boxShadow: mode === "LOGIN" ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
                    }}
                >
                    Login
                </button>
                <button
                    onClick={() => setMode("REGISTER")}
                    style={{
                        flex: 1, padding: "10px", borderRadius: 6, fontSize: 15, fontWeight: 500, cursor: "pointer", border: "none",
                        background: mode === "REGISTER" ? "white" : "transparent",
                        color: mode === "REGISTER" ? "#111827" : "#6b7280",
                        boxShadow: mode === "REGISTER" ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
                    }}
                >
                    Register
                </button>
            </div>

            {/* FORM ĐĂNG NHẬP */}
            {mode === "LOGIN" && (
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
                </div>
            )}

            {/* FORM ĐĂNG KÝ */}
            {mode === "REGISTER" && (
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

                    {/* DROP-DOWN PHÂN QUYỀN */}
                    {showAdminOption ? (
                        <select
                            value={registerType}
                            onChange={(e) => setRegisterType(e.target.value as RegisterType)}
                            style={inputStyle}
                        >
                            <option value="CUSTOMER">👤 Register as Customer</option>
                            <option value="ADMIN">🛡️ Register as Admin (Restricted)</option>
                        </select>
                    ) : null}

                    <button onClick={handleRegister} disabled={loading} style={btnStyle}>
                        {loading ? "Processing..." : "Create Account"}
                    </button>
                </div>
            )}
        </div>
    );
}

/* =========================
   HỆ THỐNG STYLES ĐỒNG BỘ UI
========================= */
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