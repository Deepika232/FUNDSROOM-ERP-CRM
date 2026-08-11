import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../types/auth.types";
import "./Layout.css";

interface NavItem {
  path: string;
  label: string;
  icon: string;
  roles?: UserRole[];
}

const navItems: NavItem[] = [
  { path: "/dashboard", label: "Dashboard", icon: "📊" },
  { path: "/customers", label: "Customers", icon: "👥", roles: ["ADMIN", "SALES", "ACCOUNTS"] as const },
  { path: "/products", label: "Products", icon: "📦", roles: ["ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"] as const },
  { path: "/stock-movements", label: "Inventory", icon: "📥", roles: ["ADMIN", "WAREHOUSE", "SALES", "ACCOUNTS"] as const },
  { path: "/challans", label: "Challans", icon: "🧾", roles: ["ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"] as const },
];

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const canAccessNav = (item: NavItem): boolean => {
    if (!item.roles || item.roles.length === 0) return true;
    if (!user) return false;
    return item.roles.includes(user.role as UserRole);
  };

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="layout-brand">
          <Link to="/dashboard" className="brand-link">
            <span className="brand-mark">FR</span>
            <div className="brand-text">
              <h1>Fundsroom ERP + CRM</h1>
              <p>Wholesale & Distribution Operations Portal</p>
            </div>
          </Link>
        </div>

        <nav className="layout-nav">
          {navItems.map((item) => {
            if (!canAccessNav(item)) return null;
            const isActive = location.pathname === item.path || 
                           (item.path !== "/dashboard" && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActive ? "nav-link-active" : ""}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="layout-user">
          {user && (
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-role">{user.role}</span>
            </div>
          )}
          <button type="button" className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="layout-main">{children}</main>
    </div>
  );
}

export default Layout;