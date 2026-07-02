import React from "react";

export default function UserRiskDetail() {
    return (
        <div style={{ padding: 20 }}>
            <h1>👤 User Risk Detail</h1>

            <p>Risk Score: ...</p>
            <p>Fraud Rate: ...</p>
            <p>Fraud Count: ...</p>

            <h3>📈 Risk Timeline</h3>
            <div style={{ height: 250, border: "1px solid gray" }}>
                Chart here
            </div>

            <h3>⚠ Fraud Indicators</h3>
            <ul>
                <li>Unusual transaction pattern</li>
                <li>High frequency purchases</li>
                <li>Large amount spike</li>
            </ul>
        </div>
    );
}