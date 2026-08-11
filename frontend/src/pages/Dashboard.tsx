import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardSummary } from "../api/dashboard.api";
import { getApiErrorMessage } from "../api/client";
import Layout from "../components/Layout";
import type {
  DashboardSummary,
  LowStockProduct,
  RecentChallan,
  RecentStockMovement,
} from "../types/dashboard.types";
import "./Dashboard.css";

function formatCurrency(n: number) {
  return n.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  });
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString(),
    time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
}

function statusBadgeClass(s: RecentChallan["status"]) {
  switch (s) {
    case "CONFIRMED":
      return "dash-status dash-status-confirmed";
    case "CANCELLED":
      return "dash-status dash-status-cancelled";
    default:
      return "dash-status dash-status-draft";
  }
}

function movementBadgeClass(t: RecentStockMovement["movementType"]) {
  return t === "IN"
    ? "dash-movement dash-movement-in"
    : "dash-movement dash-movement-out";
}

interface KpiDef {
  label: string;
  value: number | string;
  icon: string;
  accent: "blue" | "green" | "amber" | "violet" | "rose" | "cyan" | "slate";
  sub?: string;
  link?: string;
}

function Dashboard() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError("");
    try {
      const summary = await getDashboardSummary();
      setData(summary);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <Layout><div className="dash-loading">Loading dashboard…</div></Layout>;
  }

  if (error || !data) {
    return (
      <Layout>
        <div className="dash-error-card">
          <h3>Could not load dashboard</h3>
          <p>{error || "Unknown error"}</p>
          <button className="primary-button" onClick={() => void load()}>Retry</button>
        </div>
      </Layout>
    );
  }

  const kpis: KpiDef[] = [
    {
      label: "Total Customers",
      value: data.totalCustomers,
      sub: `${data.activeCustomers} active`,
      icon: "👥",
      accent: "blue",
      link: "/customers",
    },
    {
      label: "Total Products",
      value: data.totalProducts,
      sub: `${data.totalStockQuantity.toLocaleString("en-IN")} units in stock`,
      icon: "📦",
      accent: "violet",
      link: "/products",
    },
    {
      label: "Low Stock Alerts",
      value: data.lowStockProductCount,
      sub: data.lowStockProductCount > 0 ? "Action required" : "All good",
      icon: "⚠️",
      accent: data.lowStockProductCount > 0 ? "amber" : "slate",
      link: "/products",
    },
    {
      label: "Draft Challans",
      value: data.draftChallans,
      sub: "Awaiting confirmation",
      icon: "📝",
      accent: "cyan",
      link: "/challans?status=DRAFT",
    },
    {
      label: "Confirmed Challans",
      value: data.confirmedChallans,
      sub: "Stock deducted",
      icon: "✅",
      accent: "green",
      link: "/challans?status=CONFIRMED",
    },
    {
      label: "Cancelled Challans",
      value: data.cancelledChallans,
      sub: "No stock impact",
      icon: "⛔",
      accent: "rose",
      link: "/challans?status=CANCELLED",
    },
  ];

  return (
    <Layout>
      <div className="dash-toolbar">
        <div className="dash-toolbar-left">
          <h2 className="dash-page-title">Overview</h2>
          <span className="dash-subtitle">
            Updated {formatDateTime(data.generatedAt).date} at {formatDateTime(data.generatedAt).time}
          </span>
        </div>
        <div className="dash-toolbar-right">
          <button
            className="secondary-button"
            onClick={() => void load(true)}
            disabled={refreshing}
          >
            {refreshing ? "Refreshing…" : "↻ Refresh"}
          </button>
        </div>
      </div>

      <div className="kpi-grid">
        {kpis.map((k) => (
          <KpiCard key={k.label} kpi={k} />
        ))}
      </div>

      <div className="quick-actions-grid">
        <Link to="/customers/new" className="qa-card qa-blue">
          <span className="qa-icon">➕</span>
          <span className="qa-title">New Customer</span>
          <span className="qa-sub">Create a lead or account</span>
        </Link>
        <Link to="/products/new" className="qa-card qa-violet">
          <span className="qa-icon">📦</span>
          <span className="qa-title">New Product</span>
          <span className="qa-sub">Add SKU with stock info</span>
        </Link>
        <Link to="/challans/new" className="qa-card qa-green">
          <span className="qa-icon">🧾</span>
          <span className="qa-title">New Challan</span>
          <span className="qa-sub">Create a sales challan draft</span>
        </Link>
        <Link to="/stock-movements" className="qa-card qa-amber">
          <span className="qa-icon">📥</span>
          <span className="qa-title">Stock IN/OUT</span>
          <span className="qa-sub">Record inventory movement</span>
        </Link>
      </div>

      <div className="dash-sections">
        <section className="dash-section">
          <header className="dash-section-header">
            <h3>⚠️ Low Stock Products</h3>
            <Link to="/products" className="dash-section-link">All products →</Link>
          </header>
          <LowStockList items={data.lowStockProducts} />
        </section>

        <section className="dash-section">
          <header className="dash-section-header">
            <h3>🧾 Recent Challans</h3>
            <Link to="/challans" className="dash-section-link">All challans →</Link>
          </header>
          <RecentChallansList items={data.recentChallans} />
        </section>

        <section className="dash-section dash-section-wide">
          <header className="dash-section-header">
            <h3>📊 Recent Stock Movements</h3>
            <Link to="/stock-movements" className="dash-section-link">All movements →</Link>
          </header>
          <RecentMovementsList items={data.recentStockMovements} />
        </section>
      </div>
    </Layout>
  );
}

