import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getApiErrorMessage } from "../api/client";
import { getCustomers, deleteCustomer } from "../api/customer.api";
import Layout from "../components/Layout";
import type { Customer, CustomerQuery, CustomerType, CustomerStatus } from "../types/customer.types";
import "./Customers.css";

function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState<CustomerQuery>({
    page: 1,
    limit: 10,
    search: "",
    customerType: undefined,
    status: undefined,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getCustomers(query);
      setCustomers(response.customers);
      setPagination(response.pagination);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery({ ...query, page: 1 });
    loadCustomers();
  };

  const handleFilterChange = (key: keyof CustomerQuery, value: string) => {
    setQuery({ ...query, [key]: value || undefined, page: 1 });
    loadCustomers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;
    
    setDeletingId(id);
    try {
      await deleteCustomer(id);
      await loadCustomers();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusColor = (status: CustomerStatus) => {
    switch (status) {
      case "ACTIVE": return "status-active";
      case "INACTIVE": return "status-inactive";
      case "LEAD": return "status-lead";
      default: return "";
    }
  };

  const getTypeColor = (type: CustomerType) => {
    switch (type) {
      case "RETAIL": return "type-retail";
      case "WHOLESALE": return "type-wholesale";
      case "DISTRIBUTOR": return "type-distributor";
      default: return "";
    }
  };

  return (
    <Layout>
      <div className="page-container">
        <div className="page-content">
        <div className="page-header">
          <h1>Customers</h1>
          <Link to="/customers/new" className="primary-button">
            Add Customer
          </Link>
        </div>

      <div className="filters-bar">
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search by name, mobile, email..."
            value={query.search || ""}
            onChange={(e) => setQuery({ ...query, search: e.target.value })}
          />
          <button type="submit" className="secondary-button">
            Search
          </button>
        </form>

        <div className="filter-selects">
          <select
            value={query.customerType || ""}
            onChange={(e) => handleFilterChange("customerType", e.target.value)}
          >
            <option value="">All Types</option>
            <option value="RETAIL">Retail</option>
            <option value="WHOLESALE">Wholesale</option>
            <option value="DISTRIBUTOR">Distributor</option>
          </select>

          <select
            value={query.status || ""}
            onChange={(e) => handleFilterChange("status", e.target.value)}
          >
            <option value="">All Status</option>
            <option value="LEAD">Lead</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading-state">Loading customers...</div>
      ) : customers.length === 0 ? (
        <div className="empty-state">
          <p>No customers found</p>
          <Link to="/customers/new" className="primary-button">
            Add your first customer
          </Link>
        </div>
      ) : (
        <>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Mobile</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <Link to={`/customers/${customer.id}`} className="table-link">
                        {customer.customerName}
                      </Link>
                      {customer.businessName && (
                        <div className="table-subtext">{customer.businessName}</div>
                      )}
                    </td>
                    <td>{customer.mobileNumber}</td>
                    <td>
                      <span className={`badge ${getTypeColor(customer.customerType)}`}>
                        {customer.customerType}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusColor(customer.status)}`}>
                        {customer.status}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <Link
                          to={`/customers/${customer.id}`}
                          className="action-button"
                        >
                          View
                        </Link>
                        <Link
                          to={`/customers/${customer.id}/edit`}
                          className="action-button"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(customer.id)}
                          disabled={deletingId === customer.id}
                          className="action-button action-button-danger"
                        >
                          {deletingId === customer.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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

export default Customers;
