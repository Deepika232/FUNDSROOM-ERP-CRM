import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getApiErrorMessage } from "../api/client";
import { getCustomerById, deleteCustomer } from "../api/customer.api";
import Layout from "../components/Layout";
import type { Customer, CustomerType, CustomerStatus } from "../types/customer.types";
import "./CustomerDetail.css";

function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      loadCustomer(id);
    }
  }, [id]);

  const loadCustomer = async (customerId: string) => {
    setLoading(true);
    try {
      const data = await getCustomerById(customerId);
      setCustomer(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this customer? This action cannot be undone.")) return;
    
    setDeleting(true);
    try {
      if (id) {
        await deleteCustomer(id);
        navigate("/customers");
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
      setDeleting(false);
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

  if (loading) {
    return <div className="page-container loading-state">Loading customer details...</div>;
  }

  if (error || !customer) {
    return (
      <Layout>
        <div className="page-container">
          <div className="page-content">
          <div className="error-banner">{error || "Customer not found"}</div>
          <Link to="/customers" className="primary-button">
            Back to Customers
          </Link>
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
          <h1>{customer.customerName}</h1>
          {customer.businessName && <p className="business-name">{customer.businessName}</p>}
        </div>
        <div className="header-actions">
          <Link to={`/customers/${customer.id}/edit`} className="primary-button">
            Edit Customer
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="danger-button"
          >
            {deleting ? "Deleting..." : "Delete Customer"}
          </button>
        </div>
      </div>

      <div className="customer-detail-grid">
        <div className="detail-card">
          <h2>Contact Information</h2>
          <div className="detail-row">
            <span className="detail-label">Mobile:</span>
            <span className="detail-value">{customer.mobileNumber}</span>
          </div>
          {customer.email && (
            <div className="detail-row">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{customer.email}</span>
            </div>
          )}
          {customer.address && (
            <div className="detail-row">
              <span className="detail-label">Address:</span>
              <span className="detail-value">{customer.address}</span>
            </div>
          )}
        </div>

        <div className="detail-card">
          <h2>Classification</h2>
          <div className="detail-row">
            <span className="detail-label">Type:</span>
            <span className={`badge ${getTypeColor(customer.customerType)}`}>
              {customer.customerType}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Status:</span>
            <span className={`badge ${getStatusColor(customer.status)}`}>
              {customer.status}
            </span>
          </div>
          {customer.gstNumber && (
            <div className="detail-row">
              <span className="detail-label">GST Number:</span>
              <span className="detail-value">{customer.gstNumber}</span>
            </div>
          )}
        </div>

        <div className="detail-card">
          <h2>Additional Information</h2>
          {customer.followUpDate && (
            <div className="detail-row">
              <span className="detail-label">Follow-up Date:</span>
              <span className="detail-value">
                {new Date(customer.followUpDate).toLocaleDateString()}
              </span>
            </div>
          )}
          {customer.notes && (
            <div className="detail-row">
              <span className="detail-label">Notes:</span>
              <span className="detail-value">{customer.notes}</span>
            </div>
          )}
          <div className="detail-row">
            <span className="detail-label">Created:</span>
            <span className="detail-value">
              {new Date(customer.createdAt).toLocaleString()}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Last Updated:</span>
            <span className="detail-value">
              {new Date(customer.updatedAt).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="detail-actions">
        <Link to="/customers" className="secondary-button">
          Back to Customers
        </Link>
      </div>
        </div>
      </div>
    </Layout>
  );
}

export default CustomerDetail;
