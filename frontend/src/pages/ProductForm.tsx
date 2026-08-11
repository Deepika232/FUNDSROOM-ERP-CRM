import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getApiErrorMessage, getApiFieldErrors } from "../api/client";
import { getProductById, createProduct, updateProduct } from "../api/product.api";
import Layout from "../components/Layout";
import type { ProductCreateInput } from "../types/product.types";
import "./ProductForm.css";

function ProductForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<ProductCreateInput>({
    productName: "",
    sku: "",
    category: "",
    unitPrice: 0,
    currentStock: 0,
    minimumStockAlertQuantity: 0,
    warehouseLocation: "",
  });

  useEffect(() => {
    if (isEdit && id) {
      loadProduct(id);
    }
  }, [id, isEdit]);

  const loadProduct = async (productId: string) => {
    setInitialLoading(true);
    try {
      const product = await getProductById(productId);
      setFormData({
        productName: product.productName,
        sku: product.sku,
        category: product.category,
        unitPrice: parseFloat(product.unitPrice),
        currentStock: product.currentStock,
        minimumStockAlertQuantity: product.minimumStockAlertQuantity,
        warehouseLocation: product.warehouseLocation || "",
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
        await updateProduct(id, formData);
      } else {
        await createProduct(formData);
      }
      setSuccess(true);
      setTimeout(() => {
        navigate("/products");
      }, 1500);
    } catch (err) {
      setError(getApiErrorMessage(err));
      setFieldErrors(getApiFieldErrors(err) || {});
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof ProductCreateInput, value: string | number) => {
    setFormData({ ...formData, [field]: value });
  };

  if (initialLoading) {
    return <div className="page-container loading-state">Loading product...</div>;
  }

  return (
    <Layout>
      <div className="page-container">
        <div className="page-content">
        <div className="page-header">
          <h1>{isEdit ? "Edit Product" : "Add New Product"}</h1>
      </div>

      {success && (
        <div className="success-banner">
          {isEdit ? "Product updated successfully!" : "Product created successfully!"}
        </div>
      )}

      {error && <div className="error-banner">{error}</div>}

      <form className="product-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h2>Product Information</h2>

          <div className="form-field">
            <label htmlFor="productName">Product Name *</label>
            <input
              id="productName"
              type="text"
              value={formData.productName}
              onChange={(e) => handleChange("productName", e.target.value)}
              required
            />
            {fieldErrors.productName?.map((msg) => (
              <span key={msg} className="field-error">{msg}</span>
            ))}
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="sku">SKU *</label>
              <input
                id="sku"
                type="text"
                value={formData.sku}
                onChange={(e) => handleChange("sku", e.target.value)}
                required
              />
              {fieldErrors.sku?.map((msg) => (
                <span key={msg} className="field-error">{msg}</span>
              ))}
            </div>

            <div className="form-field">
              <label htmlFor="category">Category *</label>
              <input
                id="category"
                type="text"
                value={formData.category}
                onChange={(e) => handleChange("category", e.target.value)}
                required
              />
              {fieldErrors.category?.map((msg) => (
                <span key={msg} className="field-error">{msg}</span>
              ))}
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="unitPrice">Unit Price (INR) *</label>
            <input
              id="unitPrice"
              type="number"
              step="0.01"
              min="0"
              value={formData.unitPrice}
              onChange={(e) => handleChange("unitPrice", parseFloat(e.target.value) || 0)}
              required
            />
            {fieldErrors.unitPrice?.map((msg) => (
              <span key={msg} className="field-error">{msg}</span>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h2>Inventory Details</h2>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="currentStock">Current Stock</label>
              <input
                id="currentStock"
                type="number"
                step="1"
                min="0"
                value={formData.currentStock ?? 0}
                onChange={(e) => handleChange("currentStock", parseInt(e.target.value) || 0)}
              />
              {fieldErrors.currentStock?.map((msg) => (
                <span key={msg} className="field-error">{msg}</span>
              ))}
            </div>

            <div className="form-field">
              <label htmlFor="minimumStockAlertQuantity">Minimum Stock Alert</label>
              <input
                id="minimumStockAlertQuantity"
                type="number"
                step="1"
                min="0"
                value={formData.minimumStockAlertQuantity ?? 0}
                onChange={(e) => handleChange("minimumStockAlertQuantity", parseInt(e.target.value) || 0)}
              />
              {fieldErrors.minimumStockAlertQuantity?.map((msg) => (
                <span key={msg} className="field-error">{msg}</span>
              ))}
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="warehouseLocation">Warehouse Location</label>
            <input
              id="warehouseLocation"
              type="text"
              value={formData.warehouseLocation || ""}
              onChange={(e) => handleChange("warehouseLocation", e.target.value)}
              placeholder="e.g., Aisle 3, Rack B"
            />
            {fieldErrors.warehouseLocation?.map((msg) => (
              <span key={msg} className="field-error">{msg}</span>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate("/products")}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
          </button>
        </div>
      </form>
        </div>
      </div>
    </Layout>
  );
}

export default ProductForm;
