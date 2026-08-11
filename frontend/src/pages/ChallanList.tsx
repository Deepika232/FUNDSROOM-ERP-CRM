import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getApiErrorMessage } from "../api/client";
import { getChallans } from "../api/challan.api";
import { getCustomers } from "../api/customer.api";
import Layout from "../components/Layout";
import type { Challan, ChallanQuery, ChallanStatus } from "../types/challan.types";
import type { Customer } from "../types/customer.types";
import "./Challans.css";

function ChallanList() {
  const [challans, setChallans] = useState<Challan[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState<ChallanQuery>({
    page: 1,
    limit: 10,
    search: "",
    customerId: "",
    status: undefined,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const loadChallans = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getChallans(query);
      setChallans(response.challans);
      setPagination(response.pagination);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [query]);

  const loadCustomers = useCallback(async () => {
    try {
      const result = await getCustomers({ page: 1, limit: 100 });
      setCustomers(result.customers);
    } finally {
      setLoadingCustomers(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  useEffect(() => {
    loadChallans();
  }, [loadChallans]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery({ ...query, page: 1 });
  };

  const handleFilterChange = (key: keyof ChallanQuery, value: string) => {
    setQuery({ ...query, [key]: value || undefined, page: 1 } as ChallanQuery);
  };

  const handleReset = () => {
    setQuery({
      page: 1,
      limit: 10,
      search: "",
      customerId: "",
      status: undefined,
    });
  };

  const statusBadgeClass = (s: ChallanStatus) => {
    switch (s) {
      case "CONFIRMED": return "status-confirmed";
      case "CANCELLED": return "status-cancelled";
      default: return "status-draft";
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    });
  };

  return (
    <Layout>
      <div className="page-container">
        <div className="page-content">
        <div className="page-header">
          <div>
          <h1>Sales Challans</h1>
          <p className="challan-subtitle">Create, review, confirm and cancel sales challans.</p>
        </div>
        <Link to="/challans/new" className="primary-button">
          New Challan
        </Link>
      </div>

      <div className="filters-bar">
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search by challan #, customer name, mobile..."
            value={query.search || ""}
            onChange={(e) => setQuery({ ...query, search: e.target.value })}
          />
          <button type="submit" className="secondary-button">Search</button>
        </form>
        <div className="filter-selects">
          <select
            value={query.status || ""}
            onChange={(e) => handleFilterChange("status", e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <select
            value={query.customerId || ""}
            onChange={(e) => handleFilterChange("customerId", e.target.value)}
            disabled={loadingCustomers}
          >
            <option value="">All Customers</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.customerName} — {c.mobileNumber}
              </option>
            ))}
          </select>
          {(query.search || query.customerId || query.status) && (
            <button type="button" className="secondary-button" onClick={handleReset}>
              Clear
            </button>
          )}
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading-state">Loading challans...</div>
      ) : challans.length === 0 ? (
        <div className="empty-state">
          <p>No challans found</p>
          <p style={{ fontSize: "0.9rem" }}>
            Create your first challan to begin recording sales.
          </p>
          <div style={{ marginTop: "1rem" }}>
            <Link to="/challans/new" className="primary-button">
              Create First Challan
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Challan #</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th className="table-num">Qty</th>
                  <th>Created</th>
                  <th>By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {challans.map((ch) => {
                  const totalValue = (ch.items || []).reduce(
                    (sum, it) => sum + parseFloat(it.unitPriceSnapshot) * it.quantity,
                    0,
                  );
                  return (
                    <tr key={ch.id}>
                      <td>
                        <Link to={`/challans/${ch.id}`} className="table-link">
                          {ch.challanNumber}
                        </Link>
                        {totalValue > 0 && (
                          <div className="table-subtext">
                            Total {formatCurrency(totalValue)}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>
                          {ch.customer?.customerName ?? "-"}
                        </div>
                        <div className="table-subtext">
                          {ch.customer?.mobileNumber}{" "}
                          {ch.customer?.businessName ? `· ${ch.customer.businessName}` : ""}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${statusBadgeClass(ch.status)}`}>
                          {ch.status}
                        </span>
                      </td>
                      <td className="table-num">{ch.totalQuantity}</td>
                      <td>
                        <div>{new Date(ch.createdAt).toLocaleDateString()}</div>
                        <div className="table-subtext">
                          {new Date(ch.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td>
                        <div>{ch.createdBy?.name ?? "-"}</div>
                        {ch.createdBy?.email && (
                          <div className="table-subtext">{ch.createdBy.email}</div>
                        )}
                      </td>
                      <td>
                        <div className="table-actions">
                          <Link
                            to={`/challans/${ch.id}`}
                            className="action-button"
                          >
                            View
                          </Link>
                          {ch.status === "DRAFT" && (
                            <>
                              <Link
                                to={`/challans/${ch.id}/edit`}
                                className="action-button"
                              >
                                Edit
                              </Link>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

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
    </Layout>
  );
}

export default ChallanList;