function KpiCard({ kpi }: { kpi: KpiDef }) {
  const content = (
    <div className={`kpi-card kpi-accent-${kpi.accent}`}>
      <div className="kpi-top">
        <span className="kpi-icon" aria-hidden>{kpi.icon}</span>
        <span className="kpi-label">{kpi.label}</span>
      </div>
      <div className="kpi-value">{kpi.value.toLocaleString("en-IN")}</div>
      {kpi.sub && <div className="kpi-sub">{kpi.sub}</div>}
    </div>
  );
  if (kpi.link) {
    return (
      <Link to={kpi.link} className="kpi-card-link">
        {content}
      </Link>
    );
  }
  return content;
}

function LowStockList({ items }: { items: LowStockProduct[] }) {
  if (items.length === 0) {
    return (
      <div className="dash-empty">
        <span className="dash-empty-icon">✅</span>
        <h4>No low-stock products</h4>
        <p>All products are above their minimum stock alert levels.</p>
      </div>
    );
  }
  return (
    <div className="dash-list dash-list-tight">
      {items.map((p) => {
        const shortBy = Math.max(0, p.minimumStockAlertQuantity - p.currentStock);
        return (
          <Link
            key={p.id}
            to={`/products/${p.id}`}
            className="dash-list-row dash-list-row-hover"
          >
            <div className="dash-list-main">
              <div className="dash-list-title">{p.productName}</div>
              <div className="dash-list-meta">
                SKU: <code>{p.sku}</code> · {p.category} · {formatCurrency(p.unitPrice)} each
              </div>
            </div>
            <div className="dash-list-right">
              <div className={`stock-pill ${p.currentStock === 0 ? "stock-pill-zero" : "stock-pill-low"}`}>
                {p.currentStock === 0
                  ? "OUT OF STOCK"
                  : shortBy > 0
                  ? `Short by ${shortBy}`
                  : `At threshold`}
              </div>
              <div className="dash-list-sub">
                {p.currentStock} / min {p.minimumStockAlertQuantity}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function RecentChallansList({ items }: { items: RecentChallan[] }) {
  if (items.length === 0) {
    return (
      <div className="dash-empty">
        <span className="dash-empty-icon">🧾</span>
        <h4>No challans yet</h4>
        <p>Create your first sales challan to get started.</p>
        <Link to="/challans/new" className="primary-button" style={{ marginTop: "0.75rem" }}>
          Create Challan
        </Link>
      </div>
    );
  }
  return (
    <div className="dash-list">
      {items.map((c) => {
        const t = formatDateTime(c.createdAt);
        return (
          <Link
            key={c.id}
            to={`/challans/${c.id}`}
            className="dash-list-row dash-list-row-hover"
          >
            <div className="dash-list-main">
              <div className="dash-list-title">
                <span className="challan-num">{c.challanNumber}</span>
                <span className={statusBadgeClass(c.status)}>{c.status}</span>
              </div>
              <div className="dash-list-meta">
                {c.customer
                  ? `${c.customer.customerName} · ${c.customer.mobileNumber}`
                  : "Unknown customer"}
              </div>
            </div>
            <div className="dash-list-right">
              <div className="dash-list-qty">{c.totalQuantity} units</div>
              <div className="dash-list-sub">{t.date} · {t.time}</div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function RecentMovementsList({ items }: { items: RecentStockMovement[] }) {
  if (items.length === 0) {
    return (
      <div className="dash-empty">
        <span className="dash-empty-icon">📊</span>
        <h4>No stock movements</h4>
        <p>Stock IN/OUT activity will appear here as it happens.</p>
      </div>
    );
  }
  return (
    <div className="dash-table-wrap">
      <table className="dash-table">
        <thead>
          <tr>
            <th>Product</th>
            <th className="dash-th-right">Qty</th>
            <th>Type</th>
            <th>Reason</th>
            <th className="dash-th-right">Date</th>
          </tr>
        </thead>
        <tbody>
          {items.map((m) => {
            const t = formatDateTime(m.createdAt);
            return (
              <tr key={m.id}>
                <td>
                  <div className="dash-table-title">
                    {m.product ? (
                      <Link to={`/products/${m.product.id}`} className="dash-link">
                        {m.product.productName}
                      </Link>
                    ) : (
                      <em>Deleted product</em>
                    )}
                  </div>
                  {m.product && (
                    <div className="dash-table-meta">
                      SKU: <code>{m.product.sku}</code>
                    </div>
                  )}
                </td>
                <td className={`dash-td-right dash-num dash-num-${m.movementType.toLowerCase()}`}>
                  {m.movementType === "IN" ? "+" : "−"}
                  {m.quantityChanged.toLocaleString("en-IN")}
                </td>
                <td>
                  <span className={movementBadgeClass(m.movementType)}>
                    {m.movementType}
                  </span>
                </td>
                <td className="dash-reason-cell">{m.reason}</td>
                <td className="dash-td-right">
                  <div>{t.date}</div>
                  <div className="dash-table-meta">{t.time}</div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;
