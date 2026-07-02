import { useEffect, useState } from "react";
import { adminApi } from "../../../api/adminApi";

type TopUserResponse = {
    userId: number;
    fullName: string;
    fraudCount: number;
    riskScore: number;
};

export default function UserRiskRanking() {

    const [users, setUsers] = useState<TopUserResponse[]>([]);

    useEffect(() => {
        adminApi.getTopUsers()
            .then(res => setUsers(res.data));
    }, []);

    return (
        <div style={{ padding: 20 }}>

            <h1>👤 User Risk Ranking</h1>

            <table border={1} cellPadding={10}>

                <thead>
                    <tr>
                        <th>User ID</th>
                        <th>Full Name</th>
                        <th>Fraud Count</th>
                        <th>Risk Score</th>
                    </tr>
                </thead>

                <tbody>

                    {users.map(user => (

                        <tr key={user.userId}>

                            <td>{user.userId}</td>

                            <td>{user.fullName}</td>

                            <td>{user.fraudCount}</td>

                            {/* FIX: format number */}
                            <td>{user.riskScore?.toFixed(2)}</td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>
    );
}