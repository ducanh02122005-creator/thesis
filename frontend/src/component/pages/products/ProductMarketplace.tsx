import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { productApi, ProductDTO } from "../../../api/productApi";
import { purchaseApi } from "../../../api/purchaseApi";
import { FaShoppingCart, FaTrash, FaTimes } from "react-icons/fa";
import "./ProductMarketplace.css";

type CartItem = {
    product: ProductDTO;
    quantity: number;
};

export default function ProductMarketplace() {
    const navigate = useNavigate();

    const [products, setProducts] = useState<ProductDTO[]>([]);
    const [search, setSearch] = useState("");
    const [merchant, setMerchant] = useState("");
    const [loading, setLoading] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [checkingOut, setCheckingOut] = useState(false);
    const [result, setResult] = useState<any>(null);

    useEffect(() => { loadProducts(); }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const res = await productApi.getAll();
            setProducts(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const merchants = useMemo(() => [...new Set(products.map(p => p.merchant))], [products]);

    const filtered = useMemo(() => {
        return products.filter(p => {
            const matchName = p.name.toLowerCase().includes(search.toLowerCase());
            const matchMerchant = merchant === "" || p.merchant === merchant;
            return matchName && matchMerchant;
        });
    }, [products, search, merchant]);

    const addToCart = (product: ProductDTO) => {
        setCart(prevCart => {
            const existingIndex = prevCart.findIndex(item => item.product.id === product.id);
            if (existingIndex > -1) {
                const newCart = [...prevCart];
                newCart[existingIndex].quantity += 1;
                return newCart;
            }
            return [...prevCart, { product, quantity: 1 }];
        });
    };

    const updateQuantity = (productId: number, amount: number) => {
        setCart(prevCart =>
            prevCart.map(item => {
                if (item.product.id === productId) {
                    const newQty = item.quantity + amount;
                    return newQty > 0 ? { ...item, quantity: newQty } : item;
                }
                return item;
            })
        );
    };

    const removeFromCart = (productId: number) => {
        setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
    };

    const totalItemsCount = useMemo(() => cart.reduce((total, item) => total + item.quantity, 0), [cart]);
    const cartTotalPrice = useMemo(() => cart.reduce((total, item) => total + (item.product.price * item.quantity), 0), [cart]);

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        try {
            setCheckingOut(true);
            const userId = Number(localStorage.getItem("userId"));
            const res = await purchaseApi.buy({
                userId,
                items: cart.map(item => ({ productId: item.product.id!, quantity: item.quantity }))
            });

            if (res.data.fraudProbability > 0.7) {
                alert("🚨 Giao dịch bị từ chối! Hệ thống phát hiện dấu hiệu rủi ro cao (High Fraud Risk). Vui lòng liên hệ bộ phận hỗ trợ.");
                setIsCartOpen(false);
                return;
            }

            setResult(res.data);
            setCart([]);
            setIsCartOpen(false);
        } catch (err: any) {
            alert(err.response?.data?.message || "Checkout failed");
        } finally {
            setCheckingOut(false);
        }
    };

    const getRiskBadgeClass = (prob: number) => {
        if (prob > 0.7) return "badge-probability badge-high-risk";
        if (prob > 0.4) return "badge-probability badge-mid-risk";
        return "badge-probability badge-low-risk";
    };

    // Hàm xử lý đăng xuất an toàn
    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    return (
        <div className="marketplace-container" style={{ width: "100%", minHeight: "100vh", boxSizing: "border-box" }}>

            {/* ================= HEADER SECTIONS ================= */}
            <div className="marketplace-header">
                <h1>🛒 Product Marketplace</h1>

                <div className="header-buttons">
                    <button onClick={() => setIsCartOpen(true)} className="btn-cart-toggle">
                        <FaShoppingCart size={18} />
                        <span>Cart</span>
                        {totalItemsCount > 0 && <span className="cart-badge">{totalItemsCount}</span>}
                    </button>

                    <button onClick={() => navigate("/admin/dashboard")} className="btn-secondary">
                        📊 Admin Dashboard
                    </button>
                    <button onClick={handleLogout} className="btn-secondary btn-logout">
                        🔒 Logout
                    </button>
                </div>
            </div>

            {/* ================= FILTER BAR ================= */}
            <div className="filter-bar">
                <input
                    placeholder="🔍 Search products by name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="filter-input"
                />

                <select
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                    className="filter-select"
                >
                    <option value="">All Merchants</option>
                    {merchants.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
            </div>

            {/* ================= ORDER RESULT MODAL ================= */}
            {result && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <div className="modal-header-box">
                            <div style={{ fontSize: 50, marginBottom: 10 }}>🎉</div>
                            <h2>Transaction Successful</h2>
                        </div>

                        <div className="info-row">
                            <span className="info-label">Transaction ID</span>
                            <span className="info-val-text">#{result.transactionId}</span>
                        </div>

                        <div className="info-row">
                            <span className="info-label">Total Amount</span>
                            <span className="info-val-price">${result.totalAmount}</span>
                        </div>

                        <div className="info-row">
                            <span className="info-label">Fraud Probability</span>
                            <span className={getRiskBadgeClass(result.fraudProbability)}>
                                {(result.fraudProbability * 100).toFixed(0)}%
                            </span>
                        </div>

                        <div className="info-row" style={{ borderBottom: "none", marginBottom: 25 }}>
                            <span className="info-label">Status</span>
                            <span className="status-text">{result.status}</span>
                        </div>

                        <button onClick={() => setResult(null)} className="btn-primary">
                            Awesome, Close
                        </button>
                    </div>
                </div>
            )}

            {/* ================= PRODUCTS GRID ================= */}
            <div className="products-grid-wrapper">
                {loading ? (
                    <div style={{ textAlign: "center", padding: "40px 0", color: "#64748b" }}>Loading marketplace products...</div>
                ) : (
                    <div className="market-grid">
                        {filtered.map(product => (
                            <div key={product.id} className="product-card">
                                <div className="card-content">
                                    <div>
                                        <div className="product-title">{product.name}</div>
                                        <div className="merchant-badge">🏪 {product.merchant}</div>
                                    </div>

                                    <div className="card-footer">
                                        <div className="price-row">
                                            <span className="price-label">Price</span>
                                            <span className="price-value">${product.price}</span>
                                        </div>

                                        <button onClick={() => addToCart(product)} className="btn-primary">
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ================= GIỎ HÀNG ================= */}
            {isCartOpen && (
                <ShoppingCart
                    cart={cart}
                    totalItemsCount={totalItemsCount}
                    cartTotalPrice={cartTotalPrice}
                    checkingOut={checkingOut}
                    onClose={() => setIsCartOpen(false)}
                    onUpdateQuantity={updateQuantity}
                    onRemoveFromCart={removeFromCart}
                    onCheckout={handleCheckout}
                />
            )}
        </div>
    );
}

// =========================================================================
// 🛒 COMPONENT GIỎ HÀNG TÁCH RỜI
// =========================================================================
type ShoppingCartProps = {
    cart: CartItem[];
    totalItemsCount: number;
    cartTotalPrice: number;
    checkingOut: boolean;
    onClose: () => void;
    onUpdateQuantity: (id: number, amount: number) => void;
    onRemoveFromCart: (id: number) => void;
    onCheckout: () => Promise<void>;
};

function ShoppingCart({
    cart,
    totalItemsCount,
    cartTotalPrice,
    checkingOut,
    onClose,
    onUpdateQuantity,
    onRemoveFromCart,
    onCheckout
}: ShoppingCartProps) {
    return (
        <div className="cart-overlay">
            <div className="cart-sidebar" style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
                <div className="cart-header" style={{ flexShrink: 0 }}>
                    <h2>Your Shopping Cart ({totalItemsCount})</h2>
                    <button onClick={onClose} className="btn-close">
                        <FaTimes size={20} />
                    </button>
                </div>

                <div className="cart-items-list" style={{ flex: 1, overflowY: "auto", padding: "0 20px" }}>
                    {cart.length === 0 ? (
                        <div className="cart-empty-text" style={{ padding: "40px 0", textAlign: "center", color: "#64748b" }}>
                            Your cart is empty.
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.product.id} className="cart-item-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 0", borderBottom: "1px solid #f1f5f9" }}>
                                <div className="cart-item-info">
                                    <div className="cart-item-name" style={{ fontWeight: 600, fontSize: "14px" }}>{item.product.name}</div>
                                    <div className="cart-item-price" style={{ color: "#10b981", fontWeight: 700, marginTop: "4px" }}>${item.product.price}</div>
                                </div>

                                <div className="qty-control" style={{ display: "flex", alignItems: "center", border: "1px solid #cbd5e1", borderRadius: "6px", overflow: "hidden" }}>
                                    <button
                                        onClick={() => onUpdateQuantity(item.product.id!, -1)}
                                        className="qty-btn"
                                        style={{ width: "28px", height: "28px", background: "#f1f5f9", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: "bold", color: "#334155" }}
                                    >
                                        −
                                    </button>
                                    <span className="qty-number" style={{ padding: "0 12px", fontWeight: 600, fontSize: "14px", color: "#334155" }}>{item.quantity}</span>
                                    <button
                                        onClick={() => onUpdateQuantity(item.product.id!, 1)}
                                        className="qty-btn"
                                        style={{ width: "28px", height: "28px", background: "#f1f5f9", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: "bold", color: "#334155" }}
                                    >
                                        +
                                    </button>
                                </div>

                                <button onClick={() => onRemoveFromCart(item.product.id!)} className="btn-delete-item" style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "8px" }}>
                                    <FaTrash size={14} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="cart-footer" style={{ flexShrink: 0, padding: "20px", borderTop: "1px solid #e2e8f0", background: "#fff" }}>
                        <div className="total-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                            <span style={{ fontSize: "16px", fontWeight: 700 }}>Total:</span>
                            <span className="total-price" style={{ fontSize: "20px", fontWeight: 700, color: "#10b981" }}>${cartTotalPrice.toFixed(2)}</span>
                        </div>
                        <button
                            onClick={onCheckout}
                            className="btn-primary"
                            style={{
                                width: "100%", padding: "14px", background: checkingOut ? "#94a3b8" : "#4f46e5", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: 600, cursor: checkingOut ? "not-allowed" : "pointer", boxShadow: "0 4px 6px -1px rgba(79, 70, 229, 0.2)"
                            }}
                            disabled={checkingOut}
                        >
                            {checkingOut ? "Processing Checkout..." : "🔒 Checkout & Pay"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}