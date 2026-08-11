import { useCallback, useEffect, useState, type FormEvent } from "react";
import { getApiErrorMessage, getApiFieldErrors } from "../api/client";
import { getProducts } from "../api/product.api";
import { createStockMovement, getStockMovements } from "../api/stockMovement.api";
import Layout from "../components/Layout";
import type { Product } from "../types/product.types";
import type {
  StockMovement as StockMovementType,
  StockMovementCreateInput,
  StockMovementQuery,
} from "../types/stockMovement.types";
import "./StockMovements.css";

function StockMovements() {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovementType[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [query, setQuery] = useState<StockMovementQuery>({
    page: 1,
    limit: 10,
    search: "",
    productId: "",
    movementType: undefined,
    category: "",
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [formData, setFormData] = useState<StockMovementCreateInput>({
    productId: "",
    quantityChanged: 1,
    movementType: "IN",
    reason: "",
  });

  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const result = await getProducts({ page: 1, limit: 100 });
      setProducts(result.products);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  const loadMovements = useCallback(async () => {
    setLoadingList(true);
    setError("");
    try {
      const response = await getStockMovements(query);
      setMovements(response.stockMovements);
      setPagination(response.pagination);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoadingList(false);
    }
  }, [query]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    loadMovements();
  }, [loadMovements]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery({ ...query, page: 1 });
  };

  const handleFilterChange = (key: keyof StockMovementQuery, value: string) => {
    setQuery({ ...query, [key]: value || undefined, page: 1 } as StockMovementQuery);
  };

  const handleReset = () => {
    setQuery({
      page: 1,
      limit: 10,
      search: "",
      productId: "",
      movementType: undefined,
      category: "",
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");
    setFieldErrors({});
    setSuccess("");
    setSubmitting(true);

    try {
      const result = await createStockMovement(formData);
      const action = result.movementType === "IN" ? "Stock added" : "Stock removed";
      setSuccess(`${action} successfully! ${result.quantityChanged} units recorded.`);
      setFormData({
        productId: "",
        quantityChanged: 1,
        movementType: "IN",
        reason: "",
      });
      await loadMovements();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setFormError(getApiErrorMessage(err));
      setFieldErrors(getApiFieldErrors(err) || {});
    } finally {
      setSubmitting(false);
    }
  };

  const selectedProduct = products.find((p) => p.id === formData.productId);

  return (
    <Layout>
      <div className="page-container">
        <div className="page-content">
          <div className="page-header">
            <h1>Inventory &amp; Stock Movements</h1>
          </div>

          {success && <div className="success-banner">{success}</div>}

          <div className="filters-bar">
            <form className="search-form" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search by product name or SKU..."
                value={query.search || ""}
                onChange={(e) => setQuery({ ...query, search: e.target.value })}
              />
              <button type="submit" className="secondary-button">
                Search
              </button>
            </form>

            <div className="filter-selects">
              <select
                value={query.movementType || ""}
                onChange={(e) => handleFilterChange("movementType", e.target.value)}
              >
                <option value="">All Types</option>
                <option value="IN">Stock In</option>
                <option value="OUT">Stock Out</option>
              </select>

              <input
                type="text"
                placeholder="Filter by category..."
                value={query.category || ""}
                onChange={(e) => handleFilterChange("category", e.target.value)}
              />

              <select
                value={query.productId || ""}
                onChange={(e) => handleFilterChange("productId", e.target.value)}
              >
                <option value="">All Products</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.productName} ({p.sku})
                  </option>
                ))}
              </select>

              {(query.search || query.productId || query.movementType || query.category) && (
                <button type="button" className="secondary-button" onClick={handleReset}>
                  Clear
                </button>
              )}
            </div>
          </div>

          {error && <div className="error-banner">{error}</div>}

          <div className="two-column-layout">
            <div className="stock-form-card">
          <h2>Record Stock Movement</h2>

          {formError && <div className="error-banner">{formError}</div>}

          <form onSubmit={handleSubmit}>
            <div className="movement-type-toggle">
              <button
                type="button"
                className={`toggle-button ${formData.movementType === "IN" ? "active-in" : ""}`}
                onClick={() => setFormData({ ...formData, movementType: "IN" })}
                disabled={submitting}
              >
                ↓ Stock In
              </button>
              <button
                type="button"
                className={`toggle-button ${formData.movementType === "OUT" ? "active-out" : ""}`}
                onClick={() => setFormData({ ...formData, movementType: "OUT" })}
                disabled={submitting}
              >
                ↑ Stock Out
              </button>
            </div>

            <div className="form-field">
              <label htmlFor="productId">Product *</label>
              <select
                id="productId"
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                required
                disabled={submitting || loadingProducts}
              >
                <option value="">{loadingProducts ? "Loading products..." : "Select a product"}</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.productName} ({p.sku}) — Stock: {p.currentStock}
                  </option>
                ))}
              </select>
              {fieldErrors.productId?.map((msg) => (
                <span key={msg} className="field-error">{msg}</span>
              ))}
              {selectedProduct && (
                <div className="table-subtext">
                  Current stock: {selectedProduct.currentStock} units • Min alert: {selectedProduct.minimumStockAlertQuantity}
                </div>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="quantityChanged">Quantity *</label>
              <input
                id="quantityChanged"
                type="number"
                step="1"
                min="1"
                value={formData.quantityChanged}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantityChanged: Math.max(1, parseInt(e.target.value) || 1),
                  })
                }
                required
                disabled={submitting}
              />
              {fieldErrors.quantityChanged?.map((msg) => (
                <span key={msg} className="field-error">{msg}</span>
              ))}
            </div>

            <div className="form-field">
              <label htmlFor="reason">Reason *</label>
              <textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder={
                  formData.movementType === "IN"
                    ? "e.g., Purchase from vendor X, received 50 units"
                    : "e.g., Sale to customer Y, dispatched 10 units"
                }
                rows={3}
                required
                disabled={submitting}
              />
              {fieldErrors.reason?.map((msg) => (
                <span key={msg} className="field-error">{msg}</span>
              ))}
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setFormData({
                    productId: "",
                    quantityChanged: 1,
                    movementType: "IN",
                    reason: "",
                  });
                  setFormError("");
                  setFieldErrors({});
                }}
                disabled={submitting}
              >
                Reset
              </button>
              <button
                type="submit"
                className="primary-button"
                disabled={submitting}
              >
                {submitting ? "Recording..." : `Record ${formData.movementType}`}
              </button>
            </div>
          </form>
          </div>

          <div className="data-table-container">
          <div className="data-table-header">
            <h2>Movement History</h2>
          </div>

          {loadingList ? (
            <div className="loading-state">Loading movements...</div>
          ) : movements.length === 0 ? (
            <div className="empty-state">
              <p>No stock movements found</p>
              <p style={{ fontSize: "0.875rem" }}>
                Record your first stock movement using the form on the left.
              </p>
            </div>
          ) : (
            <>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Product</th>
                    <th>Type</th>
                    <th>Qty</th>
                    <th>By</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <div>{new Date(m.createdAt).toLocaleDateString()}</div>
                        <div className="table-subtext">
                          {new Date(m.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>
                          {m.product?.productName ?? "-"}
                        </div>
                        <div className="table-subtext">
                          {m.product?.sku ?? ""} • {m.reason}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${m.movementType === "IN" ? "movement-in" : "movement-out"}`}>
                          {m.movementType}
                        </span>
                      </td>
                      <td
                        className={m.movementType === "IN" ? "quantity-in" : "quantity-out"}
                      >
                        {m.movementType === "IN" ? "+" : "-"}
                        {m.quantityChanged}
                      </td>
                      <td>
                        <div className="user-cell">
                          {m.createdBy?.name ?? "-"}
                        </div>
                        {m.createdBy?.email && (
                          <div className="user-email">{m.createdBy.email}</div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {pagination.totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setQuery({ ...query, page: query.page! - 1 })}
                    disabled={query.page === 1}
                    className="pagination-button"
                  >
                    Previous
                  </button>
                  <span className="pagination-info">
                    Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                  </span>
                  <button
                    onClick={() => setQuery({ ...query, page: query.page! + 1 })}
                    disabled={query.page === pagination.totalPages}
                    className="pagination-button"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        </div>
        </div>
      </div>
    </Layout>
  );
}

export default StockMovements;
