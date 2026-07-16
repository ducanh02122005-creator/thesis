import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { productApi, ProductDTO } from "../../../api/productApi";
import { purchaseApi } from "../../../api/purchaseApi";
import {
    FaShoppingCart,
    FaTrash,
    FaTimes,
    FaSearch,
    FaMapMarkerAlt,
    FaHeart,
    FaStar,
    FaSignOutAlt,
    FaHistory
} from "react-icons/fa";
import "./ProductMarketplace.css";

// Cast icons to any to bypass TS component check errors
const FaShoppingCartAny = FaShoppingCart as any;
const FaTrashAny = FaTrash as any;
const FaTimesAny = FaTimes as any;
const FaSearchAny = FaSearch as any;
const FaMapMarkerAltAny = FaMapMarkerAlt as any;
const FaHeartAny = FaHeart as any;
const FaStarAny = FaStar as any;
const FaSignOutAltAny = FaSignOutAlt as any;
const FaHistoryAny = FaHistory as any;

type CartItem = {
    product: ProductDTO;
    quantity: number;
};

export default function ProductMarketplace() {
    const navigate = useNavigate();

    const [products, setProducts] = useState<ProductDTO[]>([]);
    const [search, setSearch] = useState("");
    const [selectedShop, setSelectedShop] = useState("all");
    const [selectedMerchants, setSelectedMerchants] = useState<string[]>([]);
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [sortBy, setSortBy] = useState("featured");

    const [loading, setLoading] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [cart, setCart] = useState<CartItem[]>(() => {
        const stored = localStorage.getItem("cart");
        return stored ? JSON.parse(stored) : [];
    });
    const [checkingOut, setCheckingOut] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [favorites, setFavorites] = useState<number[]>([]);

    useEffect(() => {
        loadProducts();
    }, []);

    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const res = await productApi.getAll();
            setProducts(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Extract unique merchants list
    const merchants = useMemo(() => {
        return [...new Set(products.map(p => p.merchant).filter(Boolean))] as string[];
    }, [products]);

    // Handle merchant checkbox toggling
    const handleMerchantChange = (merchant: string) => {
        setSelectedMerchants(prev =>
            prev.includes(merchant)
                ? prev.filter(m => m !== merchant)
                : [...prev, merchant]
        );
    };

    // Map database categories to user-friendly shop labels
    const getShopLabel = (shopCode: string) => {
        if (shopCode === "food_dining") return "Food & Dining Shop";
        if (shopCode === "gas_transport") return "Gas & Transport Shop";
        if (shopCode === "shopping_net") return "Online Shopping Shop";
        return "All Shops";
    };

    // Category representative icons
    const getCategoryIcon = (category: string) => {
        if (category === "food_dining") return "🍕";
        if (category === "gas_transport") return "🚗";
        if (category === "shopping_net") return "💻";
        return "📦";
    };

    // Filter products list
    const filteredAndSorted = useMemo(() => {
        let list = products.filter(p => {
            const matchName = p.name.toLowerCase().includes(search.toLowerCase());
            const matchShop = selectedShop === "all" || p.category === selectedShop;
            const matchMerchant = selectedMerchants.length === 0 || selectedMerchants.includes(p.merchant || "");
            const matchMinPrice = minPrice === "" || p.price >= parseFloat(minPrice);
            const matchMaxPrice = maxPrice === "" || p.price <= parseFloat(maxPrice);
            return matchName && matchShop && matchMerchant && matchMinPrice && matchMaxPrice;
        });

        // Sorting
        if (sortBy === "low-to-high") {
            list = [...list].sort((a, b) => a.price - b.price);
        } else if (sortBy === "high-to-low") {
            list = [...list].sort((a, b) => b.price - a.price);
        }
        return list;
    }, [products, search, selectedShop, selectedMerchants, minPrice, maxPrice, sortBy]);

    // Cart actions
    const addToCart = (product: ProductDTO) => {
        if (cart.length > 0 && cart[0].product.category !== product.category) {
            const confirmClear = window.confirm(
                "🚨 Transaction restriction!\nYour cart contains items from another Shop/Category. A transaction cannot mix categories.\n\nClear your cart and add this product instead?"
            );
            if (confirmClear) {
                setCart([{ product, quantity: 1 }]);
            }
            return;
        }

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

    const toggleFavorite = (id: number) => {
        setFavorites(prev =>
            prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
        );
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

            if (
                res.data.decision === "BLOCK" ||
                res.data.status === "CANCELLED" ||
                res.data.fraudDetected === true ||
                res.data.fraudProbability >= 0.5
            ) {
                alert("🚨 Transaction declined! The system detected signs of high risk (High Fraud Risk). Please contact support.");
                setIsCartOpen(false);
                return;
            }

            setResult(res.data);
            setCart([]);
            setIsCartOpen(false);
        } catch (err: any) {
            const errorData = err.response?.data;
            const errorMsg = errorData?.message || "";
            if (
                errorData?.decision === "BLOCK" ||
                errorData?.status === "CANCELLED" ||
                errorMsg.toLowerCase().includes("declined") ||
                errorMsg.toLowerCase().includes("risk") ||
                errorMsg.toLowerCase().includes("fraud")
            ) {
                alert("🚨 Transaction declined! The system detected signs of high risk (High Fraud Risk). Please contact support.");
            } else {
                alert(errorMsg || "Checkout failed");
            }
            setIsCartOpen(false);
        } finally {
            setCheckingOut(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const getRiskBadgeClass = (prob: number) => {
        if (prob > 0.7) return "badge-probability badge-high-risk";
        if (prob > 0.4) return "badge-probability badge-mid-risk";
        return "badge-probability badge-low-risk";
    };

    return (
        <div className="marketplace-container">

            {/* ================= TOP HEADER NAV ================= */}
            <header className="marketplace-top-header">
                <div className="logo-section" onClick={() => setSelectedShop("all")}>
                    <span>YOUR</span> MARKET
                </div>

                <div className="search-and-categories">
                    <button className="btn-categories-dropdown" onClick={() => setSelectedShop("all")}>
                        ☰ Categories
                    </button>
                    <div className="search-input-wrapper">
                        <FaSearchAny className="search-icon-svg" size={14} />
                        <input
                            placeholder="Search products by name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="search-input-field"
                        />
                    </div>
                </div>

                <div className="nav-actions-group">
                    <button className="nav-action-link" onClick={() => navigate("/history")}>
                        <FaHistoryAny size={15} /> Orders
                    </button>

                    <button className="nav-action-link" style={{ cursor: "default" }}>
                        <FaHeartAny size={15} /> Favorites ({favorites.length})
                    </button>

                    <button onClick={() => setIsCartOpen(true)} className="nav-action-link">
                        <FaShoppingCartAny size={16} /> Cart
                        {totalItemsCount > 0 && <span className="nav-cart-badge">{totalItemsCount}</span>}
                    </button>

                    {localStorage.getItem("role") === "ADMIN" && (
                        <button onClick={() => navigate("/admin/dashboard")} className="btn-sign-out">
                            📊 Admin Panel
                        </button>
                    )}

                    <button onClick={handleLogout} className="btn-sign-out">
                        <FaSignOutAltAny size={13} style={{ marginRight: 6 }} /> Sign Out
                    </button>
                </div>
            </header>

            {/* ================= SECOND SUB-HEADER NAV ================= */}
            <div className="marketplace-sub-header">
                <div className="location-indicator">
                    <FaMapMarkerAltAny size={13} color="#0ea5e9" /> California, US
                </div>

                <nav className="shop-tabs-row">
                    <button
                        onClick={() => setSelectedShop("all")}
                        className={`shop-tab-item ${selectedShop === "all" ? "active" : ""}`}
                    >
                        All Shops
                    </button>
                    <button
                        onClick={() => setSelectedShop("food_dining")}
                        className={`shop-tab-item ${selectedShop === "food_dining" ? "active" : ""}`}
                    >
                        🍔 Food & Dining Shop
                    </button>
                    <button
                        onClick={() => setSelectedShop("gas_transport")}
                        className={`shop-tab-item ${selectedShop === "gas_transport" ? "active" : ""}`}
                    >
                        🚗 Gas & Transport Shop
                    </button>
                    <button
                        onClick={() => setSelectedShop("shopping_net")}
                        className={`shop-tab-item ${selectedShop === "shopping_net" ? "active" : ""}`}
                    >
                        💻 Online Shopping Shop
                    </button>
                </nav>

                <a href="#become-seller" className="become-seller-link" onClick={(e) => e.preventDefault()}>
                    Become a seller
                </a>
            </div>

            {/* ================= MAIN COLUMN GRID ================= */}
            <main className="marketplace-main-layout">

                {/* Left Sidebar Filter Section */}
                <aside className="sidebar-filters-column">
                    <div>
                        <div className="filter-section-title">Price Range ($)</div>
                        <div className="price-inputs-row">
                            <input
                                placeholder="Min"
                                type="number"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                className="price-box-input"
                            />
                            <span style={{ color: "#cbd5e1" }}>–</span>
                            <input
                                placeholder="Max"
                                type="number"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                className="price-box-input"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="filter-section-title">Merchants & Brands</div>
                        {merchants.length === 0 ? (
                            <div style={{ fontSize: 13, color: "#94a3b8" }}>No merchants listed.</div>
                        ) : (
                            merchants.map(m => (
                                <label key={m} className="filter-checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={selectedMerchants.includes(m)}
                                        onChange={() => handleMerchantChange(m)}
                                    />
                                    {m}
                                </label>
                            ))
                        )}
                    </div>

                    <div>
                        <div className="filter-section-title">Target Segment</div>
                        <label className="filter-checkbox-label">
                            <input type="checkbox" defaultChecked /> Unisex
                        </label>
                        <label className="filter-checkbox-label">
                            <input type="checkbox" /> Premium Selection
                        </label>
                    </div>

                    <div>
                        <div className="filter-section-title">Merchant Rating</div>
                        <div style={{ display: "flex", gap: 2, color: "#fbbf24", fontSize: 14 }}>
                            <FaStarAny /><FaStarAny /><FaStarAny /><FaStarAny /><FaStarAny />
                            <span style={{ color: "#64748b", fontSize: 12, marginLeft: 8 }}>(4.5+)</span>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <section className="products-display-column">

                    <div className="display-header-row">
                        <h2 className="found-results-text">
                            Found {filteredAndSorted.length} results for <span>{getShopLabel(selectedShop)}</span>
                        </h2>

                        <div className="sort-and-layouts">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="sort-select-box"
                            >
                                <option value="featured">Sort by: Featured</option>
                                <option value="low-to-high">Price: Low to High</option>
                                <option value="high-to-low">Price: High to Low</option>
                            </select>
                        </div>
                    </div>

                    {/* Product Cards Grid */}
                    {loading ? (
                        <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>
                            Loading products list...
                        </div>
                    ) : filteredAndSorted.length === 0 ? (
                        <div style={{ padding: "60px 0", textAlign: "center", color: "#94a3b8" }}>
                            No products found matching the criteria.
                        </div>
                    ) : (
                        <div className="marketplace-products-grid">
                            {filteredAndSorted.map(product => (
                                <div
                                    key={product.id}
                                    className="marketplace-product-card"
                                    onClick={() => navigate(`/shop/${product.category}/${product.id}`)}
                                    style={{ cursor: "pointer" }}
                                >
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleFavorite(product.id!);
                                        }}
                                        className={`btn-card-favorite ${favorites.includes(product.id!) ? "active" : ""}`}
                                    >
                                        <FaHeartAny size={15} />
                                    </button>

                                    <div className={`card-image-box category-${product.category}`}>
                                        <span className="product-visual-icon">
                                            {getCategoryIcon(product.category)}
                                        </span>
                                    </div>

                                    <div className="card-details-box">
                                        <div>
                                            <h3 className="product-card-title">{product.name}</h3>
                                            <div className="product-rating-row">
                                                <div className="star-rating-box">
                                                    <FaStarAny size={11} />
                                                    <FaStarAny size={11} />
                                                    <FaStarAny size={11} />
                                                    <FaStarAny size={11} />
                                                    <FaStarAny size={11} />
                                                </div>
                                                <span>4.8 (230)</span>
                                            </div>
                                        </div>

                                        <div className="product-bottom-purchase">
                                            <span className="product-card-price">${product.price.toFixed(2)}</span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    addToCart(product);
                                                }}
                                                className="btn-card-add-cart"
                                                title="Add to Cart"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>

            {/* ================= ORDER SUCCESS MODAL ================= */}
            {result && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <div className="modal-header-box">
                            <div style={{ fontSize: 55, marginBottom: 10 }}>🎉</div>
                            <h2>Transaction Successful</h2>
                        </div>

                        <div className="info-row">
                            <span className="info-label">Transaction ID</span>
                            <span className="info-val-text">#{result.transactionId}</span>
                        </div>

                        <div className="info-row">
                            <span className="info-label">Total Amount</span>
                            <span className="info-val-price">${result.totalAmount?.toFixed(2)}</span>
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

            {/* ================= SHOPPING CART SIDEBAR DRAWER ================= */}
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

// Shopping Cart Sidebar Component
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
            <div className="cart-sidebar">
                <div className="cart-header">
                    <h2>Your Shopping Cart ({totalItemsCount})</h2>
                    <button onClick={onClose} className="btn-close">
                        <FaTimesAny size={18} />
                    </button>
                </div>

                <div className="cart-items-list">
                    {cart.length === 0 ? (
                        <div className="cart-empty-text">
                            Your cart is empty.
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.product.id} className="cart-item-row">
                                <div className="cart-item-info">
                                    <div className="cart-item-name">{item.product.name}</div>
                                    <div className="cart-item-price">${item.product.price.toFixed(2)}</div>
                                </div>

                                <div className="qty-control">
                                    <button
                                        onClick={() => onUpdateQuantity(item.product.id!, -1)}
                                        className="qty-btn"
                                    >
                                        −
                                    </button>
                                    <span className="qty-number">{item.quantity}</span>
                                    <button
                                        onClick={() => onUpdateQuantity(item.product.id!, 1)}
                                        className="qty-btn"
                                    >
                                        +
                                    </button>
                                </div>

                                <button
                                    onClick={() => onRemoveFromCart(item.product.id!)}
                                    className="btn-delete-item"
                                    title="Delete item"
                                >
                                    <FaTrashAny size={14} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="cart-footer">
                        <div className="total-row">
                            <span>Total:</span>
                            <span className="total-price">${cartTotalPrice.toFixed(2)}</span>
                        </div>
                        <button
                            onClick={onCheckout}
                            className="btn-primary"
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