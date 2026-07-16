import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminApi } from "../../../api/adminApi";
import { GoArrowLeft } from "react-icons/go";
import {
    FaUser,
    FaPlus,
    FaSearch,
    FaTrash,
    FaPencilAlt,
    FaFilePdf,
    FaChartLine,
    FaTimes
} from "react-icons/fa";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from "recharts";
import "./UserRiskDetail.css";

const GoArrowLeftAny = GoArrowLeft as any;
const FaUserAny = FaUser as any;
const FaPlusAny = FaPlus as any;
const FaSearchAny = FaSearch as any;
const FaTrashAny = FaTrash as any;
const FaPencilAltAny = FaPencilAlt as any;
const FaFilePdfAny = FaFilePdf as any;
const FaChartLineAny = FaChartLine as any;
const FaTimesAny = FaTimes as any;

interface RiskProfile {
    userId: number;
    riskScore: number;
    riskLevel: string;
    trustScore: number;
    trustLevel: string;
    
    accountAgeScore?: number;
    purchaseSuccessRateScore?: number;
    fraudHistoryScore?: number;
    verificationScore?: number;
    purchaseActivityScore?: number;

    isEmailVerified?: boolean;
    isPhoneVerified?: boolean;
    phoneNumber?: string;
    email?: string;
    age?: number;
}

interface Transaction {
    transactionId: number;
    amount: number;
    category: string;
    transactionTime: string;
    fraudProbability: number;
    fraud: boolean;
    decision: string;
}

