"use client";
import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

const menuGroup1 = [
  {
    name: "Your Astro Farmer Menu",
    menuItems: [
      {
        icon: (
          <svg
            className="h-6 w-6 text-gray-800 dark:text-white"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 5V3m0 18v-2M7.05 7.05 5.636 5.636m12.728 12.728L16.95 16.95M5 12H3m18 0h-2M7.05 16.95l-1.414 1.414M18.364 5.636 16.95 7.05M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
            />
          </svg>
        ),
        label: "Weather",
        route: "http://localhost:3000/role/user/weather",
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
                  aria-hidden="true"
              >
                  {/* Bottom layer */}
                  <rect x="2" y="14" width="20" height="6" stroke="currentColor" strokeWidth="2" fill="none" rx="1" />
                  {/* Middle layer */}
                  <rect x="4" y="10" width="16" height="4" stroke="currentColor" strokeWidth="2" fill="none" rx="1" />
                  {/* Top layer */}
                  <rect x="6" y="6" width="12" height="4" stroke="currentColor" strokeWidth="2" fill="none" rx="1" />
              </svg>
          ),
          label: "Soil Info",
        route: "http://localhost:3000/role/user/irrigation",
      },
        {
            icon: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    {/* Calendar outline */}
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    {/* Calendar header */}
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    {/* Horizontal line under header */}
                    <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
            ),


            label: "Scheduling Irrigation",
            route: "http://localhost:3000/role/user/schedule",
        },      {
            icon: (
                <svg
                    className="h-6 w-6 text-gray-800 dark:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm0 0v6M9.5 9A2.5 2.5 0 0 1 12 6.5"
                    />
                </svg>
            ),
            label: "Land",
            route: "/role/user/land",
        },{
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
                        d="M11.9999 1.25C9.37654 1.25 7.24989 3.37665 7.24989 6C7.24989 8.62335 9.37654 10.75 11.9999 10.75C14.6232 10.75 16.7499 8.62335 16.7499 6C16.7499 3.37665 14.6232 1.25 11.9999 1.25ZM8.74989 6C8.74989 4.20507 10.205 2.75 11.9999 2.75C13.7948 2.75 15.2499 4.20507 15.2499 6C15.2499 7.79493 13.7948 9.25 11.9999 9.25C10.205 9.25 8.74989 7.79493 8.74989 6Z"
                        fill=""
                    />
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M11.9999 12.25C9.68634 12.25 7.55481 12.7759 5.97534 13.6643C4.41937 14.5396 3.24989 15.8661 3.24989 17.5L3.24982 17.602C3.24869 18.7638 3.24728 20.222 4.5263 21.2635C5.15577 21.7761 6.03637 22.1406 7.2261 22.3815C8.41915 22.6229 9.97412 22.75 11.9999 22.75C14.0257 22.75 15.5806 22.6229 16.7737 22.3815C17.9634 22.1406 18.844 21.7761 19.4735 21.2635C20.7525 20.222 20.7511 18.7638 20.75 17.602L20.7499 17.5C20.7499 15.8661 19.5804 14.5396 18.0244 13.6643C16.445 12.7759 14.3134 12.25 11.9999 12.25ZM4.74989 17.5C4.74989 16.6487 5.37127 15.7251 6.71073 14.9717C8.02669 14.2315 9.89516 13.75 11.9999 13.75C14.1046 13.75 15.9731 14.2315 17.289 14.9717C18.6285 15.7251 19.2499 16.6487 19.2499 17.5C19.2499 18.8078 19.2096 19.544 18.5263 20.1004C18.1558 20.4022 17.5364 20.6967 16.4761 20.9113C15.4192 21.1252 13.9741 21.25 11.9999 21.25C10.0257 21.25 8.58063 21.1252 7.52368 20.9113C6.46341 20.6967 5.84401 20.4022 5.47348 20.1004C4.79021 19.544 4.74989 18.8078 4.74989 17.5Z"
                        fill=""
                    />
                </svg>
            ),
            label: "Profile",
            route: "/role/user/profile",
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
