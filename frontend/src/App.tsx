import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  NavLink,
  useNavigate
} from "react-router-dom";

import "./component/pages/admin/AdminLayout.css";

// IMPORT 2 TRANG MỚI TÁCH
import LoginPage from "./component/pages/auth/Login";
import RegisterPage from "./component/pages/auth/RegisterPage";

import ProductMarketplace from "./component/pages/products/ProductMarketplace";
import Dashboard from "./component/pages/admin/Dashboard";
import UserRiskRanking from "./component/pages/admin/UserRiskRanking";
import UserRiskDetail from "./component/pages/admin/UserRiskDetail";
import FraudInvestigation from "./component/pages/admin/FraudInvestigation";
import ProductManagement from "./component/pages/products/ProductManagement";
import PersonalTransactions from "./component/pages/products/PersonalTransactions";
import CategoryShop from "./component/pages/products/CategoryShop";

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
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="admin-layout-wrapper">
      <aside className="admin-sidebar">
        <div>
          <div className="sidebar-logo" onClick={() => navigate("/admin/dashboard")} style={{ cursor: "pointer" }}>
            <span>final</span>ui
          </div>
          <nav className="sidebar-nav-list">
            <NavLink to="/admin/dashboard" className="sidebar-nav-item">📊 Dashboard</NavLink>
            <NavLink to="/admin/products" className="sidebar-nav-item">📦 Products</NavLink>
            <NavLink to="/admin/risk-ranking" className="sidebar-nav-item">👥 Customers</NavLink>
            <NavLink to="/admin/investigation" className="sidebar-nav-item">🚨 Alerts</NavLink>
            <NavLink to="/market" className="sidebar-nav-item">🛒 Marketplace</NavLink>
          </nav>
        </div>

        <div>
          <div className="sidebar-divider" />
          <div className="sidebar-footer-profile" onClick={handleLogout} style={{ cursor: "pointer" }} title="Click to Logout">
            <div className="profile-avatar-circle">DM</div>
            <div className="profile-text-info">
              <span className="profile-name-text">Diana Mary</span>
              <span className="profile-role-text">Settings</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="admin-main-panel">
        <Outlet />
      </main>
    </div>
  );
}

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

        {/* ================= PERSONAL HISTORY ================= */}
        <Route
          path="/history"
          element={<ProtectedRoute allowedRoles={["CUSTOMER", "ADMIN"]} />}
        >
          <Route index element={<PersonalTransactions />} />
        </Route>

        {/* ================= CATEGORY SHOP ================= */}
        <Route
          path="/shop/:category/:productId"
          element={<ProtectedRoute allowedRoles={["CUSTOMER", "ADMIN"]} />}
        >
          <Route index element={<CategoryShop />} />
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