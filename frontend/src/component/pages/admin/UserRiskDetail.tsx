import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminApi } from "../../../api/adminApi";
import { GoArrowLeft } from "react-icons/go";
import { FaUserShield, FaHeartbeat, FaHistory, FaCalendarCheck } from "react-icons/fa";

const GoArrowLeftAny = GoArrowLeft as any;
const FaUserShieldAny = FaUserShield as any;
const FaHeartbeatAny = FaHeartbeat as any;

interface RiskProfile {
    userId: number;
    riskScore: number;
    riskLevel: string;
    trustScore: number;
    trustLevel: string;
}

export default function UserRiskDetail() {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<RiskProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userId) {
            adminApi.getUserRiskProfile(Number(userId))
                .then(res => {
                    setProfile(res.data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Failed to load user risk profile:", err);
                    setLoading(false);
                });
        }
    }, [userId]);

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

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh", fontFamily: "system-ui, sans-serif", color: "#64748b" }}>
                Loading user profile details...
            </div>
        );
    }

    if (!profile) {
        return (
            <div style={{ padding: 40, textAlign: "center", fontFamily: "system-ui, sans-serif" }}>
                <h2>User profile details not found.</h2>
                <button onClick={() => navigate("/admin/risk-ranking")} style={backBtnStyle}>Go Back</button>
            </div>
        );
    }

    return (
        <div style={{ padding: "40px 30px", maxWidth: 1000, margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
            
            {/* Header Navigation */}
            <div style={{ display: "flex", alignItems: "center", gap: 15, marginBottom: 40 }}>
                <button onClick={() => navigate("/admin/risk-ranking")} style={backBtnStyle}>
                    <GoArrowLeftAny size={20} />
                </button>
                <div>
                    <h1 style={{ margin: 0, fontSize: 26, color: "#0f172a" }}>👤 User Security File</h1>
                    <p style={{ margin: "4px 0 0 0", color: "#64748b" }}>Detailed risk and trust analysis for Account #{profile.userId}</p>
                </div>
            </div>

            {/* Grid Container for Score Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30, marginBottom: 40 }}>
                
                {/* Risk Engine Card */}
                <div style={{ background: "white", padding: 30, borderRadius: 16, border: "1px solid #f1f5f9", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                        <FaUserShieldAny size={22} color={getRiskColor(profile.riskLevel)} />
                        <h2 style={{ margin: 0, fontSize: 18, color: "#1e293b" }}>Risk Assessment</h2>
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                        <span style={{ fontSize: 48, fontWeight: 700, color: "#0f172a" }}>
                            {profile.riskScore?.toFixed(1)}
                        </span>
                        <span style={{ fontSize: 16, color: "#64748b" }}>/ 100</span>
                    </div>
                    <div style={{ marginTop: 15 }}>
                        <span style={{
                            padding: "6px 12px",
                            borderRadius: 20,
                            background: getRiskColor(profile.riskLevel) + "15",
                            color: getRiskColor(profile.riskLevel),
                            fontWeight: 700,
                            fontSize: 14
                        }}>
                            {profile.riskLevel} RISK PROFILE
                        </span>
                    </div>
                    <p style={{ marginTop: 20, fontSize: 14, color: "#64748b", lineHeight: 1.5 }}>
                        Calculated by aggregate velocity counters, temporal indicators (such as nocturnal activity), and predictive ONNX outputs.
                    </p>
                </div>

                {/* Trust Engine Card */}
                <div style={{ background: "white", padding: 30, borderRadius: 16, border: "1px solid #f1f5f9", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                        <FaHeartbeatAny size={22} color={getTrustColor(profile.trustLevel)} />
                        <h2 style={{ margin: 0, fontSize: 18, color: "#1e293b" }}>Trust Index</h2>
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                        <span style={{ fontSize: 48, fontWeight: 700, color: "#0f172a" }}>
                            {profile.trustScore?.toFixed(1) ?? "100.0"}
                        </span>
                        <span style={{ fontSize: 16, color: "#64748b" }}>/ 100</span>
                    </div>
                    <div style={{ marginTop: 15 }}>
                        <span style={{
                            padding: "6px 12px",
                            borderRadius: 20,
                            background: getTrustColor(profile.trustLevel) + "15",
                            color: getTrustColor(profile.trustLevel),
                            fontWeight: 700,
                            fontSize: 14
                        }}>
                            {profile.trustLevel} REPUTATION
                        </span>
                    </div>
                    <p style={{ marginTop: 20, fontSize: 14, color: "#64748b", lineHeight: 1.5 }}>
                        Evaluated from continuous account age stability, verified registration fields, success rate of transactions, and long-term purchase patterns.
                    </p>
                </div>
            </div>

            {/* Diagnostic Indicators */}
            <div style={{ background: "white", padding: 30, borderRadius: 16, border: "1px solid #f1f5f9", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
                <h3 style={{ margin: "0 0 20px 0", fontSize: 18, color: "#0f172a" }}>🛡️ Dynamic Fraud Indicators</h3>
                <ul style={{ paddingLeft: 20, color: "#475569", lineHeight: 2.0, fontSize: 15 }}>
                    <li>
                        <strong style={{ color: profile.riskScore > 30 ? "#ef4444" : "#475569" }}>Nocturnal Activity Check:</strong>{" "}
                        {profile.riskScore > 30 ? "Nocturnal transaction frequencies detected between 22:00 and 06:00." : "Normal diurnal shopping hours profile."}
                    </li>
                    <li>
                        <strong style={{ color: profile.trustScore < 75 ? "#ef4444" : "#475569" }}>Account Stability:</strong>{" "}
                        {profile.trustScore >= 75 ? "Consistent purchasing history and high success rate." : "Account exhibits rolling cancellations or limited transaction age."}
                    </li>
                    <li>
                        <strong style={{ color: profile.riskScore > 70 ? "#ef4444" : "#475569" }}>Fraud Recurrence:</strong>{" "}
                        {profile.riskScore > 70 ? "Recent system alerts require active review to prevent repeat attacks." : "No confirmed recent historical fraud spikes."}
                    </li>
                </ul>
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