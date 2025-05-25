'use client';

import { useEffect, useState } from 'react';

interface User {
    userId: number;
    username: string;
    email: string;
}

export default function UserProfileForm() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const userId = localStorage.getItem("idUtilisateur");
            const token = localStorage.getItem("token");

            if (!userId || !token) {
                setMessage("❌ You must be logged in to view your profile.");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`/api/users/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setUser(data);
                } else {
                    setMessage("❌ Failed to load user information.");
                }
            } catch (error) {
                setMessage("❌ Error fetching user info.");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const handleUpdate = async () => {
        const token = localStorage.getItem("token");

        if (!user || !token) return;

        try {
            const response = await fetch(`/api/users/${user.userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    username: user.username,
                    email: user.email, // still required by the backend
                }),
            });

            if (response.ok) {
                setMessage("✅ Profile updated successfully!");
            } else {
                setMessage("❌ Failed to update profile.");
            }
        } catch (error) {
            setMessage("❌ Error during update.");
        }
    };

    if (loading) return <p>Loading...</p>;
    if (!user) return <p>{message}</p>;

    return (
        <div style={{ maxWidth: '500px', margin: '0 auto', padding: '2rem' }}>
            <h2 style={{ textAlign: 'center' }}>User Profile</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <label>
                    Username:
                    <input
                        type="text"
                        value={user.username}
                        onChange={(e) => setUser({ ...user, username: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '5px', border: '1px solid #ccc' }}
                    />
                </label>

                <label>
                    Email:
                    <input
                        type="email"
                        value={user.email}
                        disabled
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '5px', border: '1px solid #ccc', backgroundColor: '#f0f0f0' }}
                    />
                </label>

                <button
                    onClick={handleUpdate}
                    style={{
                        padding: '0.75rem',
                        border: 'none',
                        borderRadius: '5px',
                        backgroundColor: '#4CAF50',
                        color: '#fff',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                    }}
                >
                    Update Profile
                </button>

                {message && <p style={{ fontWeight: 'bold', color: message.startsWith("✅") ? "green" : "red" }}>{message}</p>}
            </div>
        </div>
    );
}
