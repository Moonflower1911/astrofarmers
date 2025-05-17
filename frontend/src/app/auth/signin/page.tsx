import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import Signin from "@/components/Auth/Signin";

export const metadata: Metadata = {
  title: "GovernX Login Page ",
  description: "",
};

const SignIn: React.FC = () => {
  return (
    <div className="m-16 mx-40 my-6 h-35 w-3/4 rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card ">
      <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="flex flex-wrap items-center">
          <div className="w-full xl:w-1/2">
            <div className="w-full p-4 sm:p-12.5 xl:p-15">
              <Signin />
            </div>
          </div>

            <div className="hidden w-full p-7.5 xl:block xl:w-1/2">
                <div
                    className="overflow-hidden rounded-2xl px-12.5 pt-12.5 bg-cover bg-center relative dark:!bg-dark-2"
                    style={{
                        backgroundImage: "url('/images/bg/landing-bg2.jpg')",
                    }}
                >
                    {/* Overlay to darken background image */}
                    <div className="absolute inset-0 bg-black/50 rounded-2xl z-0" />

                    {/* Content over the overlay */}
                    <div className="relative z-10">
                        <Link className="mb-10 inline-block" href="http://localhost:3000/">
                            <div className="flex items-center gap-3">
                                {/* Logo Images */}
                                <Image
                                    className="hidden dark:block"
                                    src={"/images/logo/logo-light.svg"}
                                    alt="Logo"
                                    width={80}
                                    height={80}
                                />
                                <Image
                                    className="dark:hidden"
                                    src={"/images/logo/logo-dark.svg"}
                                    alt="Logo"
                                    width={80}
                                    height={80}
                                />
                                {/* Text beside logo */}
                                <span className="text-2xl font-bold text-white">AstroFarmers</span>
                            </div>
                        </Link>

                        <p className="mb-3 text-xl font-medium text-white">
                            Sign in to your account
                        </p>

                        <h1 className="mb-4 text-2xl font-bold text-white sm:text-heading-3">
                            Welcome Back!
                        </h1>

                        <p className="w-full max-w-[375px] font-medium text-white/80">
                            Please sign in to your account by completing the necessary fields below
                        </p>

                        <div className="mt-15">
                            <Image
                                src={"/images/grids/grid-02.svg"}
                                alt="Grid"
                                width={405}
                                height={250}
                                className="mx-auto dark:opacity-30"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </div>
    </div>
  );
};

export default SignIn;
