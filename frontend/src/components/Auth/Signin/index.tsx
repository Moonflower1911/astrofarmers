"use client";
import Link from "next/link";
import React from "react";
import { useRouter } from "next/navigation";
import SigninWithPassword from "../SigninWithPassword";

export default function Signin() {
    const router = useRouter();

    return (
        <>
            <div className="mb-4.5">
                <button
                    type="button"
                    onClick={() => router.push("/")}
                    className="flex w-full items-center justify-center gap-3.5 rounded-lg border border-stroke bg-gray-2 p-[15px] font-medium hover:bg-opacity-50 dark:border-dark-3 dark:bg-dark-2 dark:hover:bg-opacity-50"
                >
                    Go Home
                </button>
            </div>

            <div className="my-6 flex items-center justify-center">

                <span className="block h-px w-full bg-stroke dark:bg-dark-3"></span>

                <span className="block h-px w-full bg-stroke dark:bg-dark-3"></span>
            </div>


            <div>
                <SigninWithPassword/>
            </div>

            <div className="mt-6 text-center">
                <p>
                    Don’t have any account?{" "}
                    <Link href="/auth/signup" className="text-primary">
                        Sign Up
                    </Link>
                </p>
            </div>
        </>
    );
}
