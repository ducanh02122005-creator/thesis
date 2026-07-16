import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productApi, ProductDTO } from "../../../api/productApi";
import { purchaseApi } from "../../../api/purchaseApi";
import {
    FaShoppingCart,
    FaTrash,
    FaTimes,
    FaArrowLeft,
    FaStar,
    FaHeart,
    FaPlus,
    FaStore
} from "react-icons/fa";
import "./CategoryShop.css";

// Cast icons to any to bypass TS component check errors
const FaShoppingCartAny = FaShoppingCart as any;
const FaTrashAny = FaTrash as any;
const FaTimesAny = FaTimes as any;
const FaArrowLeftAny = FaArrowLeft as any;
const FaStarAny = FaStar as any;
const FaHeartAny = FaHeart as any;
const FaPlusAny = FaPlus as any;
const FaStoreAny = FaStore as any;

type CartItem = {
    product: ProductDTO;
    quantity: number;
};

export default function CategoryShop() {
    const { category, productId } = useParams<{ category: string; productId: string }>();
    const navigate = useNavigate();

    const [product, setProduct] = useState<ProductDTO | null>(null);
    const [otherProducts, setOtherProducts] = useState<ProductDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [checkingOut, setCheckingOut] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [favorites, setFavorites] = useState<number[]>([]);

    const [cart, setCart] = useState<CartItem[]>(() => {
        const stored = localStorage.getItem("cart");
        return stored ? JSON.parse(stored) : [];
    });

    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        if (productId) {
            setLoading(true);
            Promise.all([
                productApi.getById(Number(productId)),
                productApi.getAll()
            ])
            .then(([prodRes, allRes]) => {
                setProduct(prodRes.data);
                // Filter other products in the same category, excluding current product
                const filtered = allRes.data.filter(p => p.category === category && p.id !== Number(productId));
                setOtherProducts(filtered);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error loading shop details:", err);
                setLoading(false);
            });
        }
    }, [category, productId]);

    // Enforce same-category check on adding to cart
    const addToCart = (prod: ProductDTO) => {
        if (cart.length > 0 && cart[0].product.category !== prod.category) {
            const confirmClear = window.confirm(
                "🚨 Transaction restriction!\nYour cart contains items from another Shop/Category. A transaction cannot mix categories.\n\nClear your cart and add this product instead?"
            );
            if (confirmClear) {
                setCart([{ product: prod, quantity: 1 }]);
            }
            return;
        }

        setCart(prevCart => {
            const existingIndex = prevCart.findIndex(item => item.product.id === prod.id);
            if (existingIndex > -1) {
                const newCart = [...prevCart];
                newCart[existingIndex].quantity += 1;
                return newCart;
            }
            return [...prevCart, { product: prod, quantity: 1 }];
        });
    };

    const updateQuantity = (id: number, amount: number) => {
        setCart(prevCart =>
            prevCart.map(item => {
                if (item.product.id === id) {
                    const newQty = item.quantity + amount;
                    return newQty > 0 ? { ...item, quantity: newQty } : item;
                }
                return item;
            })
        );
    };

    const removeFromCart = (id: number) => {
        setCart(prevCart => prevCart.filter(item => item.product.id !== id));
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

    const getShopLabel = (shopCode?: string) => {
        if (shopCode === "food_dining") return "Food & Dining Shop 🍕";
        if (shopCode === "gas_transport") return "Gas & Transport Shop 🚗";
        if (shopCode === "shopping_net") return "Online Shopping Shop 💻";
        return "Category Shop";
    };

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh", fontFamily: "system-ui, sans-serif", color: "#64748b" }}>
                Loading Shop details...
            </div>
        );
    }

    if (!product) {
        return (
            <div style={{ padding: 40, textAlign: "center", fontFamily: "system-ui, sans-serif" }}>
                <h2>Product details not found.</h2>
                <button onClick={() => navigate("/market")} className="btn-primary" style={{ maxWidth: 200, marginTop: 20 }}>
                    Back to Marketplace
                </button>
            </div>
        );
    }

    return (
        <div className="shop-details-container">
            {/* Header */}
            <header className="shop-top-header">
                <div className="back-btn-row">
                    <button onClick={() => navigate("/market")} className="btn-icon-back">
                        <FaArrowLeftAny size={16} /> Back to Marketplace
                    </button>
                </div>
                <div className="shop-title-header">
                    <FaStoreAny size={20} color="#0ea5e9" /> {getShopLabel(category)}
                </div>
                <div className="shop-cart-header">
                    <button onClick={() => setIsCartOpen(true)} className="nav-action-link">
                        <FaShoppingCartAny size={18} /> Cart
                        {totalItemsCount > 0 && <span className="nav-cart-badge">{totalItemsCount}</span>}
                    </button>
                </div>
            </header>

            {/* Main Details Panel */}
            <main className="shop-main-layout">
                <div className="detail-panel-card">
                    {/* Left side: Product visual */}
                    <div className="detail-visual-box">
                        <span className="detail-visual-emoji">
                            {category === "food_dining" ? "🍕" : category === "gas_transport" ? "🚗" : "💻"}
                        </span>
                    </div>

                    {/* Right side: Info */}
                    <div className="detail-info-box">
                        <div>
                            <span className="detail-merchant-badge">🏪 Merchant: {product.merchant}</span>
                            <h1 className="detail-product-name">{product.name}</h1>
                            <div className="detail-rating-row">
                                <FaStarAny size={14} color="#fbbf24" />
                                <FaStarAny size={14} color="#fbbf24" />
                                <FaStarAny size={14} color="#fbbf24" />
                                <FaStarAny size={14} color="#fbbf24" />
                                <FaStarAny size={14} color="#fbbf24" />
                                <span className="rating-text">4.8 (1,234 reviews)</span>
                            </div>
                        </div>

                        <div className="detail-middle-pricing">
                            <div className="detail-price-text">${product.price.toFixed(2)}</div>
                            <div className={`detail-stock-indicator ${product.stock > 0 ? "in-stock" : "out-stock"}`}>
                                {product.stock > 0 ? `● In Stock (${product.stock} left)` : "● Out of Stock"}
                            </div>
                        </div>

                        <div className="detail-description-section">
                            <h3>Product Description</h3>
                            <p>
                                Experience premium quality from our verified merchants. All transactions are evaluated through our high-performance transformer-based neural network model for immediate real-time safety.
                            </p>
                        </div>

                        <div className="detail-actions-row">
                            <button
                                onClick={() => addToCart(product)}
                                className="btn-add-cart-large"
                                disabled={product.stock === 0}
                            >
                                <FaPlusAny size={14} style={{ marginRight: 8 }} /> Add to Cart
                            </button>
                            <button
                                onClick={() => toggleFavorite(product.id!)}
                                className={`btn-fav-large ${favorites.includes(product.id!) ? "active" : ""}`}
                            >
                                <FaHeartAny size={16} /> Favorite
                            </button>
                        </div>
                    </div>
                </div>

                {/* Other Products Section */}
                <section className="cross-sell-section">
                    <h2 className="cross-sell-title">Other Products in this Shop</h2>
                    {otherProducts.length === 0 ? (
                        <div className="no-cross-sell">No other products available in this shop right now.</div>
                    ) : (
                        <div className="cross-sell-grid">
                            {otherProducts.map(p => (
                                <div
                                    key={p.id}
                                    className="cross-sell-card"
                                    onClick={() => navigate(`/shop/${p.category}/${p.id}`)}
                                >
                                    <div className="cross-sell-image-box">
                                        <span>{category === "food_dining" ? "🍕" : category === "gas_transport" ? "🚗" : "💻"}</span>
                                    </div>
                                    <div className="cross-sell-details">
                                        <h4 className="cross-sell-product-title">{p.name}</h4>
                                        <div className="cross-sell-footer">
                                            <span className="cross-sell-price">${p.price.toFixed(2)}</span>
                                            <button
                                                className="btn-cross-sell-add"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    addToCart(p);
                                                }}
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

            {/* Shopping Cart Sidebar */}
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

            {/* Success Modal */}
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
        </div>
    );
}

// Shopping Cart Helper
type CartProps = {
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
}: CartProps) {
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
                        <div className="cart-empty-text">Your cart is empty.</div>
                    ) : (
                        cart.map(item => (
                            <div key={item.product.id} className="cart-item-row">
                                <div className="cart-item-info">
                                    <div className="cart-item-name">{item.product.name}</div>
                                    <div className="cart-item-price">${item.product.price.toFixed(2)}</div>
                                </div>

                                <div className="qty-control">
                                    <button onClick={() => onUpdateQuantity(item.product.id!, -1)} className="qty-btn">−</button>
                                    <span className="qty-number">{item.quantity}</span>
                                    <button onClick={() => onUpdateQuantity(item.product.id!, 1)} className="qty-btn">+</button>
                                </div>

                                <button onClick={() => onRemoveFromCart(item.product.id!)} className="btn-delete-item">
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
                        <button onClick={onCheckout} className="btn-primary" disabled={checkingOut}>
                            {checkingOut ? "Processing Checkout..." : "🔒 Checkout & Pay"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
