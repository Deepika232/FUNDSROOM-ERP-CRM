import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getApiErrorMessage } from "../api/client";
import {
  cancelChallan,
  confirmChallan,
  getChallanById,
} from "../api/challan.api";
import Layout from "../components/Layout";
import type { Challan, ChallanItem, ChallanStatus } from "../types/challan.types";
import "./Challans.css";

function ChallanDetail() {
  const { id } = useParams<{ id: string }>();

  const [challan, setChallan] = useState<Challan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (id) load(id);
  }, [id]);

  const load = async (challanId: string) => {
    setLoading(true);
    setError("");
    try {
      const data = await getChallanById(challanId);
      setChallan(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!id) return;
    if (!challan) return;
    if (
      !window.confirm(
        `Confirm challan ${challan.challanNumber}?\n\nThis will DEDUCT stock for ALL items and create OUT stock movements. This cannot be undone.`,
      )
    )
      return;

    setConfirming(true);
    setError("");
    setSuccess("");
    try {
      const updated = await confirmChallan(id);
      setChallan(updated);
      setSuccess("Challan confirmed! Stock has been deducted and movements recorded.");
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setConfirming(false);
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    if (!challan) return;
    if (
      !window.confirm(
        `Cancel challan ${challan.challanNumber}?\n\nThis will only mark the DRAFT as cancelled and will NOT affect stock.`,
      )
    )
      return;

    setCancelling(true);
    setError("");
    setSuccess("");
    try {
      const updated = await cancelChallan(id);
      setChallan(updated);
      setSuccess("Challan cancelled (no stock changes).");
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setCancelling(false);
    }
  };

  const statusBadgeClass = (s: ChallanStatus) => {
    switch (s) {
      case "CONFIRMED": return "status-confirmed";
      case "CANCELLED": return "status-cancelled";
      default: return "status-draft";
    }
  };

  const formatCurrency = (n: number) =>
    n.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    });

  const stockAvailability = (item: ChallanItem) => {
    const inStock = item.product?.currentStock ?? null;
    if (inStock === null || inStock === undefined) {
      return { ok: true, cls: "", text: "" };
    }
    if (inStock >= item.quantity) {
      return { ok: true, cls: "stock-ok-inline", text: `Available: ${inStock}` };
    }
    if (inStock === 0) {
      return { ok: false, cls: "stock-out-inline", text: `OUT OF STOCK (needs ${item.quantity})` };
    }
    return {
      ok: false,
      cls: "stock-low-inline",
      text: `Short by ${item.quantity - inStock} (only ${inStock} available)`,
    };
  };

  if (loading) {
    return <Layout><div className="page-container"><div className="page-content"><div className="loading-state">Loading challan...</div></div></div></Layout>;
  }

  if (error || !challan) {
    return (
      <Layout>
        <div className="page-container">
          <div className="page-content">
          <div className="error-banner">{error || "Challan not found"}</div>
          <Link to="/challans" className="primary-button">
            Back to Challans
          </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const items = challan.items ?? [];
  const subtotal = items.reduce(
    (sum, it) => sum + parseFloat(it.unitPriceSnapshot) * it.quantity,
    0,
  );
  const stockWarnings = items.filter((it) => !stockAvailability(it).ok);

  return (
    <Layout>
      <div className="page-container">
        <div className="page-content">
        <div className="page-header">
          <div>
          <h1>{challan.challanNumber}</h1>
          <p className="challan-subtitle">
            {new Date(challan.createdAt).toLocaleString()}
            {" · "}
            <span className={`badge ${statusBadgeClass(challan.status)}`}>
              {challan.status}
            </span>
          </p>
        </div>
        <div className="confirm-actions-row">
          {challan.status === "DRAFT" && (
            <>
              <button
                className="danger-button"
                onClick={handleCancel}
                disabled={cancelling || confirming}
              >
                {cancelling ? "Cancelling..." : "Cancel"}
              </button>
              <Link
                to={`/challans/${challan.id}/edit`}
                className="secondary-button"
              >
                Edit
              </Link>
              <button
                className="primary-button primary-button-success"
                onClick={handleConfirm}
                disabled={confirming || cancelling || stockWarnings.length > 0}
              >
                {confirming ? "Confirming..." : "Confirm Challan"}
              </button>
            </>
          )}
        </div>
      </div>

      {success && <div className="success-banner">{success}</div>}
      {error && <div className="error-banner">{error}</div>}

      {challan.status === "DRAFT" && stockWarnings.length > 0 && (
        <div className="warning-note">
          ⚠️ This challan cannot be confirmed — some products have insufficient stock.
          Reduce quantities or adjust stock first.
        </div>
      )}

      <div className="detail-grid">
        <div className="detail-card">
          <h2>Customer</h2>
          <div className="detail-row">
            <span className="detail-label">Name</span>
            <span className="detail-value">
              {challan.customer?.customerName ?? "-"}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Mobile</span>
            <span className="detail-value">
              {challan.customer?.mobileNumber ?? "-"}
            </span>
          </div>
          {challan.customer?.businessName && (
            <div className="detail-row">
              <span className="detail-label">Business</span>
              <span className="detail-value">{challan.customer.businessName}</span>
            </div>
          )}
        </div>

        <div className="detail-card">
          <h2>Totals</h2>
          <div className="detail-row">
            <span className="detail-label">Items</span>
            <span className="detail-value">{items.length}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Total Quantity</span>
            <span className="detail-value">{challan.totalQuantity}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Subtotal</span>
            <span className="detail-value" style={{ fontWeight: 700, color: "#10b981" }}>
              {formatCurrency(subtotal)}
            </span>
          </div>
        </div>

        <div className="detail-card">
          <h2>Audit</h2>
          <div className="detail-row">
            <span className="detail-label">Created by</span>
            <span className="detail-value">
              {challan.createdBy?.name ?? "-"}
              {challan.createdBy?.email ? (
                <>
                  <br />
                  <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                    {challan.createdBy.email}
                  </span>
                </>
              ) : null}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Created</span>
            <span className="detail-value">
              {new Date(challan.createdAt).toLocaleString()}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Last Updated</span>
            <span className="detail-value">
              {new Date(challan.updatedAt).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="data-table-container">
        <div className="data-table-header">
          <h2>Line Items</h2>
        </div>
        {items.length === 0 ? (
          <div className="empty-state" style={{ padding: "2rem" }}>
            No items in this challan.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th className="table-num">Unit Price</th>
                <th className="table-num">Qty</th>
                <th className="table-num">Amount</th>
                {challan.status === "DRAFT" && <th>Stock Availability</th>}
              </tr>
            </thead>
            <tbody>
              {items.map((it) => {
                const avail = stockAvailability(it);
                return (
                  <tr key={it.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{it.productNameSnapshot}</div>
                      <div className="table-subtext">SKU: {it.skuSnapshot}</div>
                    </td>
                    <td className="table-num">{formatCurrency(parseFloat(it.unitPriceSnapshot))}</td>
                    <td className="table-num">{it.quantity}</td>
                    <td className="table-num">
                      {formatCurrency(parseFloat(it.unitPriceSnapshot) * it.quantity)}
                    </td>
                    {challan.status === "DRAFT" && (
                      <td>
                        <span className={avail.cls}>{avail.text || "-"}</span>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={challan.status === "DRAFT" ? 3 : 3}>
                  <strong>Total</strong>
                </td>
                <td className="table-num">{formatCurrency(subtotal)}</td>
                {challan.status === "DRAFT" && <td></td>}
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      <div className="detail-actions">
        <Link to="/challans" className="secondary-button">
          ← All Challans
        </Link>
        <div className="detail-actions-right">
          <Link to="/products" className="secondary-button">
            Products
          </Link>
          <Link to="/customers" className="secondary-button">
            Customers
          </Link>
        </div>
      </div>
        </div>
      </div>
    </Layout>
  );
}

export default ChallanDetail;
