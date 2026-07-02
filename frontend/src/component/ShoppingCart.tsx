export default function ShoppingCart() {
    return (
        <div style={{
            width: "380px",
            height: "100vh", // Chiều cao cố định bằng màn hình
            display: "flex",
            flexDirection: "column", // Sắp xếp theo chiều dọc
            background: "white",
            boxShadow: "-2px 0 10px rgba(0,0,0,0.1)",
            boxSizing: "border-box"
        }}>

            {/* 1. HEADER (Cố định phía trên) */}
            <div style={{
                padding: "20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #eee"
            }}>
                <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 700 }}>
                    Your Shopping Cart (1)
                </h3>
                <button style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#6b7280" }}>
                    ✖
                </button>
            </div>

            {/* 2. BODY (Khu vực danh sách sản phẩm - Có thanh cuộn) */}
            <div style={{
                flex: 1,           // Chiếm toàn bộ không gian ở giữa
                overflowY: "auto", // Tự động xuất hiện thanh cuộn dọc nếu nhiều sản phẩm
                padding: "20px"
            }}>
                {/* Một item sản phẩm */}
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px"
                }}>
                    <div>
                        <h4 style={{ margin: "0 0 4px 0", fontSize: "14px", color: "#111827" }}>
                            Compact Travel Luggage Tag
                        </h4>
                        <span style={{ color: "#10b981", fontWeight: 600, fontSize: "14px" }}>
                            $3.19
                        </span>
                    </div>

                    {/* Bộ tăng giảm số lượng & Xóa */}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ display: "flex", alignItems: "center", border: "1px solid #d1d5db", borderRadius: "6px" }}>
                            {/* Nút Giảm (-) */}
                            <button style={quantityBtnStyle}>−</button>

                            {/* Số lượng hiển thị */}
                            <span style={{ padding: "0 10px", fontSize: "14px", fontWeight: 600 }}>1</span>

                            {/* Nút Tăng (+) */}
                            <button style={quantityBtnStyle}>+</button>
                        </div>

                        {/* Nút Xóa (Thùng rác màu đỏ) */}
                        <button style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "16px" }}>
                            🗑️
                        </button>
                    </div>
                </div>
            </div>

            {/* 3. FOOTER (Cố định phía dưới - Luôn nhìn thấy nút mua) */}
            <div style={{
                padding: "20px",
                borderTop: "1px solid #eee",
                background: "#ffffff"
            }}>
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "15px"
                }}>
                    <span style={{ fontSize: "16px", fontWeight: 700, color: "#111827" }}>Total:</span>
                    <span style={{ fontSize: "20px", fontWeight: 700, color: "#10b981" }}>$3.19</span>
                </div>

                {/* NÚT MUA HÀNG ĐÃ ĐƯỢC ĐẨY LÊN VỊ TRÍ RÕ RÀNG */}
                <button style={{
                    width: "100%",
                    padding: "14px",
                    background: "#4f46e5", // Màu xanh tím đồng bộ hệ thống
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "16px",
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: "0 4px 6px -1px rgba(79, 70, 229, 0.2)"
                }}>
                    🛒 Checkout & Pay
                </button>
            </div>

        </div>
    );
}

// Style dùng chung cho nút + và -
const quantityBtnStyle = {
    width: "28px",
    height: "28px",
    background: "#f3f4f6",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#374151",
    transition: "background 0.2s",
    outline: "none"
};