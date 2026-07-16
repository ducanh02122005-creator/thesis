import { useEffect, useState, useMemo } from "react";
import { adminApi } from "../../../api/adminApi";
import { useNavigate } from "react-router-dom";
import { GoArrowLeft, GoArrowUp, GoArrowDown } from "react-icons/go";
import { FaUserShield, FaHeartbeat, FaHistory, FaStar, FaSearch } from "react-icons/fa";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    AreaChart,
    Area
} from "recharts";

const GoArrowLeftAny = GoArrowLeft as any;
const GoArrowUpAny = GoArrowUp as any;
const GoArrowDownAny = GoArrowDown as any;
const FaUserShieldAny = FaUserShield as any;
const FaHeartbeatAny = FaHeartbeat as any;
const FaHistoryAny = FaHistory as any;
const FaStarAny = FaStar as any;
const FaSearchAny = FaSearch as any;

type TopUserResponse = {
    userId: number;
    fullName: string;
    email: string;
    fraudCount: number;
    riskScore: number;
    riskLevel?: string;
    trustScore?: number;
    trustLevel?: string;
};

interface Transaction {
    transactionId: number;
    amount: number;
    category: string;
    transactionTime: string;
    fraudProbability: number;
    fraud: boolean;
    decision: string;
}

type SortColumnType = 'userId' | 'fullName' | 'fraudCount' | 'riskScore' | 'trustScore';
type SortDirectionType = 'asc' | 'desc';

