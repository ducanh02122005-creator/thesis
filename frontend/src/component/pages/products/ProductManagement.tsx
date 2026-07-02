import { useEffect, useState } from "react";
import { productApi, ProductDTO } from "../../../api/productApi";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaTrash, FaEdit, FaTimes, FaTags } from "react-icons/fa";
import { GoArrowLeft } from "react-icons/go";

export default function ProductManagement() {
    const navigate = useNavigate();
    const [products, setProducts] = useState<ProductDTO[]>([]);
    const [loading, setLoading] = useState(false);

    // Trạng thái mở Modal Thêm / Sửa
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductDTO | null>(null);

    // Form States đầy đủ tương ứng DTO và UpdateRequest từ Backend
    const [name, setName] = useState("");
    const [price, setPrice] = useState<number | "">("");
    const [stock, setStock] = useState<number | "">("");
    const [category, setCategory] = useState("");
    const [merchant, setMerchant] = useState("");

    useEffect(() => {
        loadProducts();
    }, []);

    // 1. READ: Tải danh sách từ Server
    const loadProducts = async () => {
        try {
            setLoading(true);
            const res = await productApi.getAll();
            setProducts(res.data);
        } catch (err) {
            console.error("Failed to fetch products:", err);
            alert("Could not load products. Please check authorization token!");
        } finally {
            setLoading(false);
        }
    };

    // Reset form sạch sẽ khi bấm Add New
    const openCreateModal = () => {
        setEditingProduct(null);
        setName("");
        setCategory("");
        setStock("");
        setPrice("");
        setMerchant("");
        setIsModalOpen(true);
    };

    // Đổ đầy đủ dữ liệu cũ (bao gồm cả Category và Stock) lên Form khi bấm Edit
    const openEditModal = (product: ProductDTO) => {
        setEditingProduct(product);
        setName(product.name);
        setCategory(product.category || "");
        setStock(product.stock ?? "");
        setPrice(product.price);
        setMerchant(product.merchant || "");
        setIsModalOpen(true);
    };

    // 2. CREATE & UPDATE: Submit dữ liệu lên Spring Boot
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !category || price === "" || stock === "") {
            alert("Please fill in required fields (Name, Category, Price, Stock)");
            return;
        }

        const payload: ProductDTO = {
            name,
            category,
            stock: Number(stock),
            price: Number(price),
            merchant
        };

        try {
            if (editingProduct?.id) {
                // UPDATE dữ liệu qua hàm Mapping của Backend
                await productApi.update(editingProduct.id, payload);
                alert("Product updated successfully!");
            } else {
                // CREATE dữ liệu mới
                await productApi.create(payload);
                alert("Product created successfully!");
            }
            setIsModalOpen(false);
            loadProducts(); // Làm mới danh sách hiển thị
        } catch (err) {
            console.error("Save error:", err);
            alert("Failed to save product.");
        }
    };

    // 3. DELETE: Gửi yêu cầu xóa tới Server
    const handleDelete = async (id: number, productName: string) => {
        if (!window.confirm(`Are you sure you want to delete "${productName}"?`)) return;

        try {
            await productApi.remove(id);
            alert("Product deleted!");
            loadProducts();
        } catch (err) {
            console.error("Delete error:", err);
            alert("Failed to delete product.");
        }
    };

    return (
        <div style={{ padding: "40px 20px", maxWidth: 1200, margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>

            {/* ================= HEADER ACTIONS ================= */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30, flexWrap: "wrap", gap: 15 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
                    <button onClick={() => navigate("/admin/dashboard")} style={backBtnStyle}>
                        <GoArrowLeft size={20} style={{ flexShrink: 0 }} />
                    </button>
                    <h1 style={{ margin: 0, fontSize: 26, color: "#0f172a" }}>📦 Product Management</h1>
                </div>

                <button onClick={openCreateModal} style={addBtnStyle}>
                    <FaPlus style={{ marginRight: 8, flexShrink: 0 }} size={14} /> Add New Product
                </button>
            </div>

            {/* ================= PRODUCT TABLE ================= */}
            <div style={{ background: "white", borderRadius: 16, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9", overflow: "hidden" }}>
                {loading ? (
                    <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>Loading products...</div>
                ) : products.length === 0 ? (
                    <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>No products available. Click "Add New Product" to populate items.</div>
                ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                        <thead>
                            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                                <th style={thStyle}>ID</th>
                                <th style={thStyle}>Product Name</th>
                                <th style={thStyle}>Category</th>
                                <th style={thStyle}>Merchant</th>
                                <th style={thStyle}>Stock</th>
                                <th style={thStyle}>Price</th>
                                <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                    <td style={tdStyle}>#{product.id}</td>
                                    <td style={{ ...tdStyle, fontWeight: 600, color: "#1e293b" }}>{product.name}</td>
                                    <td style={tdStyle}>
                                        <span style={categoryBadgeStyle}>
                                            <FaTags style={{ marginRight: 6, flexShrink: 0 }} size={12} /> {product.category}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={merchantBadgeStyle}>🏪 {product.merchant || "N/A"}</span>
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{ fontWeight: 500, color: product.stock > 10 ? "#475569" : "#ef4444" }}>
                                            {product.stock} pcs
                                        </span>
                                    </td>
                                    <td style={{ ...tdStyle, fontWeight: 700, color: "#10b981" }}>${product.price.toFixed(2)}</td>
                                    <td style={{ ...tdStyle, textAlign: "right" }}>
                                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                                            <button onClick={() => openEditModal(product)} style={{ ...actionBtnStyle, color: "#4f46e5", background: "#f5f3ff" }} title="Edit">
                                                <FaEdit size={14} style={{ flexShrink: 0 }} />
                                            </button>
                                            <button onClick={() => handleDelete(product.id!, product.name)} style={{ ...actionBtnStyle, color: "#ef4444", background: "#fef2f2" }} title="Delete">
                                                <FaTrash size={14} style={{ flexShrink: 0 }} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* ================= ADD/EDIT MODAL ================= */}
            {isModalOpen && (
                <div style={modalOverlayStyle}>
                    <div style={modalBoxStyle}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                            <h2 style={{ margin: 0, fontSize: 20, color: "#0f172a" }}>
                                {editingProduct ? "✏️ Edit Product" : "➕ Add New Product"}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} style={closeBtnStyle}>
                                <FaTimes size={16} style={{ flexShrink: 0 }} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            <div>
                                <label style={labelStyle}>Product Name *</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. iPhone 15 Pro Max"
                                    style={inputStyle}
                                    required
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Category *</label>
                                <input
                                    type="text"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    placeholder="e.g. Electronics, Clothing"
                                    style={inputStyle}
                                    required
                                />
                            </div>

                            <div style={{ display: "flex", gap: 12 }}>
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>Stock Qty *</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={stock}
                                        onChange={(e) => setStock(e.target.value !== "" ? Number(e.target.value) : "")}
                                        placeholder="100"
                                        style={inputStyle}
                                        required
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>Price ($ USD) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value !== "" ? Number(e.target.value) : "")}
                                        placeholder="0.00"
                                        style={inputStyle}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>Merchant Name</label>
                                <input
                                    type="text"
                                    value={merchant}
                                    onChange={(e) => setMerchant(e.target.value)}
                                    placeholder="e.g. Apple Store, Amazon"
                                    style={inputStyle}
                                />
                            </div>

                            <div style={{ display: "flex", gap: 10, marginTop: 15 }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={cancelBtnStyle}>
                                    Cancel
                                </button>
                                <button type="submit" style={saveBtnStyle}>
                                    {editingProduct ? "Save Changes" : "Create Product"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

/* =========================
   ADDITIONAL STYLES OBJECTS
========================= */
const thStyle = { padding: "16px 20px", fontSize: 14, fontWeight: 600, color: "#475569" };
const tdStyle = { padding: "16px 20px", fontSize: 15, color: "#334155" };
const labelStyle = { fontSize: 13, fontWeight: 600, color: "#475569" };
const inputStyle = { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 15, marginTop: 4, outline: "none", boxSizing: "border-box" as const };
const addBtnStyle = { padding: "12px 20px", background: "#4f46e5", color: "white", border: "none", borderRadius: 10, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 10px rgba(79, 70, 229, 0.15)" };
const backBtnStyle = { width: 40, height: 40, background: "#f1f5f9", border: "none", borderRadius: "50%", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", padding: 0 };
const actionBtnStyle = { width: 34, height: 34, border: "none", borderRadius: 8, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", padding: 0 };
const merchantBadgeStyle = { padding: "4px 10px", background: "#f1f5f9", borderRadius: 12, fontSize: 13, color: "#475569", fontWeight: 500 };
const categoryBadgeStyle = { padding: "4px 10px", background: "#eff6ff", borderRadius: 12, fontSize: 13, color: "#1d4ed8", fontWeight: 500, display: "inline-flex", alignItems: "center", justifyContent: "center" };
const modalOverlayStyle = { position: "fixed" as const, top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.5)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 };
const modalBoxStyle = { background: "white", padding: 30, borderRadius: 16, width: "100%", maxWidth: 440, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" };
const closeBtnStyle = { background: "none", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 };
const saveBtnStyle = { flex: 2, padding: "12px", background: "#4f46e5", color: "white", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" };
const cancelBtnStyle = { flex: 1, padding: "12px", background: "#f1f5f9", color: "#475569", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" };