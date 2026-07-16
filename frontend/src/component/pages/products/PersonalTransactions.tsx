import { useEffect, useState } from "react";
import { purchaseApi } from "../../../api/purchaseApi";
import { useNavigate } from "react-router-dom";
import { GoArrowLeft } from "react-icons/go";
import { FaUserShield, FaHistory, FaCheckCircle, FaExclamationTriangle, FaBan } from "react-icons/fa";

const GoArrowLeftAny = GoArrowLeft as any;
const FaUserShieldAny = FaUserShield as any;
const FaHistoryAny = FaHistory as any;
const FaCheckCircleAny = FaCheckCircle as any;
const FaExclamationTriangleAny = FaExclamationTriangle as any;
const FaBanAny = FaBan as any;

interface UserTransaction {
    transactionId: number;
    amount: number;
    category: string;
    transactionTime: string;
    fraudProbability: number;
    fraud: boolean;
    decision: string;
}

interface RiskProfile {
    userId: number;
    riskScore: number;
    riskLevel: string;
    trustScore: number;
    trustLevel: string;
}

export default function PersonalTransactions() {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState<UserTransaction[]>([]);
    const [profile, setProfile] = useState<RiskProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userId = Number(localStorage.getItem("userId"));
        if (!userId) {
            navigate("/login");
            return;
        }

        Promise.all([
            purchaseApi.getMyTransactions(),
            purchaseApi.getMyRiskProfile(userId)
        ])
        .then(([txRes, profileRes]) => {
            setTransactions(txRes.data);
            setProfile(profileRes.data);
            setLoading(false);
        })
        .catch(err => {
            console.error("Error fetching personal profile or transaction data:", err);
            setLoading(false);
        });
    }, [navigate]);

    const getDecisionIcon = (decision?: string) => {
        if (decision === "BLOCK") return <FaBanAny color="#ef4444" style={{ flexShrink: 0 }} />;
        if (decision === "REVIEW") return <FaExclamationTriangleAny color="#f59e0b" style={{ flexShrink: 0 }} />;
        return <FaCheckCircleAny color="#10b981" style={{ flexShrink: 0 }} />;
    };

    const getDecisionBadgeStyle = (decision?: string) => {
        const base = {
            padding: "4px 10px",
            borderRadius: 20,
            fontWeight: 700,
            fontSize: 12,
            display: "inline-flex",
            alignItems: "center",
            gap: 6
        };
        if (decision === "BLOCK") return { ...base, background: "#fef2f2", color: "#ef4444" };
        if (decision === "REVIEW") return { ...base, background: "#fffbeb", color: "#d97706" };
        return { ...base, background: "#f0fdf4", color: "#16a34a" };
    };

    const getTrustColor = (level?: string) => {
        if (level === "EXCELLENT") return "#10b981";
        if (level === "GOOD") return "#3b82f6";
        if (level === "AVERAGE") return "#6366f1";
        return "#ef4444";
    };

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh", fontFamily: "system-ui, sans-serif", color: "#64748b" }}>
                Loading profile and transactions...
            </div>
        );
    }

    return (
        <div style={{ padding: "40px 20px", maxWidth: 1000, margin: "0 auto", fontFamily: "system-ui, sans-serif", background: "#f8fafc", minHeight: "100vh" }}>
            
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 15, marginBottom: 35 }}>
                <button onClick={() => navigate("/market")} style={backBtnStyle}>
                    <GoArrowLeftAny size={20} />
                </button>
                <div>
                    <h1 style={{ margin: 0, fontSize: 26, color: "#0f172a" }}>💳 My Profile & Transactions</h1>
                    <p style={{ margin: "4px 0 0 0", color: "#64748b" }}>Manage transactions and track your real-time trust index</p>
                </div>
            </div>

            {/* Profile Summary & Score Card */}
            {profile && (
                <div style={profileCardStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                        <FaUserShieldAny size={24} color={getTrustColor(profile.trustLevel)} />
                        <h2 style={{ margin: 0, fontSize: 18, color: "#0f172a" }}>Reputation Profile</h2>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30 }}>
                        
                        {/* Trust Score */}
                        <div style={{ background: "#f8fafc", padding: 20, borderRadius: 12, border: "1px solid #e2e8f0" }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Trust Score</div>
                            <div style={{ display: "flex", alignItems: "baseline", gap: 6, margin: "10px 0" }}>
                                <span style={{ fontSize: 36, fontWeight: 700, color: "#0f172a" }}>{profile.trustScore?.toFixed(1)}</span>
                                <span style={{ color: "#94a3b8", fontSize: 14 }}>/ 100</span>
                            </div>
                            <div>
                                <span style={{
                                    background: getTrustColor(profile.trustLevel) + "15",
                                    color: getTrustColor(profile.trustLevel),
                                    fontWeight: 700,
                                    fontSize: 13,
                                    padding: "4px 10px",
                                    borderRadius: 12
                                }}>
                                    {profile.trustLevel} REPUTATION
                                </span>
                            </div>
                        </div>

                        {/* Risk Level */}
                        <div style={{ background: "#f8fafc", padding: 20, borderRadius: 12, border: "1px solid #e2e8f0" }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>System Risk Score</div>
                            <div style={{ display: "flex", alignItems: "baseline", gap: 6, margin: "10px 0" }}>
                                <span style={{ fontSize: 36, fontWeight: 700, color: "#0f172a" }}>{profile.riskScore?.toFixed(1)}</span>
                                <span style={{ color: "#94a3b8", fontSize: 14 }}>/ 100</span>
                            </div>
                            <div>
                                <span style={{
                                    background: (profile.riskLevel === "HIGH" ? "#ef4444" : profile.riskLevel === "MEDIUM" ? "#f59e0b" : "#22c55e") + "15",
                                    color: profile.riskLevel === "HIGH" ? "#ef4444" : profile.riskLevel === "MEDIUM" ? "#d97706" : "#16a34a",
                                    fontWeight: 700,
                                    fontSize: 13,
                                    padding: "4px 10px",
                                    borderRadius: 12
                                }}>
                                    {profile.riskLevel} RISK INDEX
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Transactions Section */}
            <div style={{ background: "white", borderRadius: 16, border: "1px solid #e2e8f0", padding: 25, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                    <FaHistoryAny size={18} color="#475569" />
                    <h3 style={{ margin: 0, fontSize: 18, color: "#0f172a" }}>Personal Transaction History</h3>
                </div>

                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                        <thead>
                            <tr style={{ borderBottom: "2px solid #f1f5f9", color: "#64748b", fontSize: 13, fontWeight: 600 }}>
                                <th style={thStyle}>ID</th>
                                <th style={thStyle}>Date & Time</th>
                                <th style={thStyle}>Category</th>
                                <th style={thStyle}>Amount</th>
                                <th style={thStyle}>Evaluation</th>
                                <th style={{ ...thStyle, textAlign: "right" }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ padding: "40px 0", textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
                                        No recent transactions found. Go to marketplace to purchase!
                                    </td>
                                </tr>
                            ) : (
                                transactions.map(t => (
                                    <tr key={t.transactionId} style={{ borderBottom: "1px solid #f1f5f9", fontSize: 14 }}>
                                        <td style={tdStyle}>#{t.transactionId}</td>
                                        <td style={tdStyle}>{new Date(t.transactionTime).toLocaleString()}</td>
                                        <td style={tdStyle}>
                                            <span style={categoryBadgeStyle}>{t.category}</span>
                                        </td>
                                        <td style={{ ...tdStyle, fontWeight: 700, color: "#0f172a" }}>${t.amount?.toFixed(2)}</td>
                                        <td style={tdStyle}>
                                            <span style={{ fontSize: 13, color: t.fraud ? "#ef4444" : "#10b981", fontWeight: 500 }}>
                                                {t.fraud ? `🚨 Flagged (${(t.fraudProbability * 100).toFixed(0)}%)` : "✅ Verified Safe"}
                                            </span>
                                        </td>
                                        <td style={{ ...tdStyle, textAlign: "right" }}>
                                            <span style={getDecisionBadgeStyle(t.decision)}>
                                                {getDecisionIcon(t.decision)}
                                                {t.decision || "APPROVE"}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

const backBtnStyle = {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "50%",
    width: 40,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#475569",
    boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
    transition: "background 0.2s"
};

const profileCardStyle = {
    background: "white",
    borderRadius: 16,
    border: "1px solid #e2e8f0",
    padding: 30,
    marginBottom: 30,
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)"
};

const thStyle = {
    padding: "12px 16px",
    fontWeight: 600
};

const tdStyle = {
    padding: "16px 16px",
    color: "#475569"
};

const categoryBadgeStyle = {
    background: "#f1f5f9",
    color: "#475569",
    padding: "3px 8px",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 500
};