export default function UserRiskRanking() {
    const navigate = useNavigate();
    const [users, setUsers] = useState<TopUserResponse[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [selectedTransactions, setSelectedTransactions] = useState<Transaction[]>([]);
    const [loadingDetails, setLoadingDetails] = useState(false);
    
    // Search and Sort State
    const [searchQuery, setSearchQuery] = useState("");
    const [sortColumn, setSortColumn] = useState<SortColumnType>('fraudCount');
    const [sortDirection, setSortDirection] = useState<SortDirectionType>('desc');

    // Fetch all customers ranking
    useEffect(() => {
        adminApi.getAllUsersRisk()
            .then(res => {
                setUsers(res.data);
                if (res.data.length > 0) {
                    // Try to find if there is a customer with actual fraud count first, otherwise default to first
                    const initialUser = res.data.find((u: any) => u.fraudCount > 0) || res.data[0];
                    setSelectedUserId(initialUser.userId);
                }
            })
            .catch(err => console.error("Failed to load all users risk:", err));
    }, []);

    // Fetch transaction details of selected user
    useEffect(() => {
        if (selectedUserId) {
            setLoadingDetails(true);
            adminApi.getUserTransactions(selectedUserId)
                .then(res => {
                    setSelectedTransactions(res.data);
                    setLoadingDetails(false);
                })
                .catch(err => {
                    console.error("Failed to load user transactions:", err);
                    setLoadingDetails(false);
                });
        }
    }, [selectedUserId]);

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

    const getDecisionBadge = (decision?: string) => {
        if (decision === "BLOCK") {
            return { bg: "#fef2f2", color: "#ef4444", border: "#fca5a5" };
        }
        if (decision === "REVIEW") {
            return { bg: "#fffbeb", color: "#d97706", border: "#fde68a" };
        }
        return { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" };
    };

    const handleSort = (column: SortColumnType) => {
        if (sortColumn === column) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('desc');
        }
    };

    // Filter and Sort users list
    const filteredAndSortedUsers = useMemo(() => {
        let result = users.filter(u => {
            const query = searchQuery.toLowerCase();
            return u.email?.toLowerCase().includes(query) || u.userId.toString().includes(query);
        });

        result.sort((a, b) => {
            let valA = a[sortColumn] ?? 0;
            let valB = b[sortColumn] ?? 0;

            if (sortColumn === 'fullName') {
                const strA = a.fullName.toLowerCase();
                const strB = b.fullName.toLowerCase();
                return sortDirection === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
            }

            // Numeric sorts
            return sortDirection === 'asc' 
                ? (valA as number) - (valB as number) 
                : (valB as number) - (valA as number);
        });

        return result;
    }, [users, searchQuery, sortColumn, sortDirection]);

    // Prepare chart data comparison for all high-risk users
    const comparisonChartData = useMemo(() => {
        return users
            .filter(u => u.fraudCount > 0 || u.riskScore > 10)
            .slice(0, 10) // show top 10 for clean chart spacing
            .map(u => ({
                name: u.fullName.split(" ")[0] || `User ${u.userId}`,
                "Risk Score": parseFloat(u.riskScore.toFixed(1)),
                "Trust Score": parseFloat((u.trustScore ?? 100).toFixed(1))
            }));
    }, [users]);

    // Prepare timeline chart for selected user
    const selectedTimelineData = useMemo(() => {
        return [...selectedTransactions]
            .reverse()
            .map((t, index) => ({
                index: index + 1,
                date: new Date(t.transactionTime).toLocaleDateString(),
                risk: Math.round(t.fraudProbability * 100)
            }));
    }, [selectedTransactions]);

    const selectedUser = useMemo(() => {
        return users.find(u => u.userId === selectedUserId) || null;
    }, [users, selectedUserId]);

    const renderSortArrow = (column: SortColumnType) => {
        if (sortColumn !== column) return null;
        return sortDirection === 'asc' 
            ? <GoArrowUpAny size={14} style={{ marginLeft: 4, verticalAlign: "middle" }} /> 
            : <GoArrowDownAny size={14} style={{ marginLeft: 4, verticalAlign: "middle" }} />;
    };

    return (
        <div style={{ padding: "40px 30px", maxWidth: 1450, margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
            
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 15, marginBottom: 30 }}>
                <button onClick={() => navigate("/admin/dashboard")} style={backBtnStyle}>
                    <GoArrowLeftAny size={20} />
                </button>
                <h1 style={{ margin: 0, fontSize: 26, color: "#0f172a" }}>👤 Customer Risk & Trust Audit</h1>
            </div>

            {/* Split Screen Layout */}
            <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 30, alignItems: "start" }}>
                
                {/* LEFT COLUMN: Comparison Chart & Table */}
                <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
                    
                    {/* Comparison Bar Chart */}
                    <div style={cardStyle}>
                        <h3 style={{ margin: "0 0 20px 0", fontSize: 16, color: "#0f172a" }}>📊 Customer Risk & Trust Metrics (Top Flagged)</h3>
                        {comparisonChartData.length === 0 ? (
                            <div style={{ padding: 30, textAlign: "center", color: "#94a3b8" }}>No active customer comparison metrics.</div>
                        ) : (
                            <div style={{ width: "100%", height: 220 }}>
                                <ResponsiveContainer>
                                    <BarChart data={comparisonChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                                        <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                                        <Bar dataKey="Risk Score" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="Trust Score" fill="#10b981" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>

                    {/* Users Ranking Table with Searching & Sorting */}
                    <div style={{ ...cardStyle, padding: 0 }}>
                        <div style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 15 }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: 16, color: "#0f172a" }}>All Customers Listing</h3>
                                <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: 13 }}>Click table headers to sort, row to view details</p>
                            </div>
                            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                                <FaSearchAny size={14} style={{ position: "absolute", left: 12, color: "#94a3b8" }} />
                                <input
                                    type="text"
                                    placeholder="Search customer email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={searchStyle}
                                />
                            </div>
                        </div>

                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                                <thead>
                                    <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                                        <th onClick={() => handleSort('userId')} style={sortThStyle}>
                                            User ID {renderSortArrow('userId')}
                                        </th>
                                        <th onClick={() => handleSort('fullName')} style={sortThStyle}>
                                            Full Name {renderSortArrow('fullName')}
                                        </th>
                                        <th onClick={() => handleSort('fraudCount')} style={sortThStyle}>
                                            Fraud Cases {renderSortArrow('fraudCount')}
                                        </th>
                                        <th onClick={() => handleSort('riskScore')} style={sortThStyle}>
                                            Risk Score {renderSortArrow('riskScore')}
                                        </th>
                                        <th onClick={() => handleSort('trustScore')} style={sortThStyle}>
                                            Trust Score {renderSortArrow('trustScore')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAndSortedUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} style={{ padding: 40, textAlign: "center", color: "#64748b" }}>
                                                No customer accounts found matching search criteria.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredAndSortedUsers.map(user => (
                                            <tr
                                                key={user.userId}
                                                onClick={() => setSelectedUserId(user.userId)}
                                                style={{
                                                    borderBottom: "1px solid #f1f5f9",
                                                    cursor: "pointer",
                                                    background: selectedUserId === user.userId ? "#f0f9ff" : "transparent",
                                                    transition: "background 0.2s"
                                                }}
                                            >
                                                <td style={tdStyle}>#{user.userId}</td>
                                                <td style={{ ...tdStyle, fontWeight: 600, color: "#1e293b" }}>
                                                    <div>{user.fullName}</div>
                                                    <div style={{ fontWeight: 400, fontSize: 11, color: "#64748b", marginTop: 2 }}>{user.email}</div>
                                                </td>
                                                <td style={tdStyle}>
                                                    <span style={{ fontWeight: 500, color: user.fraudCount > 0 ? "#ef4444" : "#64748b" }}>
                                                        {user.fraudCount > 0 ? `🚨 ${user.fraudCount}` : "0"}
                                                    </span>
                                                </td>
                                                <td style={tdStyle}>
                                                    <div style={{ fontWeight: 600, color: getRiskColor(user.riskLevel) }}>
                                                        {user.riskScore?.toFixed(1)}
                                                    </div>
                                                </td>
                                                <td style={tdStyle}>
                                                    <div style={{ fontWeight: 600, color: getTrustColor(user.trustLevel) }}>
                                                        {user.trustScore?.toFixed(1) ?? "100.0"}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Selected Customer Audit Panel */}
                <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
                    {selectedUser ? (
                        <>
                            {/* Profile Scores Details */}
                            <div style={cardStyle}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                                    <h3 style={{ margin: 0, fontSize: 18, color: "#0f172a" }}>👤 {selectedUser.fullName}</h3>
                                    <button
                                        onClick={() => navigate(`/admin/risk-detail/${selectedUser.userId}`)}
                                        style={viewDetailsBtnStyle}
                                    >
                                        Full Security File →
                                    </button>
                                </div>

                                <div style={{ display: "flex", gap: 20 }}>
                                    <div style={{ flex: 1, background: getRiskColor(selectedUser.riskLevel) + "06", padding: 15, borderRadius: 8, border: `1px solid ${getRiskColor(selectedUser.riskLevel)}20` }}>
                                        <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>RISK SCORE</span>
                                        <div style={{ fontSize: 24, fontWeight: 700, color: getRiskColor(selectedUser.riskLevel) }}>
                                            {selectedUser.riskScore.toFixed(1)}
                                        </div>
                                    </div>
                                    <div style={{ flex: 1, background: getTrustColor(selectedUser.trustLevel) + "06", padding: 15, borderRadius: 8, border: `1px solid ${getTrustColor(selectedUser.trustLevel)}20` }}>
                                        <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>TRUST SCORE</span>
                                        <div style={{ fontSize: 24, fontWeight: 700, color: getTrustColor(selectedUser.trustLevel) }}>
                                            {(selectedUser.trustScore ?? 100.0).toFixed(1)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Risk Timeline Chart */}
                            <div style={cardStyle}>
                                <h4 style={{ margin: "0 0 15px 0", fontSize: 14, color: "#0f172a" }}>📈 Risk Index Trend Timeline</h4>
                                {loadingDetails ? (
                                    <div style={{ padding: 20, textAlign: "center", color: "#64748b", fontSize: 13 }}>Loading...</div>
                                ) : selectedTimelineData.length === 0 ? (
                                    <div style={{ padding: 20, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>No chart data.</div>
                                ) : (
                                    <div style={{ width: "100%", height: 160 }}>
                                        <ResponsiveContainer>
                                            <AreaChart data={selectedTimelineData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorRiskPane" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                                                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} domain={[0, 100]} />
                                                <Tooltip contentStyle={{ fontSize: 11 }} />
                                                <Area type="monotone" dataKey="risk" name="Risk %" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorRiskPane)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </div>

                            {/* Transactions list */}
                            <div style={cardStyle}>
                                <h4 style={{ margin: "0 0 15px 0", fontSize: 14, color: "#0f172a" }}>📋 Recent Detailed Transactions</h4>
                                {loadingDetails ? (
                                    <div style={{ padding: 20, textAlign: "center", color: "#64748b", fontSize: 13 }}>Loading...</div>
                                ) : selectedTransactions.length === 0 ? (
                                    <div style={{ padding: 20, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>No transactions logged.</div>
                                ) : (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 220, overflowY: "auto" }}>
                                        {selectedTransactions.slice(0, 5).map(t => {
                                            const badge = getDecisionBadge(t.decision);
                                            return (
                                                <div key={t.transactionId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", border: "1px solid #f1f5f9", borderRadius: 8 }}>
                                                    <div>
                                                        <div style={{ fontWeight: 600, fontSize: 13 }}>${t.amount.toFixed(2)}</div>
                                                        <div style={{ fontSize: 11, color: "#94a3b8" }}>{new Date(t.transactionTime).toLocaleDateString()} • {t.category.replace("_", " ")}</div>
                                                    </div>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                        <span style={{ fontSize: 12, fontWeight: "bold", color: t.fraudProbability >= 0.5 ? "#ef4444" : "#16a34a" }}>
                                                            {(t.fraudProbability * 100).toFixed(0)}%
                                                        </span>
                                                        <span style={{
                                                            background: badge.bg,
                                                            color: badge.color,
                                                            border: `1px solid ${badge.border}`,
                                                            padding: "2px 6px",
                                                            borderRadius: 4,
                                                            fontSize: 10,
                                                            fontWeight: "bold"
                                                        }}>
                                                            {t.decision || "APPROVE"}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div style={{ ...cardStyle, textAlign: "center", color: "#94a3b8", padding: 60 }}>
                            Select a user to audit details.
                        </div>
                    )}
                </div>
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

const sortThStyle = {
    padding: "16px 20px",
    color: "#475569",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
    userSelect: "none" as const,
    transition: "background 0.2s"
};

const tdStyle = {
    padding: "16px 20px",
    color: "#64748b",
    fontSize: 14
};

const cardStyle = {
    background: "white",
    padding: 24,
    borderRadius: 16,
    border: "1px solid #f1f5f9",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.03)"
};

const viewDetailsBtnStyle = {
    background: "none",
    border: "none",
    color: "#4f46e5",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer"
};

const searchStyle = {
    padding: "8px 12px 8px 34px",
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    outline: "none",
    fontSize: 13,
    width: 200,
    fontFamily: "system-ui, sans-serif"
};