import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../../../api/adminApi";
import { AlertResponse } from "../../../types/alert";

export default function FraudInvestigation() {
    const navigate = useNavigate();

    const [alerts, setAlerts] = useState<AlertResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState("ALL");

    useEffect(() => {
        loadAlerts();
    }, []);

    const loadAlerts = async () => {
        setLoading(true);
        const res = await adminApi.getAllAlerts();
        setAlerts(res.data);
        setLoading(false);
    };

    const updateStatus = async (alertId: number, status: string) => {
        await adminApi.updateStatus({
            alertId: alertId,
            status
        });

        loadAlerts();
    };

    const filtered = alerts.filter(a =>
        filter === "ALL" ? true : a.status === filter
    );

    return (
        <div style={{ padding: 20 }}>

            <h1>🚨 Fraud Investigation</h1>

            {/* FILTER */}
            <div style={{ marginBottom: 15 }}>
                <button onClick={() => setFilter("ALL")}>All</button>
                <button onClick={() => setFilter("OPEN")}>Open</button>
                <button onClick={() => setFilter("CONFIRMED")}>Confirmed</button>
                <button onClick={() => setFilter("FALSE_POSITIVE")}>False</button>
            </div>

            {loading && <p>Loading...</p>}

            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: 15
            }}>

                {filtered.map(alert => (

                    <div key={alert.alertId} style={{
                        border: "1px solid #ddd",
                        borderRadius: 12,
                        padding: 15,
                        boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
                    }}>

                        <h3>Alert #{alert.alertId}</h3>

                        <p>Transaction: {alert.transactionId}</p>

                        <p>
                            Risk Score:{" "}
                            <b style={{
                                color: alert.riskScore > 0.8 ? "red" : "orange"
                            }}>
                                {alert.riskScore.toFixed(2)}
                            </b>
                        </p>

                        <p>
                            Status:{" "}
                            <span style={{
                                padding: "4px 10px",
                                borderRadius: 20,
                                background:
                                    alert.status === "CONFIRMED"
                                        ? "#ef4444"
                                        : alert.status === "FALSE_POSITIVE"
                                            ? "#22c55e"
                                            : "#f59e0b",
                                color: "white"
                            }}>
                                {alert.status}
                            </span>
                        </p>

                        <p>
                            {new Date(alert.createdAt).toLocaleString()}
                        </p>

                        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>

                             <button
                                onClick={() =>
                                    updateStatus(alert.alertId, "CONFIRMED")
                                }
                                style={{
                                    background: "#ef4444",
                                    color: "white",
                                    border: "none",
                                    padding: "6px 10px",
                                    borderRadius: 6,
                                    cursor: "pointer"
                                }}
                            >
                                Confirm
                            </button>

                            <button
                                onClick={() =>
                                    updateStatus(alert.alertId, "FALSE_POSITIVE")
                                }
                                style={{
                                    background: "#22c55e",
                                    color: "white",
                                    border: "none",
                                    padding: "6px 10px",
                                    borderRadius: 6,
                                    cursor: "pointer"
                                }}
                            >
                                False
                            </button>

                            <button
                                onClick={() => navigate(`/admin/risk-detail/${alert.userId}`)}
                                style={{
                                    background: "#3b82f6",
                                    color: "white",
                                    border: "none",
                                    padding: "6px 10px",
                                    borderRadius: 6,
                                    cursor: "pointer"
                                }}
                            >
                                🔍 Inspect Profile
                            </button>

                        </div>

                    </div>

                ))}

            </div>

        </div>
    );
}