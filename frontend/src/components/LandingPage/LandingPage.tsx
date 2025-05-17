'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function LandingPage() {
    useEffect(() => {
        document.documentElement.style.scrollBehavior = 'smooth';
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-green-50">
            {/* 🌿 Navbar */}
            <nav className="fixed w-full bg-white shadow-sm z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex-shrink-0 flex items-center">
                            <span className="text-2xl font-bold text-green-600">AstroFarmers</span>
                        </div>

                        <div className="hidden md:block">
                            <div className="ml-10 flex items-center space-x-8">
                                <a href="#about" className="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium transition-colors duration-200">About</a>
                                <a href="#features" className="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium transition-colors duration-200">Features</a>
                                <a href="#contact" className="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium transition-colors duration-200">Contact</a>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <Link href="/auth/signin">
                                <button className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 transition-colors duration-200">
                                    Log In
                                </button>
                            </Link>
                            <Link href="/auth/signup">
                                <button className="px-4 py-2 bg-green-600 text-sm font-medium rounded-md text-white hover:bg-green-700 transition-colors duration-200 shadow-sm">
                                    Sign Up
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* 🚀 Hero Section */}
            <section id="about" className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-600 to-green-800 text-white">
                <div className="max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl mb-6">
                            We partner with you in the digitalization of agriculture
                        </h1>
                        <p className="max-w-3xl mx-auto text-xl text-green-100">
                            Digital transformation of your farming operations is a real necessity to stay relevant
                        </p>
                        <div className="mt-10">
                            <a
                                href="#contact"
                                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-green-700 bg-white hover:bg-green-50 transition-colors duration-200"
                            >
                                Contact Us
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* 🌟 Features Section */}
            <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                            Platform Features
                        </h2>
                        <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
                            Harnessing space technology for smarter agriculture
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        <FeatureCard
                            title="📡 Real-Time Weather"
                            desc="Get accurate forecasts from satellites with 95% accuracy."
                            icon={
                                <svg className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            }
                        />
                        <FeatureCard
                            title="🛰️ Crop Monitoring"
                            desc="Track crop health with NDVI and high-resolution imagery."
                            icon={
                                <svg className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                </svg>
                            }
                        />
                        <FeatureCard
                            title="🌱 Soil Moisture"
                            desc="Analyze field hydration from orbit with precision sensors."
                            icon={
                                <svg className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                                </svg>
                            }
                        />
                        <FeatureCard
                            title="📊 Smart AI Insights"
                            desc="Predict yields and receive personalized farming advice."
                            icon={
                                <svg className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                </svg>
                            }
                        />
                    </div>
                </div>
            </section>

            {/* 📫 Contact Section */}
            <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                            Contact Us
                        </h2>
                        <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
                            Get in touch with our team of agricultural technology experts
                        </p>
                    </div>

                    <div className="bg-white shadow-xl rounded-lg p-8 max-w-3xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">Email</h3>
                                <p className="mt-2 text-lg text-gray-500">
                                    <a href="mailto:contact@astrofarmers.io" className="text-green-600 hover:text-green-700">
                                        contact@astrofarmers.io
                                    </a>
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">Phone</h3>
                                <p className="mt-2 text-lg text-gray-500">
                                    <a href="tel:+212600000000" className="text-green-600 hover:text-green-700">
                                        +212 6 00 00 00 00
                                    </a>
                                </p>
                            </div>
                        </div>

                        <div className="mt-12">
                            <form className="space-y-6">
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                                        Message
                                    </label>
                                    <textarea
                                        id="message"
                                        rows={4}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                    ></textarea>
                                </div>
                                <div>
                                    <button
                                        type="submit"
                                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                    >
                                        Send Message
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-800 text-white py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="mb-4 md:mb-0">
                            <span className="text-xl font-bold text-green-400">AstroFarmers</span>
                            <p className="mt-2 text-sm text-gray-300">
                                Space-based agricultural intelligence for Earth
                            </p>
                        </div>
                        <div className="flex space-x-6">
                            <a href="#" className="text-gray-300 hover:text-white">
                                <span className="sr-only">Facebook</span>
                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                                </svg>
                            </a>
                            <a href="#" className="text-gray-300 hover:text-white">
                                <span className="sr-only">Twitter</span>
                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                </svg>
                            </a>
                            <a href="#" className="text-gray-300 hover:text-white">
                                <span className="sr-only">LinkedIn</span>
                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                </svg>
                            </a>
                        </div>
                    </div>
                    <div className="mt-8 border-t border-gray-700 pt-8 md:flex md:items-center md:justify-between">
                        <p className="text-base text-gray-400 text-center md:text-left">
                            &copy; {new Date().getFullYear()} AstroFarmers. All rights reserved.
                        </p>
                        <div className="mt-4 md:mt-0 flex justify-center md:justify-end space-x-6">
                            <a href="#" className="text-gray-400 hover:text-gray-300 text-sm">Privacy Policy</a>
                            <a href="#" className="text-gray-400 hover:text-gray-300 text-sm">Terms of Service</a>
                            <a href="#" className="text-gray-400 hover:text-gray-300 text-sm">Careers</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ title, desc, icon }: { title: string, desc: string, icon: React.ReactNode }) {
    return (
        <div className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex justify-center mb-4">
                {icon}
            </div>
            <h3 className="text-lg font-medium text-gray-900 text-center mb-2">{title}</h3>
            <p className="text-gray-500 text-center">{desc}</p>
        </div>
    );
}