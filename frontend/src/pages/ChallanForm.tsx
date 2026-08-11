import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getApiErrorMessage, getApiFieldErrors } from "../api/client";
import { createChallan, getChallanById, updateChallan } from "../api/challan.api";
import { getCustomers } from "../api/customer.api";
import { getProducts } from "../api/product.api";
import Layout from "../components/Layout";
import type { Customer } from "../types/customer.types";
import type { Product } from "../types/product.types";
import type { ChallanCreateInput } from "../types/challan.types";
import "./Challans.css";

interface PendingItem {
  productId: string;
  quantity: number;
}

function ChallanForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState<PendingItem[]>([]);
  const [pickerProductId, setPickerProductId] = useState("");
  const [pickerQuantity, setPickerQuantity] = useState<number>(1);

  useEffect(() => {
    (async () => {
      setLoadingMeta(true);
      try {
        const [cResult, pResult] = await Promise.all([
          getCustomers({ page: 1, limit: 100 }),
          getProducts({ page: 1, limit: 200 }),
        ]);
        setCustomers(cResult.customers);
        setProducts(pResult.products);
      } finally {
        setLoadingMeta(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!isEdit || !id) return;
    (async () => {
      setInitialLoading(true);
      try {
        const challan = await getChallanById(id);
        if (challan.status !== "DRAFT") {
          setError(
            `Cannot edit a ${challan.status} challan. Only DRAFT challans may be edited.`,
          );
        }
        setCustomerId(challan.customerId);
        setItems(
          (challan.items ?? []).map((it) => ({
            productId: it.productId,
            quantity: it.quantity,
          })),
        );
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setInitialLoading(false);
      }
    })();
  }, [id, isEdit]);

  const productMap = useMemo(() => {
    const m = new Map<string, Product>();
    for (const p of products) m.set(p.id, p);
    return m;
  }, [products]);

  const alreadyInItems = useMemo(() => new Set(items.map((i) => i.productId)), [items]);

  const addableProducts = useMemo(
    () => products.filter((p) => !alreadyInItems.has(p.id)),
    [products, alreadyInItems],
  );

  const handleAddItem = () => {
    if (!pickerProductId) return;
    const qty = Math.max(1, Number.isFinite(pickerQuantity) ? Math.floor(pickerQuantity) : 1);
    setItems((prev) => [...prev, { productId: pickerProductId, quantity: qty }]);
    setPickerProductId("");
    setPickerQuantity(1);
  };

  const handleRemoveItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const handleUpdateQty = (productId: string, raw: string) => {
    const n = Math.max(1, parseInt(raw) || 1);
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity: n } : i)),
    );
  };

  const totalQuantity = items.reduce((s, i) => s + i.quantity, 0);
  const totalAmount = items.reduce((s, i) => {
    const p = productMap.get(i.productId);
    return s + (p ? parseFloat(p.unitPrice) * i.quantity : 0);
  }, 0);

  const formatCurrency = (n: number) =>
    n.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    });

  const stockLine = (productId: string, qty: number) => {
    const p = productMap.get(productId);
    if (!p) return { cls: "", text: "" };
    if (p.currentStock >= qty) {
      return { cls: "stock-ok-inline", text: `In stock: ${p.currentStock}` };
    }
    if (p.currentStock === 0) {
      return { cls: "stock-out-inline", text: "OUT OF STOCK" };
    }
    return {
      cls: "stock-low-inline",
      text: `Short: needs ${qty}, only ${p.currentStock} available`,
    };
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setSuccess("");
    setSubmitting(true);

    try {
      const payload: ChallanCreateInput = {
        customerId,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      };

      if (isEdit && id) {
        await updateChallan(id, payload);
        setSuccess("Challan updated successfully!");
      } else {
        const created = await createChallan(payload);
        setSuccess("Challan created successfully!");
        setTimeout(() => navigate(`/challans/${created.id}`), 1400);
      }

      if (isEdit) {
        setTimeout(() => navigate(`/challans/${id}`), 1400);
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
      setFieldErrors(getApiFieldErrors(err) || {});
    } finally {
      setSubmitting(false);
    }
  };

  if (initialLoading || loadingMeta) {
    return (
      <Layout>
        <div className="page-container">
          <div className="page-content">
          <div className="loading-state">
            {initialLoading ? "Loading challan..." : "Loading customers & products..."}
          </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-container">
        <div className="page-content">
        <div className="page-header">
          <div>
          <h1>{isEdit ? "Edit Challan" : "Create New Challan"}</h1>
          <p className="challan-subtitle">
            {isEdit
              ? "Modify the draft challan. Only DRAFT challans can be edited."
              : "Select a customer and add line items. Save as draft and confirm when ready."}
          </p>
        </div>
      </div>

      {success && <div className="success-banner">{success}</div>}
      {error && <div className="error-banner">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="two-column-layout has-both">
          <div className="stock-form-card">
            <h2>Customer</h2>
            <div className="form-field">
              <label htmlFor="customerId">Customer *</label>
              <select
                id="customerId"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                required
                disabled={submitting || loadingMeta}
              >
                <option value="">
                  {loadingMeta ? "Loading customers..." : "Select a customer"}
                </option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.customerName} — {c.mobileNumber}
                    {c.businessName ? ` (${c.businessName})` : ""}
                  </option>
                ))}
              </select>
              {fieldErrors.customerId?.map((m) => (
                <span key={m} className="field-error">{m}</span>
              ))}
            </div>

            <div
              className="form-field"
              style={{ marginTop: "2rem", paddingTop: "1rem", borderTop: "1px solid #334155" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <label style={{ marginBottom: 0 }}>Summary</label>
              </div>
              <div className="detail-row" style={{ borderBottom: "1px solid #334155" }}>
                <span className="detail-label">Items</span>
                <span className="detail-value">{items.length}</span>
              </div>
              <div className="detail-row" style={{ borderBottom: "1px solid #334155" }}>
                <span className="detail-label">Total Qty</span>
                <span className="detail-value">{totalQuantity}</span>
              </div>
              <div className="detail-row" style={{ borderBottom: "none" }}>
                <span className="detail-label">Subtotal</span>
                <span className="detail-value" style={{ color: "#10b981", fontWeight: 700 }}>
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>
          </div>

          <div className="challan-items-card">
            <h2>Line Items</h2>

            <div className="item-picker-form">
              <div className="form-field">
                <label htmlFor="pickerProductId">Product</label>
                <select
                  id="pickerProductId"
                  value={pickerProductId}
                  onChange={(e) => setPickerProductId(e.target.value)}
                  disabled={submitting || loadingMeta}
                >
                  <option value="">
                    {loadingMeta
                      ? "Loading products..."
                      : addableProducts.length === 0
                      ? "All products already added"
                      : "Select a product"}
                  </option>
                  {addableProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.productName} ({p.sku}) · {p.currentStock} in stock · ₹{p.unitPrice}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="pickerQty">Qty</label>
                <input
                  id="pickerQty"
                  type="number"
                  min={1}
                  step={1}
                  value={pickerQuantity}
                  onChange={(e) => setPickerQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  disabled={submitting}
                />
              </div>
              <button
                type="button"
                className="primary-button"
                onClick={handleAddItem}
                disabled={!pickerProductId || submitting}
                style={{ whiteSpace: "nowrap" }}
              >
                + Add
              </button>
            </div>

            {items.length === 0 ? (
              <div className="empty-state" style={{ padding: "2rem" }}>
                No items yet. Use the picker above to add products.
              </div>
            ) : (
              <>
                {fieldErrors.items?.map((m) => (
                  <div key={m} className="error-banner" style={{ marginBottom: "0.75rem", padding: "0.5rem 0.75rem", fontSize: "0.85rem" }}>
                    {m}
                  </div>
                ))}
                <div className="items-list">
                  {items.map((it) => {
                    const p = productMap.get(it.productId);
                    const avail = stockLine(it.productId, it.quantity);
                    return (
                      <div key={it.productId} className="item-row">
                        <div>
                          <div className="item-name">{p?.productName ?? it.productId}</div>
                          <div className={`item-meta ${avail.cls === "stock-low-inline" ? "stock-warn" : avail.cls === "stock-out-inline" ? "stock-bad" : ""}`}>
                            SKU: {p?.sku ?? "-"} · {p ? formatCurrency(parseFloat(p.unitPrice)) + " each" : ""}
                            {avail.text && <> · {avail.text}</>}
                          </div>
                        </div>
                        <input
                          type="number"
                          min={1}
                          step={1}
                          value={it.quantity}
                          onChange={(e) => handleUpdateQty(it.productId, e.target.value)}
                          disabled={submitting}
                        />
                        <div style={{ textAlign: "right", fontWeight: 600 }}>
                          {p ? formatCurrency(parseFloat(p.unitPrice) * it.quantity) : "-"}
                        </div>
                        <button
                          type="button"
                          className="remove-item-btn"
                          onClick={() => handleRemoveItem(it.productId)}
                          disabled={submitting}
                          aria-label="Remove item"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
                <div className="items-total">
                  <span>Total ({items.length} items, {totalQuantity} units)</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate("/challans")}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="primary-button"
            disabled={submitting || items.length === 0 || !customerId}
          >
            {submitting
              ? "Saving..."
              : isEdit
              ? "Update Challan (Draft)"
              : "Create Challan (Draft)"}
          </button>
        </div>
      </form>
        </div>
      </div>
    </Layout>
  );
}

export default ChallanForm;
