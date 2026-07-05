import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";

import {
    FaExchangeAlt,
    FaExclamationTriangle,
    FaBell,
    FaUserShield,
    FaSignOutAlt,
    FaStore
} from "react-icons/fa";

const FaExchangeAltAny = FaExchangeAlt as any;
const FaExclamationTriangleAny = FaExclamationTriangle as any;
const FaBellAny = FaBell as any;
const FaUserShieldAny = FaUserShield as any;
const FaSignOutAltAny = FaSignOutAlt as any;
const FaStoreAny = FaStore as any;

import "./Dashboard.css";

import { adminApi } from "../../../api/adminApi";
import {
    DashboardSummaryResponse,
    FraudByHourResponse,
    FraudByCategoryResponse,
    TopUserResponse,
} from "../../../types/dashbroad";

const COLORS = [
    "#4f46e5",
    "#ef4444",
    "#22c55e",
    "#f59e0b",
    "#06b6d4",
];


export default function Dashboard() {
    const navigate = useNavigate(); // Khởi tạo hook navigate

    const [summary, setSummary] =
        useState<DashboardSummaryResponse>();

    const [byHour, setByHour] =
        useState<FraudByHourResponse[]>([]);

    const [byCategory, setByCategory] =
        useState<FraudByCategoryResponse[]>([]);

    const [topUsers, setTopUsers] =
        useState<TopUserResponse[]>([]);

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        const [s, h, c, u] = await Promise.all([
            adminApi.getSummary(),
            adminApi.getFraudByHour(),
            adminApi.getFraudByCategory(),
            adminApi.getTopUsers(),
        ]);

        setSummary(s.data);
        setByHour(h.data);
        setByCategory(c.data);
        setTopUsers(u.data);
    };

    return (
        <div className="dashboard">

            {/* CONTAINER TIÊU ĐỀ VÀ NÚT ĐIỀU HƯỚNG */}
            <div style={{
                display: "flex",
                justifyContent: "between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "15px",
                marginBottom: "25px"
            }}>
                <h1 style={{ margin: 0 }}>Fraud Detection Dashboard</h1>

                {/* THANH ĐIỀU HƯỚNG MỚI THÊM */}
                <div style={{ display: "flex", gap: "10px" }}>
                    <button
                        onClick={() => navigate("/market")}
                        style={navBtnStyle}
                    >
                        <FaStoreAny style={{ marginRight: "6px" }} /> Go to Market
                    </button>
                    <button
                        onClick={() => { localStorage.clear(); navigate("/login"); }}
                        style={{ ...navBtnStyle, background: "#ef4444" }}
                    >
                        <FaSignOutAltAny style={{ marginRight: "6px" }} /> Login / Logout
                    </button>
                </div>
            </div>

            <div className="cards">

                <Card
                    title="Transactions"
                    value={summary?.totalTransactions}
                    icon={<FaExchangeAltAny />}
                    color="#3b82f6"
                />

                <Card
                    title="Frauds"
                    value={summary?.totalFrauds}
                    icon={<FaExclamationTriangleAny />}
                    color="#ef4444"
                />

                <Card
                    title="Alerts"
                    value={summary?.totalAlerts}
                    icon={<FaBellAny />}
                    color="#f59e0b"
                />

                <Card
                    title="High Risk Users"
                    value={summary?.highRiskUsers}
                    icon={<FaUserShieldAny />}
                    color="#8b5cf6"
                />

                <Card
                    title="Fraud Rate"
                    value={summary?.fraudRate ? `${summary.fraudRate.toFixed(2)}%` : "0.00%"}
                    color="#10b981"
                />

            </div>

            <div className="charts">

                <div className="chart">

                    <h3>Fraud By Hour</h3>

                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={byHour}>
                            <XAxis dataKey="hour" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#3b82f6" />
                        </BarChart>
                    </ResponsiveContainer>

                </div>

                <div className="chart">

                    <h3>Fraud By Category</h3>

                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={byCategory}
                                dataKey="count"
                                nameKey="category"
                                outerRadius={100}
                                label
                            >
                                {byCategory.map((_, index) => (
                                    <Cell
                                        key={index}
                                        fill={COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>

                </div>

            </div>

            <div className="table-card">

                <h2>Top High Risk Users</h2>

                <table>

                    <thead>

                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Frauds</th>
                            <th>Risk Score</th>
                        </tr>

                    </thead>

                    <tbody>

                        {topUsers.map((u) => (

                            <tr key={u.userId}>
                                <td>{u.userId}</td>
                                <td>{u.fullName}</td>
                                <td>{u.fraudCount}</td>
                                <td>
                                    <span className="risk">
                                        {u.riskScore.toFixed(2)}
                                    </span>
                                </td>
                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </div>
    );
}

function Card({
    title,
    value,
    icon,
    color,
}: any) {
    return (
        <div className="card">

            <div
                className="icon"
                style={{ background: color }}
            >
                {icon}
            </div>

            <div>

                <p>{title}</p>

                <h2>{value}</h2>

            </div>

        </div>
    );
}

/* =========================
    STYLES CHO NÚT MỚI
========================= */
const navBtnStyle = {
    display: "flex",
    alignItems: "center",
    padding: "10px 16px",
    borderRadius: "8px",
    background: "#4f46e5",
    color: "white",
    border: "none",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    transition: "background 0.2s"
};