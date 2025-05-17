'use client';

import { useState } from "react";
import AddLandForm from "@/components/Land/AddLandForm";
import DefaultLayout from "@/components/Layouts/UserLayout";
import LandList from "@/components/Land/LandList";

export default function AddLandPage() {
    const [view, setView] = useState<"add" | "see">("add");

    return (
        <DefaultLayout>
            <div style={{ padding: "2rem" }}>
                <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", justifyContent: "center" }}>
                    <button
                        onClick={() => setView("add")}
                        style={{
                            padding: "0.75rem 1.5rem",
                            backgroundColor: view === "add" ? "#4CAF50" : "#ccc",
                            color: "#fff",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                            fontWeight: "bold"
                        }}
                    >
                        ➕ Add Land
                    </button>

                    <button
                        onClick={() => setView("see")}
                        style={{
                            padding: "0.75rem 1.5rem",
                            backgroundColor: view === "see" ? "#4CAF50" : "#ccc",
                            color: "#fff",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                            fontWeight: "bold"
                        }}
                    >
                        👀 See Lands
                    </button>
                </div>

                {view === "add" ? (
                    <AddLandForm />
                ) : (
                    <div style={{ textAlign: "center", marginTop: "2rem", fontSize: "1.2rem" }}>
                        <LandList />
                    </div>
                )}
            </div>
        </DefaultLayout>
    );
}
