import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getApiErrorMessage, getApiFieldErrors } from "../api/client";
import { getCustomerById, createCustomer, updateCustomer } from "../api/customer.api";
import Layout from "../components/Layout";
import type { CustomerCreateInput } from "../types/customer.types";
import "./CustomerForm.css";

function CustomerForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<CustomerCreateInput>({
    customerName: "",
    mobileNumber: "",
    email: "",
    businessName: "",
    gstNumber: "",
    customerType: "RETAIL",
    address: "",
    status: "LEAD",
    followUpDate: "",
    notes: "",
  });

  useEffect(() => {
    if (isEdit && id) {
      loadCustomer(id);
    }
  }, [id, isEdit]);

  const loadCustomer = async (customerId: string) => {
    setInitialLoading(true);
    try {
      const customer = await getCustomerById(customerId);
      setFormData({
        customerName: customer.customerName,
        mobileNumber: customer.mobileNumber,
        email: customer.email || "",
        businessName: customer.businessName || "",
        gstNumber: customer.gstNumber || "",
        customerType: customer.customerType,
        address: customer.address || "",
        status: customer.status,
        followUpDate: customer.followUpDate ? customer.followUpDate.split("T")[0] : "",
        notes: customer.notes || "",
      });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setSuccess(false);
    setLoading(true);

    try {
      if (isEdit && id) {
        await updateCustomer(id, formData);
      } else {
        await createCustomer(formData);
      }
      setSuccess(true);
      setTimeout(() => {
        navigate("/customers");
      }, 1500);
    } catch (err) {
      setError(getApiErrorMessage(err));
      setFieldErrors(getApiFieldErrors(err) || {});
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CustomerCreateInput, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  if (initialLoading) {
    return <div className="page-container loading-state">Loading customer...</div>;
  }

  return (
    <Layout>
      <div className="page-container">
        <div className="page-content">
        <div className="page-header">
          <h1>{isEdit ? "Edit Customer" : "Add New Customer"}</h1>
      </div>

      {success && (
        <div className="success-banner">
          {isEdit ? "Customer updated successfully!" : "Customer created successfully!"}
        </div>
      )}

      {error && <div className="error-banner">{error}</div>}

      <form className="customer-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h2>Basic Information</h2>
          
          <div className="form-field">
            <label htmlFor="customerName">Customer Name *</label>
            <input
              id="customerName"
              type="text"
              value={formData.customerName}
              onChange={(e) => handleChange("customerName", e.target.value)}
              required
            />
            {fieldErrors.customerName?.map((msg) => (
              <span key={msg} className="field-error">{msg}</span>
            ))}
          </div>

          <div className="form-field">
            <label htmlFor="mobileNumber">Mobile Number *</label>
            <input
              id="mobileNumber"
              type="tel"
              value={formData.mobileNumber}
              onChange={(e) => handleChange("mobileNumber", e.target.value)}
              required
            />
            {fieldErrors.mobileNumber?.map((msg) => (
              <span key={msg} className="field-error">{msg}</span>
            ))}
          </div>

          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
            {fieldErrors.email?.map((msg) => (
              <span key={msg} className="field-error">{msg}</span>
            ))}
          </div>

          <div className="form-field">
            <label htmlFor="businessName">Business Name</label>
            <input
              id="businessName"
              type="text"
              value={formData.businessName}
              onChange={(e) => handleChange("businessName", e.target.value)}
            />
            {fieldErrors.businessName?.map((msg) => (
              <span key={msg} className="field-error">{msg}</span>
            ))}
          </div>

          <div className="form-field">
            <label htmlFor="gstNumber">GST Number</label>
            <input
              id="gstNumber"
              type="text"
              value={formData.gstNumber}
              onChange={(e) => handleChange("gstNumber", e.target.value)}
              placeholder="15-character GST number"
            />
            {fieldErrors.gstNumber?.map((msg) => (
              <span key={msg} className="field-error">{msg}</span>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h2>Classification</h2>

          <div className="form-field">
            <label htmlFor="customerType">Customer Type *</label>
            <select
              id="customerType"
              value={formData.customerType}
              onChange={(e) => handleChange("customerType", e.target.value)}
              required
            >
              <option value="RETAIL">Retail</option>
              <option value="WHOLESALE">Wholesale</option>
              <option value="DISTRIBUTOR">Distributor</option>
            </select>
            {fieldErrors.customerType?.map((msg) => (
              <span key={msg} className="field-error">{msg}</span>
            ))}
          </div>

          <div className="form-field">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => handleChange("status", e.target.value)}
            >
              <option value="LEAD">Lead</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            {fieldErrors.status?.map((msg) => (
              <span key={msg} className="field-error">{msg}</span>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h2>Additional Details</h2>

          <div className="form-field">
            <label htmlFor="address">Address</label>
            <textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              rows={3}
            />
            {fieldErrors.address?.map((msg) => (
              <span key={msg} className="field-error">{msg}</span>
            ))}
          </div>

          <div className="form-field">
            <label htmlFor="followUpDate">Follow-up Date</label>
            <input
              id="followUpDate"
              type="date"
              value={formData.followUpDate}
              onChange={(e) => handleChange("followUpDate", e.target.value)}
            />
            {fieldErrors.followUpDate?.map((msg) => (
              <span key={msg} className="field-error">{msg}</span>
            ))}
          </div>

          <div className="form-field">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              rows={4}
              placeholder="Additional notes about this customer..."
            />
            {fieldErrors.notes?.map((msg) => (
              <span key={msg} className="field-error">{msg}</span>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate("/customers")}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading ? "Saving..." : isEdit ? "Update Customer" : "Create Customer"}
          </button>
        </div>
      </form>
        </div>
      </div>
    </Layout>
  );
}

export default CustomerForm;
