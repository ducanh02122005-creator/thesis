import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Dashboard from "./Dashboard";
import FraudInvestigation from "./FraudInvestigation";
import ProductManagement from "../products/ProductManagement";

export default function AdminPage() {
    const navigate = useNavigate();
    const [view, setView] = useState<"dashboard" | "fraud" | "products">("dashboard");

    // Hàm xử lý đăng xuất an toàn
    const handleLogout = () => {
        localStorage.clear(); // Xóa sạch token và các thông tin cũ
        navigate("/login");
    };

    return (
        <div>
            {/* NAV BAR */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 15,
                borderBottom: "1px solid #ddd",
                flexWrap: "wrap",
                gap: 10
            }}>
                {/* NHÓM CÁC BUTTON CHUYỂN TAB NỘI BỘ */}
                <div style={{ display: "flex", gap: 10 }}>
                    <button
                        onClick={() => setView("dashboard")}
                        style={view === "dashboard" ? activeBtnStyle : btnStyle}
                    >
                        📊 Dashboard
                    </button>

                    <button
                        onClick={() => setView("fraud")}
                        style={view === "fraud" ? activeBtnStyle : btnStyle}
                    >
                        🚨 Fraud Investigation
                    </button>

                    <button
                        onClick={() => setView("products")}
                        style={view === "products" ? activeBtnStyle : btnStyle}
                    >
                        📦 Products
                    </button>
                </div>

                {/* NHÓM NÚT ĐIỀU HƯỚNG SANG ROUTE KHÁC */}
                <div style={{ display: "flex", gap: 10 }}>
                    <button
                        onClick={() => navigate("/market")}
                        style={marketBtnStyle}
                    >
                        🛒 Go to Market
                    </button>

                    <button
                        onClick={handleLogout}
                        style={logoutBtnStyle}
                    >
                        🔒 Logout
                    </button>
                </div>
            </div>

            {/* CONTENT */}
            <div style={{ padding: 20 }}>
                {view === "dashboard" && <Dashboard />}
                {view === "fraud" && <FraudInvestigation />}
                {view === "products" && <ProductManagement />}
            </div>
        </div>
    );
}

/* =========================
    STYLES CHO THANH NAV
========================= */
const btnStyle = {
    padding: "8px 16px",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
    background: "white",
    color: "#334155",
    cursor: "pointer",
    fontWeight: 500,
    transition: "all 0.2s"
};

const activeBtnStyle = {
    ...btnStyle,
    background: "#1e293b",
    color: "white",
    borderColor: "#1e293b"
};

const marketBtnStyle = {
    ...btnStyle,
    background: "#4f46e5",
    color: "white",
    borderColor: "#4f46e5",
    fontWeight: 600
};

const logoutBtnStyle = {
    ...btnStyle,
    background: "#ef4444",
    color: "white",
    borderColor: "#ef4444",
    fontWeight: 600
};