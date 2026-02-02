import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { RefreshCcw, DollarSign } from 'lucide-react';

const PaymentHistory = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/payments', {
                headers: { 'x-auth-token': token }
            });
            setPayments(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleRefund = async (id) => {
        if (!window.confirm("Are you sure you want to refund this transaction?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/payments/refund/${id}`, {}, {
                headers: { 'x-auth-token': token }
            });
            fetchPayments();
            alert("Refund processed successfully");
        } catch (err) {
            console.error(err);
            alert("Refund failed");
        }
    };

    return (
        <div className="p-6 min-h-screen bg-gray-900 text-gray-100">
            <h1 className="text-3xl font-bold mb-2">Payment History</h1>
            <p className="text-gray-400 mb-8">View and manage all transactions</p>

            <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-900/50 border-b border-gray-700 text-gray-400 text-sm">
                            <th className="p-4">Transaction ID</th>
                            <th className="p-4">Amount</th>
                            <th className="p-4">Method</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Date</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {loading ? (
                            <tr><td colSpan="6" className="p-8 text-center text-gray-400">Loading payments...</td></tr>
                        ) : payments.length === 0 ? (
                            <tr><td colSpan="6" className="p-8 text-center text-gray-400">No transactions recorded</td></tr>
                        ) : (
                            payments.map(payment => (
                                <motion.tr
                                    key={payment._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="hover:bg-gray-700/30 transition-colors"
                                >
                                    <td className="p-4 font-mono text-sm text-gray-300">
                                        {payment.transactionId || 'N/A'}
                                        <div className="text-xs text-gray-500 mt-0.5">Ref: {payment.booking?._id || 'Unknown Booking'}</div>
                                    </td>
                                    <td className="p-4 font-bold text-white">${payment.amount}</td>
                                    <td className="p-4 text-sm text-gray-300">{payment.paymentMethod}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${payment.status === 'COMPLETED' ? 'bg-green-900/30 text-green-400' :
                                                payment.status === 'REFUNDED' ? 'bg-yellow-900/30 text-yellow-400' :
                                                    'bg-red-900/30 text-red-400'
                                            }`}>
                                            {payment.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-400">
                                        {new Date(payment.transactionDate).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-right">
                                        {payment.status === 'COMPLETED' && (
                                            <button
                                                onClick={() => handleRefund(payment._id)}
                                                className="text-yellow-400 hover:text-yellow-300 text-sm underline"
                                            >
                                                Refund
                                            </button>
                                        )}
                                    </td>
                                </motion.tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PaymentHistory;
