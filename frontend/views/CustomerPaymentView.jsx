import React, { useState, useEffect } from 'react';
import { Translate } from '../hooks/useTranslation.jsx';

const CustomerPaymentView = () => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                        Customer Payment Dashboard
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Track payment status, discipline score, and request discounts
                    </p>
                </div>

                {/* Test Card */}
                <div className="bg-white dark:bg-surface-dark rounded-xl shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                        Payment Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                            <div className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-2">
                                Total Unpaid
                            </div>
                            <div className="text-3xl font-black text-slate-900 dark:text-white">
                                ₹25,000
                            </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                            <div className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-2">
                                Unpaid Packages
                            </div>
                            <div className="text-3xl font-black text-slate-900 dark:text-white">
                                3
                            </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                            <div className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-2">
                                Days Left
                            </div>
                            <div className="text-3xl font-black text-slate-900 dark:text-white">
                                145
                            </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                            <div className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-2">
                                Payment Score
                            </div>
                            <div className="text-3xl font-black text-green-500">
                                85/100
                            </div>
                        </div>
                    </div>
                </div>

                {/* Unpaid Packages Table */}
                <div className="bg-white dark:bg-surface-dark rounded-xl shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4">
                        Unpaid Packages
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-700">
                                    <th className="text-left py-3 px-4 text-sm font-bold text-slate-700 dark:text-slate-300">Invoice No</th>
                                    <th className="text-left py-3 px-4 text-sm font-bold text-slate-700 dark:text-slate-300">Invoice Date</th>
                                    <th className="text-right py-3 px-4 text-sm font-bold text-slate-700 dark:text-slate-300">Amount Due</th>
                                    <th className="text-center py-3 px-4 text-sm font-bold text-slate-700 dark:text-slate-300">Days Left</th>
                                    <th className="text-center py-3 px-4 text-sm font-bold text-slate-700 dark:text-slate-300">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
                                    <td className="py-3 px-4 text-sm text-slate-900 dark:text-white font-mono">INV-001</td>
                                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">2025-11-15</td>
                                    <td className="py-3 px-4 text-sm text-slate-900 dark:text-white text-right font-bold">₹10,000</td>
                                    <td className="py-3 px-4 text-center">
                                        <span className="text-lg font-black text-slate-900 dark:text-white">145</span>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                            Active
                                        </span>
                                    </td>
                                </tr>
                                <tr className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
                                    <td className="py-3 px-4 text-sm text-slate-900 dark:text-white font-mono">INV-002</td>
                                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">2025-12-01</td>
                                    <td className="py-3 px-4 text-sm text-slate-900 dark:text-white text-right font-bold">₹8,500</td>
                                    <td className="py-3 px-4 text-center">
                                        <span className="text-lg font-black text-slate-900 dark:text-white">129</span>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                            Active
                                        </span>
                                    </td>
                                </tr>
                                <tr className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
                                    <td className="py-3 px-4 text-sm text-slate-900 dark:text-white font-mono">INV-003</td>
                                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">2025-12-20</td>
                                    <td className="py-3 px-4 text-sm text-slate-900 dark:text-white text-right font-bold">₹6,500</td>
                                    <td className="py-3 px-4 text-center">
                                        <span className="text-lg font-black text-slate-900 dark:text-white">110</span>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                            Active
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Two Column Layout for Requests */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Discount Request Section */}
                    <div className="bg-white dark:bg-surface-dark rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4">
                            Request Discount
                        </h2>
                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    Requested Amount (₹)
                                </label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="Enter amount"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    Reason for Discount
                                </label>
                                <textarea
                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                    rows="4"
                                    placeholder="Explain why you need a discount"
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                className="w-full px-6 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg transition-colors"
                            >
                                Submit Discount Request
                            </button>
                        </form>
                    </div>

                    {/* Due Date Extension Request Section */}
                    <div className="bg-white dark:bg-surface-dark rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4">
                            Request Due Date Extension
                        </h2>
                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    Select Invoice
                                </label>
                                <select
                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                    <option value="">Select an invoice...</option>
                                    <option value="INV-001">INV-001 - ₹10,000 (145 days left)</option>
                                    <option value="INV-002">INV-002 - ₹8,500 (129 days left)</option>
                                    <option value="INV-003">INV-003 - ₹6,500 (110 days left)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    Additional Days Requested
                                </label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="Enter number of days (max 90)"
                                    min="1"
                                    max="90"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    Reason for Extension
                                </label>
                                <textarea
                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                    rows="4"
                                    placeholder="Explain why you need more time to pay"
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
                            >
                                Submit Extension Request
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerPaymentView;
