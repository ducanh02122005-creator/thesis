import { useNavigate } from "react-router-dom";

export default function AuthRedirectButtons() {
    const navigate = useNavigate();

    return (
        <div style={{
            display: "flex",
            gap: 10,
            marginTop: 20,
            flexDirection: "column"
        }}>

            <button
                onClick={() => navigate("/login")}
                style={btnStyle("#111827")}
            >
                🔐 Login
            </button>

            <button
                onClick={() => navigate("/register")}
                style={btnStyle("#3b82f6")}
            >
                👤 Register Customer
            </button>

            <button
                onClick={() => navigate("/register?role=ADMIN")}
                style={btnStyle("#ef4444")}
            >
                🛡 Register Admin
            </button>

        </div>
    );
}

const btnStyle = (color: string) => ({
    width: "100%",
    padding: "10px",
    borderRadius: 10,
    border: "none",
    background: color,
    color: "white",
    cursor: "pointer",
    fontWeight: "bold"
});