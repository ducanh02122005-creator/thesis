import { useEffect, useState } from "react";
import { adminApi } from "../../../api/adminApi";
import { useNavigate } from "react-router-dom";
import { GoArrowLeft } from "react-icons/go";

const GoArrowLeftAny = GoArrowLeft as any;

type TopUserResponse = {
    userId: number;
    fullName: string;
    fraudCount: number;
    riskScore: number;
    riskLevel?: string;
    trustScore?: number;
    trustLevel?: string;
};

export default function UserRiskRanking() {
    const navigate = useNavigate();
    const [users, setUsers] = useState<TopUserResponse[]>([]);

    useEffect(() => {
        adminApi.getTopUsers()
            .then(res => setUsers(res.data))
            .catch(err => console.error(err));
    }, []);

    const getRiskColor = (level?: string) => {
        if (level === "HIGH") return "#ef4444";
        if (level === "MEDIUM") return "#f59e0b";
        return "#22c55e";
    };

    const getTrustColor = (level?: string) => {
        if (level === "EXCELLENT") return "#10b981";
        if (level === "GOOD") return "#3b82f6";
        if (level === "AVERAGE") return "#6366f1";
        return "#94a3b8";
    };

    return (
        <div style={{ padding: "40px 30px", maxWidth: 1200, margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
            
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 15, marginBottom: 30 }}>
                <button onClick={() => navigate("/admin/dashboard")} style={backBtnStyle}>
                    <GoArrowLeftAny size={20} />
                </button>
                <h1 style={{ margin: 0, fontSize: 26, color: "#0f172a" }}>👤 User Risk & Trust Ranking</h1>
            </div>

            {/* Table Container */}
            <div style={{ background: "white", borderRadius: 16, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                        <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                            <th style={thStyle}>User ID</th>
                            <th style={thStyle}>Full Name</th>
                            <th style={thStyle}>Fraud Count</th>
                            <th style={thStyle}>Risk Score</th>
                            <th style={thStyle}>Risk Level</th>
                            <th style={thStyle}>Trust Score</th>
                            <th style={thStyle}>Trust Level</th>
                            <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={8} style={{ padding: 30, textAlign: "center", color: "#64748b" }}>
                                    No high risk user accounts flagged yet.
                                </td>
                            </tr>
                        ) : (
                            users.map(user => (
                                <tr key={user.userId} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                    <td style={tdStyle}>#{user.userId}</td>
                                    <td style={{ ...tdStyle, fontWeight: 600, color: "#1e293b" }}>{user.fullName}</td>
                                    <td style={tdStyle}>
                                        <span style={{ fontWeight: 500, color: "#ef4444" }}>
                                            🚨 {user.fraudCount} cases
                                        </span>
                                    </td>
                                    <td style={{ ...tdStyle, fontWeight: 600 }}>{user.riskScore?.toFixed(1)}</td>
                                    <td style={tdStyle}>
                                        <span style={{
                                            padding: "4px 10px",
                                            borderRadius: 20,
                                            background: getRiskColor(user.riskLevel) + "15",
                                            color: getRiskColor(user.riskLevel),
                                            fontWeight: 600,
                                            fontSize: 13
                                        }}>
                                            {user.riskLevel || "LOW"}
                                        </span>
                                    </td>
                                    <td style={{ ...tdStyle, fontWeight: 600 }}>{user.trustScore?.toFixed(1) ?? "100.0"}</td>
                                    <td style={tdStyle}>
                                        <span style={{
                                            padding: "4px 10px",
                                            borderRadius: 20,
                                            background: getTrustColor(user.trustLevel) + "15",
                                            color: getTrustColor(user.trustLevel),
                                            fontWeight: 600,
                                            fontSize: 13
                                        }}>
                                            {user.trustLevel || "EXCELLENT"}
                                        </span>
                                    </td>
                                    <td style={{ ...tdStyle, textAlign: "right" }}>
                                        <button
                                            onClick={() => navigate(`/admin/risk-detail/${user.userId}`)}
                                            style={actionBtnStyle}
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const backBtnStyle = {
    background: "#f1f5f9",
    border: "none",
    borderRadius: "50%",
    width: 40,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#475569",
    transition: "background 0.2s"
};

const thStyle = {
    padding: "16px 20px",
    color: "#475569",
    fontWeight: 600,
    fontSize: 14
};

const tdStyle = {
    padding: "16px 20px",
    color: "#64748b",
    fontSize: 14
};

const actionBtnStyle = {
    background: "#4f46e5",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
    transition: "background 0.2s"
};