"use client";
import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

const menuGroup1 = [
    {
        name: "User MENU",
        menuItems: [
            {
                icon: (
                    <svg
                        className="h-6 w-6 text-gray-800 dark:text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 5V3m0 18v-2M7.05 7.05 5.636 5.636m12.728 12.728L16.95 16.95M5 12H3m18 0h-2M7.05 16.95l-1.414 1.414M18.364 5.636 16.95 7.05M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
                        />
                    </svg>
                ),
                label: "Weather",
                route: "http://localhost:3001/role/user/weather",
            },
            {
                icon: (
                    <svg
                        className="h-6 w-6 text-gray-800 dark:text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm0 0v6M9.5 9A2.5 2.5 0 0 1 12 6.5"
                        />
                    </svg>
                ),
                label: "Land",
                route: "/role/user/land",
            },
            {
                icon: (
                    <svg
                        className="fill-current"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M12 1.25C9.38 1.25 7.25 3.38 7.25 6s2.13 4.75 4.75 4.75 4.75-2.13 4.75-4.75S14.62 1.25 12 1.25Zm0 8a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm0 3c-2.31 0-4.44.52-6 1.4-1.56.88-2.75 2.2-2.75 3.85v.1c0 1.15 0 2.6 1.2 3.6 1.2 1 3.2 1.3 7.55 1.3s6.35-.3 7.55-1.3c1.2-1 1.2-2.45 1.2-3.6v-.1c0-1.65-1.19-2.97-2.75-3.85-1.56-.88-3.69-1.4-6-1.4Zm-7.25 5.5c0-.85.62-1.7 1.95-2.45 1.3-.73 3.15-1.3 5.3-1.3s4 .57 5.3 1.3c1.33.75 1.95 1.6 1.95 2.45 0 .95 0 1.8-.9 2.5-.55.45-1.37.8-3.27 1.15C14.27 21.67 13 21.75 12 21.75s-2.27-.08-3.08-.23c-1.9-.35-2.72-.7-3.27-1.15-.9-.7-.9-1.55-.9-2.5Z"
                            fill=""
                        />
                    </svg>
                ),
                label: "Profile",
                route: "/role/user/profile",
            },
            {
                icon: (
                    <svg
                        className="fill-current"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M14.254 1.365c-1.096-.306-2.123.025-2.852.696-.718.66-1.153 1.647-1.153 2.702v6.694c0 1.268 1.028 2.295 2.295 2.295h6.695c1.055 0 2.041-.435 2.702-1.153.67-.73 1.002-1.757.696-2.853-1.133-4.055-4.326-7.248-8.39-8.38Zm-2.504 3.396c0-.651.27-1.231.667-1.596.386-.355.886-.508 1.434-.355 3.55.991 6.348 3.79 7.34 7.34.152.547 0 1.047-.355 1.433-.365.397-.945.667-1.596.667H12.545a.795.795 0 0 1-.795-.795V4.76Z"
                            fill=""
                        />
                        <path
                            d="M8.672 4.716c.396-.124.615-.545.492-.94a.75.75 0 0 0-.94-.491C4.183 4.554 1.25 8.328 1.25 12.79c0 5.5 4.46 9.96 9.961 9.96 4.46 0 8.235-2.932 9.503-6.972.124-.396-.096-.817-.491-.941a.75.75 0 0 0-.941.492c-1.078 3.433-4.286 5.922-8.073 5.922-4.672 0-8.46-3.788-8.46-8.46 0-3.788 2.489-6.996 5.923-8.074Z"
                            fill=""
                        />
                    </svg>
                ),
                label: "Land Soil Dashboard",
                route: "http://localhost:3000/role/user/irrigation",
            },
        ],
    },
];

export default function UserLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                menuGroup={menuGroup1}
            />
            <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <main>
                    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
