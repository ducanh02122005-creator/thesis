import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  NavLink
} from "react-router-dom";

// IMPORT 2 TRANG MỚI TÁCH
import LoginPage from "./component/pages/auth/Login";
import RegisterPage from "./component/pages/auth/RegisterPage";

import ProductMarketplace from "./component/pages/products/ProductMarketplace";
import Dashboard from "./component/pages/admin/Dashboard";
import UserRiskRanking from "./component/pages/admin/UserRiskRanking";
import UserRiskDetail from "./component/pages/admin/UserRiskDetail";
import FraudInvestigation from "./component/pages/admin/FraudInvestigation";
import ProductManagement from "./component/pages/products/ProductManagement";

/* =========================
   AUTH UTIL
========================= */
const getToken = () => localStorage.getItem("token");
const getRole = () => localStorage.getItem("role");

/* =========================
   PUBLIC ROUTE (Chặn truy cập Login/Register khi đã đăng nhập)
========================= */
function PublicRoute() {
  const token = getToken();
  const role = getRole();

  if (token) {
    return role === "ADMIN"
      ? <Navigate to="/admin/dashboard" replace />
      : <Navigate to="/market" replace />;
  }
  return <Outlet />;
}

/* =========================
   PROTECTED ROUTE (Kiểm tra đăng nhập & Phân quyền)
========================= */
function ProtectedRoute({
  allowedRoles,
}: {
  allowedRoles?: ("ADMIN" | "CUSTOMER")[];
}) {
  const token = getToken();
  const userRole = getRole() as "ADMIN" | "CUSTOMER";

  if (!token) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

/* =========================
   ADMIN LAYOUT
========================= */
function AdminLayout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
      <aside style={{ width: 260, background: "#0f172a", color: "white", padding: "30px 20px", display: "flex", flexDirection: "column", gap: 30 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, textAlign: "center", borderBottom: "1px solid #1e293b", paddingBottom: 20 }}>
          🛡 Fraud System
        </h2>
        <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <NavLink to="/admin/dashboard" style={navStyle}>📊 Dashboard</NavLink>
          <NavLink to="/admin/fraud" style={navStyle}>🚨 Fraud Investigation</NavLink>
          <NavLink to="/admin/risk-ranking" style={navStyle}>📈 Risk Ranking</NavLink>
          <NavLink to="/admin/products" style={navStyle}>📦 Product Management</NavLink>
        </nav>
      </aside>

      <main style={{ flex: 1, padding: 0, background: "#f8fafc" }}>
        <Outlet />
      </main>
    </div>
  );
}

const navStyle = ({ isActive }: any) => ({
  color: isActive ? "#38bdf8" : "#94a3b8",
  background: isActive ? "#1e293b" : "transparent",
  textDecoration: "none",
  padding: "12px 16px",
  borderRadius: "8px",
  fontWeight: 600,
  fontSize: 15,
  transition: "all 0.2s"
});

/* =========================
   ROOT REDIRECT
========================= */
function RootRedirect() {
  const token = getToken();
  const role = getRole();

  if (!token) return <Navigate to="/login" replace />;

  return role === "ADMIN"
    ? <Navigate to="/admin/dashboard" replace />
    : <Navigate to="/market" replace />;
}

/* =========================
   MAIN APP ROUTING
========================= */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================= AUTH ROUTES (TÁCH BIỆT) ================= */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* ================= MARKET ================= */}
        <Route
          path="/market"
          element={<ProtectedRoute allowedRoles={["CUSTOMER", "ADMIN"]} />}
        >
          <Route index element={<ProductMarketplace />} />
        </Route>

        {/* ================= ADMIN ================= */}
        <Route
          path="/admin"
          element={<ProtectedRoute allowedRoles={["ADMIN"]} />}
        >
          <Route element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="fraud" element={<FraudInvestigation />} />
            <Route path="risk-ranking" element={<UserRiskRanking />} />
            <Route path="risk-detail/:userId" element={<UserRiskDetail />} />
            <Route path="products" element={<ProductManagement />} />
          </Route>
        </Route>

        {/* ================= ROOT REDIRECTS ================= */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<RootRedirect />} />

      </Routes>
    </BrowserRouter>
  );
}