export default function UserRiskDetail() {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();

    const [profile, setProfile] = useState<RiskProfile | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Tab and layout selection
    const [activeTab, setActiveTab] = useState<"transactions" | "alerts" | "diagnostics">("transactions");
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [timeFilter, setTimeFilter] = useState("all");

    // Review Modal State
    const [reviewTransaction, setReviewTransaction] = useState<Transaction | null>(null);

    // Local auditor notes
    const [notes, setNotes] = useState<string>(() => {
        return localStorage.getItem(`notes_${userId}`) || "Auditor Notes:\n- Account matches diurnal patterns.\n- Score evaluated via model v2.";
    });
    const [isEditingNote, setIsEditingNote] = useState(false);
    const [noteInput, setNoteInput] = useState(notes);

    const loadData = () => {
        if (userId) {
            setLoading(true);
            Promise.all([
                adminApi.getUserRiskProfile(Number(userId)),
                adminApi.getUserTransactions(Number(userId))
            ])
            .then(([profileRes, transRes]) => {
                setProfile(profileRes.data);
                setTransactions(transRes.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load user audit profile:", err);
                setLoading(false);
            });
        }
    };

    useEffect(() => {
        loadData();
    }, [userId]);

    const handleSaveNote = () => {
        setNotes(noteInput);
        localStorage.setItem(`notes_${userId}`, noteInput);
        setIsEditingNote(false);
    };

    // Filtered transaction list
    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const matchSearch = t.category.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                t.transactionId.toString().includes(searchQuery) ||
                                t.amount.toString().includes(searchQuery);
            return matchSearch;
        });
    }, [transactions, searchQuery]);

    // Risk timeline chart data
    const chartData = useMemo(() => {
        return [...transactions]
            .reverse()
            .map((t, index) => ({
                index: index + 1,
                date: new Date(t.transactionTime).toLocaleDateString(),
                risk: Math.round(t.fraudProbability * 100)
            }));
    }, [transactions]);

    const getStatusBadge = (decision?: string) => {
        if (decision === "BLOCK") {
            return <span className="badge-round-status badge-status-pending">Blocked</span>; // orange/red
        }
        if (decision === "REVIEW") {
            return <span className="badge-round-status badge-status-draft">Review</span>; // gray
        }
        return <span className="badge-round-status badge-status-done">Approved</span>; // green
    };

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

    // Override / Update Transaction Decision
    const handleSaveDecision = (decision: string) => {
        if (!reviewTransaction || !userId) return;
        adminApi.updateTransactionDecision(reviewTransaction.transactionId, decision)
            .then(() => {
                // Reload profile & transactions list
                Promise.all([
                    adminApi.getUserRiskProfile(Number(userId)),
                    adminApi.getUserTransactions(Number(userId))
                ]).then(([profileRes, transRes]) => {
                    setProfile(profileRes.data);
                    setTransactions(transRes.data);
                });
                setReviewTransaction(null);
            })
            .catch(err => {
                console.error("Failed to update transaction decision:", err);
                alert("Failed to update decision: " + err.message);
            });
    };

    // Delete Transaction Handler
    const handleDeleteTransaction = (t: Transaction) => {
        if (!userId) return;
        const confirmDelete = window.confirm(
            `Are you sure you want to delete Order-${t.transactionId}? This will permanently remove the record and recalculate customer risk/trust scores.`
        );
        if (confirmDelete) {
            adminApi.deleteTransaction(t.transactionId)
                .then(() => {
                    // Reload profile & transactions list
                    Promise.all([
                        adminApi.getUserRiskProfile(Number(userId)),
                        adminApi.getUserTransactions(Number(userId))
                    ]).then(([profileRes, transRes]) => {
                        setProfile(profileRes.data);
                        setTransactions(transRes.data);
                    });
                })
                .catch(err => {
                    console.error("Failed to delete transaction:", err);
                    alert("Failed to delete transaction: " + err.message);
                });
        }
    };

    // Pseudo Verification Handlers
    const handleVerifyEmail = () => {
        if (!userId) return;
        adminApi.verifyEmail(Number(userId))
            .then(res => {
                setProfile(res.data);
                // Reload transactions to match new logs
                adminApi.getUserTransactions(Number(userId)).then(transRes => setTransactions(transRes.data));
                alert("Email verified successfully! Verification Score has been updated.");
            })
            .catch(err => {
                console.error("Failed to verify email:", err);
                alert("Failed to verify email: " + err.message);
            });
    };

    const handleVerifyPhone = () => {
        if (!userId) return;
        adminApi.verifyPhone(Number(userId))
            .then(res => {
                setProfile(res.data);
                adminApi.getUserTransactions(Number(userId)).then(transRes => setTransactions(transRes.data));
                alert("Phone verified successfully! Verification Score has been updated.");
            })
            .catch(err => {
                console.error("Failed to verify phone:", err);
                alert("Failed to verify phone: " + err.message);
            });
    };

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh", fontFamily: "system-ui, sans-serif", color: "#64748b" }}>
                Loading user profile...
            </div>
        );
    }

    if (!profile) {
        return (
            <div style={{ padding: 40, textAlign: "center", fontFamily: "system-ui, sans-serif" }}>
                <h2>User profile not found.</h2>
                <button onClick={() => navigate("/admin/risk-ranking")} style={{ background: "#4f46e5", color: "white", padding: "10px 20px", border: "none", borderRadius: 8 }}>Go Back</button>
            </div>
        );
    }

    return (
        <div className="detail-screen-container">
            
            {/* ================= TOP NAVIGATION BAR ================= */}
            <div className="detail-top-nav-bar">
                <div className="nav-back-title-group">
                    <button onClick={() => navigate("/admin/risk-ranking")} className="btn-nav-back-arrow">
                        <GoArrowLeftAny size={18} />
                    </button>
                    <h2 className="nav-detail-title">Customer security details</h2>
                </div>
            </div>

            {/* ================= OVERLAPPING BANNER CARD ================= */}
            <div className="detail-banner-card">
                <div className="banner-gradient-background" />
                <div className="banner-profile-info-overlap">
                    <div className="profile-identity-group">
                        <div className="profile-large-avatar-box">
                            <FaUserAny size={44} color="#64748b" />
                        </div>
                        <div className="profile-identity-texts">
                            <h1 className="profile-identity-name">Customer Account #{profile.userId}</h1>
                            <p className="profile-identity-sub">Security Risk Analysis Profile</p>
                        </div>
                    </div>
                    
                    <div className="banner-profile-actions">
                        <button onClick={() => setShowAnalytics(!showAnalytics)} className="btn-banner-action">
                            <FaChartLineAny size={13} color="#4f46e5" /> {showAnalytics ? "Close Analytics" : "Analytics"}
                        </button>
                    </div>
                </div>
            </div>

            {/* ================= ANALYTICS EXPANSION DRAWER ================= */}
            {showAnalytics && (
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 16, padding: 30, marginBottom: 30 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                        <h3 style={{ margin: 0, fontSize: 16, color: "#0f172a" }}>📈 Risk Index Trend Timeline</h3>
                        <button onClick={() => setShowAnalytics(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}>
                            <FaTimesAny size={16} />
                        </button>
                    </div>
                    {chartData.length === 0 ? (
                        <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>No historical data.</div>
                    ) : (
                        <div style={{ width: "100%", height: 240 }}>
                            <ResponsiveContainer>
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorDetailsRisk" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[0, 100]} />
                                    <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                                    <Area type="monotone" dataKey="risk" name="Risk Score %" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDetailsRisk)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            )}

            {/* ================= TAB CONTROL BAR ================= */}
            <div className="detail-tabs-row">
                <button
                    onClick={() => setActiveTab("transactions")}
                    className={`detail-tab-btn ${activeTab === "transactions" ? "active" : ""}`}
                >
                    Transactions
                </button>
                <button
                    onClick={() => setActiveTab("alerts")}
                    className={`detail-tab-btn ${activeTab === "alerts" ? "active" : ""}`}
                >
                    Security Alerts
                </button>
                <button
                    onClick={() => setActiveTab("diagnostics")}
                    className={`detail-tab-btn ${activeTab === "diagnostics" ? "active" : ""}`}
                >
                    Diagnostic Indicators
                </button>
            </div>

            {/* ================= DUAL COLUMN WORKSPACE ================= */}
            <div className="detail-dual-workspace">
                
                {/* LEFT WORKSPACE PANELS */}
                <div className="detail-work-area-pane">
                    
                    {activeTab === "transactions" && (
                        <>
                            {/* Action Bar */}
                            <div className="work-area-action-bar">
                                <button className="btn-purple-primary-action" onClick={() => alert("Simulated checkout process completed.")}>
                                    <FaPlusAny size={12} /> New order
                                </button>
                                <div className="action-bar-filters">
                                    <select
                                        value={timeFilter}
                                        onChange={(e) => setTimeFilter(e.target.value)}
                                        className="filter-select-dropdown"
                                    >
                                        <option value="all">This month</option>
                                        <option value="all">All time</option>
                                    </select>
                                    <input
                                        placeholder="Search orders..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="filter-search-box-input"
                                    />
                                </div>
                            </div>

                            {/* Data Table */}
                            <div className="detail-work-table-container">
                                <table className="detail-work-table">
                                    <thead>
                                        <tr>
                                            <th>Order num.</th>
                                            <th>Date</th>
                                            <th>Amount</th>
                                            <th>Category</th>
                                            <th>Status</th>
                                            <th style={{ textAlign: "right" }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTransactions.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} style={{ padding: 30, textAlign: "center", color: "#64748b" }}>
                                                    No transactions matched criteria.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredTransactions.map(t => (
                                                <tr key={t.transactionId}>
                                                    <td style={{ fontWeight: 600 }}>Order-{t.transactionId}</td>
                                                    <td style={{ color: "#64748b" }}>{new Date(t.transactionTime).toLocaleDateString()}</td>
                                                    <td style={{ fontWeight: 700 }}>${t.amount.toFixed(2)}</td>
                                                    <td style={{ textTransform: "capitalize" }}>{t.category.replace("_", " ")}</td>
                                                    <td>{getStatusBadge(t.decision)}</td>
                                                    <td style={{ textAlign: "right" }}>
                                                        <div className="table-row-action-btn-group">
                                                            <button onClick={() => setReviewTransaction(t)} className="btn-table-action-icon edit"><FaPencilAltAny size={12} /></button>
                                                            <button onClick={() => handleDeleteTransaction(t)} className="btn-table-action-icon"><FaTrashAny size={12} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {activeTab === "alerts" && (
                        <div className="detail-work-table-container" style={{ padding: 24 }}>
                            <h3 style={{ margin: "0 0 15px 0", fontSize: 16 }}>Live System Alerts</h3>
                            {transactions.filter(t => t.fraud).length === 0 ? (
                                <p style={{ color: "#64748b", margin: 0 }}>No flagged alerts on file for this user.</p>
                            ) : (
                                <ul style={{ margin: 0, paddingLeft: 20, color: "#334155" }}>
                                    {transactions.filter(t => t.fraud).map(t => (
                                        <li key={t.transactionId} style={{ marginBottom: 10 }}>
                                            <strong>Order-{t.transactionId}</strong>: Flagged as High Fraud Probability ({(t.fraudProbability * 100).toFixed(0)}%). Decision set to <strong>{t.decision}</strong>.
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}

                    {activeTab === "diagnostics" && (
                        <div className="detail-work-table-container" style={{ padding: 24 }}>
                            <h3 style={{ margin: "0 0 20px 0", fontSize: 16, color: "#0f172a" }}>📊 Trust Score Component Breakdown</h3>
                            
                            <div style={{ display: "flex", flexDirection: "column", gap: 20, fontFamily: "system-ui, sans-serif" }}>
                                
                                {/* Component 1: Account Age */}
                                <div>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                                        <span>⏳ Account Age Score (A) - Weight: 20%</span>
                                        <span>{profile.accountAgeScore?.toFixed(1) ?? "0.0"}%</span>
                                    </div>
                                    <div style={{ height: 8, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                                        <div style={{ height: "100%", width: `${profile.accountAgeScore ?? 0}%`, background: "#3b82f6", borderRadius: 4 }} />
                                    </div>
                                    <span style={{ fontSize: 11, color: "#64748b", marginTop: 4, display: "block" }}>
                                        Reflects how long the account has been registered (normalized up to 180 days) adjusted by customer's age stability factor.
                                    </span>
                                </div>

                                {/* Component 2: Success Rate */}
                                <div>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                                        <span>📈 Purchase Success Rate Score (S) - Weight: 30%</span>
                                        <span>{profile.purchaseSuccessRateScore?.toFixed(1) ?? "0.0"}%</span>
                                    </div>
                                    <div style={{ height: 8, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                                        <div style={{ height: "100%", width: `${profile.purchaseSuccessRateScore ?? 0}%`, background: "#10b981", borderRadius: 4 }} />
                                    </div>
                                    <span style={{ fontSize: 11, color: "#64748b", marginTop: 4, display: "block" }}>
                                        Proportion of successfully completed checkouts relative to total checkout requests.
                                    </span>
                                </div>

                                {/* Component 3: Fraud History */}
                                <div>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                                        <span>🚨 Fraud History Score (H) - Weight: 30%</span>
                                        <span>{profile.fraudHistoryScore?.toFixed(1) ?? "0.0"}%</span>
                                    </div>
                                    <div style={{ height: 8, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                                        <div style={{ height: "100%", width: `${profile.fraudHistoryScore ?? 0}%`, background: "#ef4444", borderRadius: 4 }} />
                                    </div>
                                    <span style={{ fontSize: 11, color: "#64748b", marginTop: 4, display: "block" }}>
                                        Deducts points for every confirmed fraud transaction alert on this customer's account.
                                    </span>
                                </div>

                                {/* Component 4: Verification Score */}
                                <div>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                                        <span>🛡️ Verification Score (V) - Weight: 10%</span>
                                        <span>{profile.verificationScore?.toFixed(1) ?? "0.0"}%</span>
                                    </div>
                                    <div style={{ height: 8, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                                        <div style={{ height: "100%", width: `${profile.verificationScore ?? 0}%`, background: "#6366f1", borderRadius: 4 }} />
                                    </div>
                                    <span style={{ fontSize: 11, color: "#64748b", marginTop: 4, display: "block" }}>
                                        Reflects email verification (50%) and phone verification (50%) status.
                                    </span>
                                </div>

                                {/* Component 5: Purchase Activity */}
                                <div>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                                        <span>🛒 Purchase Activity Score (P) - Weight: 10%</span>
                                        <span>{profile.purchaseActivityScore?.toFixed(1) ?? "0.0"}%</span>
                                    </div>
                                    <div style={{ height: 8, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                                        <div style={{ height: "100%", width: `${profile.purchaseActivityScore ?? 0}%`, background: "#8b5cf6", borderRadius: 4 }} />
                                    </div>
                                    <span style={{ fontSize: 11, color: "#64748b", marginTop: 4, display: "block" }}>
                                        Measures cumulative long-term checkout frequency (up to 10 purchases).
                                    </span>
                                </div>

                            </div>
                        </div>
                    )}

                </div>

                {/* RIGHT SIDEBAR PANEL */}
                <aside className="detail-sidebar-info-panel">
                    
                    {/* Information block */}
                    <div>
                        <h4 className="sidebar-info-section-title">Information</h4>
                        <div className="sidebar-info-attributes-list">
                            <div className="info-attribute-row">
                                <span className="info-attr-label">Person</span>
                                <span className="info-attr-value">Customer #{profile.userId}</span>
                            </div>
                            <div className="info-attribute-row">
                                <span className="info-attr-label">Age</span>
                                <span className="info-attr-value" style={{ fontWeight: 600, color: "#0f172a" }}>
                                    {profile.age || "Not Specified"} Years Old
                                </span>
                            </div>
                            <div className="info-attribute-row">
                                <span className="info-attr-label">Risk Index</span>
                                <span className="info-attr-value" style={{ color: getRiskColor(profile.riskLevel) }}>
                                    {profile.riskScore.toFixed(1)} ({profile.riskLevel})
                                </span>
                            </div>
                            <div className="info-attribute-row">
                                <span className="info-attr-label">Trust Index</span>
                                <span className="info-attr-value" style={{ color: getTrustColor(profile.trustLevel) }}>
                                    {profile.trustScore.toFixed(1)} ({profile.trustLevel})
                                </span>
                            </div>
                            <div className="info-attribute-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span className="info-attr-label">Phone</span>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <span className="info-attr-value">{profile.phoneNumber || "Not Specified"}</span>
                                    {profile.isPhoneVerified ? (
                                        <span style={{ fontSize: 11, background: "#ecfdf5", color: "#10b981", padding: "2px 6px", borderRadius: 4, fontWeight: 600 }}>Verified</span>
                                    ) : (
                                        <button onClick={handleVerifyPhone} style={{ fontSize: 10, background: "#4f46e5", color: "white", border: "none", padding: "3px 8px", borderRadius: 4, cursor: "pointer", fontWeight: 600 }}>Verify</button>
                                    )}
                                </div>
                            </div>
                            <div className="info-attribute-row">
                                <span className="info-attr-label">Telegram</span>
                                <span className="info-attr-value">@auditor_jackson</span>
                            </div>
                            <div className="info-attribute-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span className="info-attr-label">Email</span>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <span className="info-attr-value">{profile.email || `user${profile.userId}@guard.com`}</span>
                                    {profile.isEmailVerified ? (
                                        <span style={{ fontSize: 11, background: "#ecfdf5", color: "#10b981", padding: "2px 6px", borderRadius: 4, fontWeight: 600 }}>Verified</span>
                                    ) : (
                                        <button onClick={handleVerifyEmail} style={{ fontSize: 10, background: "#4f46e5", color: "white", border: "none", padding: "3px 8px", borderRadius: 4, cursor: "pointer", fontWeight: 600 }}>Verify</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notes block */}
                    <div>
                        <h4 className="sidebar-info-section-title">Notes</h4>
                        {isEditingNote ? (
                            <div>
                                <textarea
                                    value={noteInput}
                                    onChange={(e) => setNoteInput(e.target.value)}
                                    className="notes-textarea"
                                />
                                <div style={{ display: "flex", gap: 10 }}>
                                    <button onClick={handleSaveNote} className="btn-save-note">Save</button>
                                    <button onClick={() => setIsEditingNote(false)} className="btn-save-note" style={{ background: "#cbd5e1", color: "#334155" }}>Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <p style={{ fontSize: 13, color: "#475569", whiteSpace: "pre-line", margin: "0 0 10px 0" }}>
                                    {notes}
                                </p>
                                <button onClick={() => { setNoteInput(notes); setIsEditingNote(true); }} className="notes-editor-trigger">
                                    + Add notes...
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Documents block */}
                    <div>
                        <h4 className="sidebar-info-section-title">Documents</h4>
                        <div className="documents-list-section">
                            <div className="document-item-row">
                                <div className="document-item-meta">
                                    <FaFilePdfAny size={14} color="#ef4444" /> Security_Report_{profile.userId}.pdf
                                </div>
                                <span style={{ color: "#94a3b8", fontSize: 12 }}>●</span>
                            </div>
                            <div className="document-item-row">
                                <div className="document-item-meta">
                                    <FaFilePdfAny size={14} color="#ef4444" /> Audit_Certificate.pdf
                                </div>
                                <span style={{ color: "#94a3b8", fontSize: 12 }}>●</span>
                            </div>
                            <button className="btn-add-file-trigger" onClick={() => alert("Simulated file uploads.")}>
                                <FaPlusAny size={11} /> Add file
                            </button>
                        </div>
                    </div>

                </aside>

            </div>

            {/* ================= TRANSACTION REVIEW MODAL ================= */}
            {reviewTransaction && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: 15, marginBottom: 20 }}>
                            <h3 style={{ margin: 0, fontSize: 16 }}>Review Order-{reviewTransaction.transactionId}</h3>
                            <button onClick={() => setReviewTransaction(null)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}>
                                <FaTimesAny size={16} />
                            </button>
                        </div>
                        
                        <div style={{ fontSize: 14, color: "#334155", marginBottom: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                            <div><strong>Category:</strong> {reviewTransaction.category.replace("_", " ")}</div>
                            <div><strong>Amount:</strong> ${reviewTransaction.amount.toFixed(2)}</div>
                            <div><strong>Date:</strong> {new Date(reviewTransaction.transactionTime).toLocaleString()}</div>
                            <div><strong>Current Status:</strong> {reviewTransaction.decision}</div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            <button onClick={() => handleSaveDecision("APPROVE")} style={btnApproveStyle}>
                                ✅ Approve (Mark as Safe)
                            </button>
                            <button onClick={() => handleSaveDecision("BLOCK")} style={btnBlockStyle}>
                                🚨 Block (Flag as Fraud)
                            </button>
                            <button onClick={() => handleSaveDecision("REVIEW")} style={btnReviewStyle}>
                                🔍 Keep in Review
                            </button>
                            <button onClick={() => setReviewTransaction(null)} style={btnCancelStyle}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

const modalOverlayStyle = {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    backdropFilter: "blur(4px)"
};

const modalContentStyle = {
    background: "#ffffff",
    padding: 24,
    borderRadius: 16,
    border: "1px solid #e2e8f0",
    width: "100%",
    maxWidth: 400,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
};

const btnApproveStyle = {
    padding: "10px 16px",
    background: "#10b981",
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "bold" as const,
    fontSize: 13,
    textAlign: "left" as const
};

const btnBlockStyle = {
    padding: "10px 16px",
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "bold" as const,
    fontSize: 13,
    textAlign: "left" as const
};

const btnReviewStyle = {
    padding: "10px 16px",
    background: "#f59e0b",
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "bold" as const,
    fontSize: 13,
    textAlign: "left" as const
};

const btnCancelStyle = {
    padding: "10px 16px",
    background: "#cbd5e1",
    color: "#334155",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "bold" as const,
    fontSize: 13
};