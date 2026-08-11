import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getApiErrorMessage } from "../api/client";
import { getProductById } from "../api/product.api";
import Layout from "../components/Layout";
import type { Product } from "../types/product.types";
import "./ProductDetail.css";

function ProductDetail() {
  const { id } = useParams<{ id: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      loadProduct(id);
    }
  }, [id]);

  const loadProduct = async (productId: string) => {
    setLoading(true);
    try {
      const data = await getProductById(productId);
      setProduct(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const getStockBadgeClass = () => {
    if (!product) return "";
    if (product.currentStock === 0) return "stock-out";
    if (product.currentStock <= product.minimumStockAlertQuantity) return "stock-low";
    return "stock-ok";
  };

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    return num.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    });
  };

  if (loading) {
    return <div className="page-container loading-state">Loading product details...</div>;
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="page-container">
          <div className="page-content">
          <div className="error-banner">{error || "Product not found"}</div>
          <Link to="/products" className="primary-button">
            Back to Products
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
          <h1>{product.productName}</h1>
          <p className="sku-text">SKU: {product.sku}</p>
        </div>
        <div className="header-actions">
          <Link to={`/products/${product.id}/edit`} className="primary-button">
            Edit Product
          </Link>
        </div>
      </div>

      <div className="product-detail-grid">
        <div className="detail-card">
          <h2>Product Details</h2>
          <div className="detail-row">
            <span className="detail-label">Category:</span>
            <span className="detail-value">{product.category}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Unit Price:</span>
            <span className="detail-value price-highlight">
              {formatPrice(product.unitPrice)}
            </span>
          </div>
          {product.warehouseLocation && (
            <div className="detail-row">
              <span className="detail-label">Warehouse Location:</span>
              <span className="detail-value">{product.warehouseLocation}</span>
            </div>
          )}
        </div>

        <div className="detail-card">
          <h2>Inventory Status</h2>
          <div className="detail-row">
            <span className="detail-label">Current Stock:</span>
            <span className={`badge ${getStockBadgeClass()}`}>
              {product.currentStock} units
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Min. Stock Alert:</span>
            <span className="detail-value">
              {product.minimumStockAlertQuantity} units
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Stock Value:</span>
            <span className="detail-value">
              {formatPrice((parseFloat(product.unitPrice) * product.currentStock).toString())}
            </span>
          </div>
        </div>

        <div className="detail-card">
          <h2>Audit Information</h2>
          <div className="detail-row">
            <span className="detail-label">Created:</span>
            <span className="detail-value">
              {new Date(product.createdAt).toLocaleString()}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Last Updated:</span>
            <span className="detail-value">
              {new Date(product.updatedAt).toLocaleString()}
            </span>
          </div>
          {product._count && (
            <>
              <div className="detail-row">
                <span className="detail-label">Stock Movements:</span>
                <span className="detail-value">{product._count.stockMovements}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Challan Items:</span>
                <span className="detail-value">{product._count.challanItems}</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="detail-actions">
        <Link to="/products" className="secondary-button">
          Back to Products
        </Link>
      </div>
        </div>
      </div>
    </Layout>
  );
}

export default ProductDetail;
