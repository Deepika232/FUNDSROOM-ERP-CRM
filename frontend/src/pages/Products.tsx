import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getApiErrorMessage } from "../api/client";
import { getProducts } from "../api/product.api";
import Layout from "../components/Layout";
import type { Product, ProductQuery } from "../types/product.types";
import "./Products.css";

function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState<ProductQuery>({
    page: 1,
    limit: 10,
    search: "",
    category: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getProducts(query);
      setProducts(response.products);
      setPagination(response.pagination);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery({ ...query, page: 1 });
  };

  const handleCategoryFilter = (value: string) => {
    setQuery({ ...query, category: value || undefined, page: 1 });
  };

  const getStockBadgeClass = (product: Product) => {
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

  return (
    <Layout>
      <div className="page-container">
        <div className="page-content">
        <div className="page-header">
          <h1>Products</h1>
        <Link to="/products/new" className="primary-button">
          Add Product
        </Link>
      </div>

      <div className="filters-bar">
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search by name, SKU, category..."
            value={query.search || ""}
            onChange={(e) => setQuery({ ...query, search: e.target.value })}
          />
          <button type="submit" className="secondary-button">
            Search
          </button>
        </form>

        <div className="filter-selects">
          <input
            type="text"
            placeholder="Filter by category..."
            value={query.category || ""}
            onChange={(e) => handleCategoryFilter(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading-state">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <p>No products found</p>
          <Link to="/products/new" className="primary-button">
            Add your first product
          </Link>
        </div>
      ) : (
        <>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Unit Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <Link to={`/products/${product.id}`} className="table-link">
                        {product.productName}
                      </Link>
                      {product.warehouseLocation && (
                        <div className="table-subtext">
                          Location: {product.warehouseLocation}
                        </div>
                      )}
                    </td>
                    <td>{product.sku}</td>
                    <td>{product.category}</td>
                    <td>{formatPrice(product.unitPrice)}</td>
                    <td>
                      <span className={`badge ${getStockBadgeClass(product)}`}>
                        {product.currentStock} in stock
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <Link
                          to={`/products/${product.id}`}
                          className="action-button"
                        >
                          View
                        </Link>
                        <Link
                          to={`/products/${product.id}/edit`}
                          className="action-button"
                        >
                          Edit
                        </Link>
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

export default Products;
