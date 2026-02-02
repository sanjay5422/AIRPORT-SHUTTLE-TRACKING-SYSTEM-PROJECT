import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, XCircle, FileText, AlertTriangle } from 'lucide-react';

const DriverVerification = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [docs, setDocs] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        const fetchDocs = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`http://localhost:5000/api/documents/user/${userId}`, {
                    headers: { 'x-auth-token': token }
                });
                setDocs(res.data);
                if (res.data.verificationNotes) setNotes(res.data.verificationNotes);
            } catch (err) {
                console.error("No docs found or error", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDocs();
    }, [userId]);

    const handleVerify = async (status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/documents/${docs._id}/verify`,
                { status, verificationNotes: notes },
                { headers: { 'x-auth-token': token } }
            );
            alert(`Driver ${status === 'VERIFIED' ? 'Verified' : 'Rejected'} Successfully`);
            navigate('/admin/users');
        } catch (err) {
            console.error(err);
            alert('Action failed');
        }
    };

    if (loading) return <div className="text-white text-center p-10">Loading documents...</div>;

    if (!docs) return (
        <div className="text-white text-center p-10">
            <h2 className="text-2xl font-bold mb-4">No Documents Found</h2>
            <p className="text-gray-400 mb-6">This driver has not uploaded any verification documents yet.</p>
            <button onClick={() => navigate('/admin/users')} className="text-blue-400 hover:underline">Back to Users</button>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-900 p-6 text-gray-100">
            <div className="max-w-4xl mx-auto space-y-6">
                <button
                    onClick={() => navigate('/admin/users')}
                    className="flex items-center text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Users
                </button>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Driver Verification</h1>
                        <p className="text-gray-400">Review submitted documents</p>
                    </div>
                    <div className={`px-4 py-2 rounded-full font-bold uppercase tracking-wider ${docs.status === 'VERIFIED' ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-800' :
                            docs.status === 'REJECTED' ? 'bg-red-900/50 text-red-400 border border-red-800' :
                                'bg-yellow-900/50 text-yellow-400 border border-yellow-800'
                        }`}>
                        {docs.status}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* License Section */}
                    <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <FileText className="w-5 h-5 mr-2 text-blue-400" />
                            Driving License
                        </h3>
                        <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden mb-4 border border-gray-700">
                            {/* Placeholder for image - assume URL works or show alt */}
                            <img src={docs.licenseImage} alt="License" className="w-full h-full object-cover" />
                        </div>
                        <p className="text-sm text-gray-400">License Number</p>
                        <p className="font-mono text-lg">{docs.licenseNumber}</p>
                    </div>

                    {/* ID Proof Section */}
                    <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <FileText className="w-5 h-5 mr-2 text-purple-400" />
                            ID Proof ({docs.idProofType})
                        </h3>
                        <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden mb-4 border border-gray-700">
                            <img src={docs.idProofImage} alt="ID Proof" className="w-full h-full object-cover" />
                        </div>
                        <p className="text-sm text-gray-400">ID Number</p>
                        <p className="font-mono text-lg">{docs.idProofNumber}</p>
                    </div>

                    {/* Vehicle RC Section */}
                    <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 md:col-span-2">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <FileText className="w-5 h-5 mr-2 text-orange-400" />
                            Vehicle RC
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
                                <img src={docs.vehicleRcImage} alt="Vehicle RC" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 mb-1">RC Number</p>
                                <p className="font-mono text-lg mb-4">{docs.vehicleRcNumber}</p>
                                <div className="bg-blue-900/20 p-4 rounded-xl border border-blue-900/50">
                                    <h4 className="flex items-center text-blue-400 font-semibold mb-2">
                                        <AlertTriangle className="w-4 h-4 mr-2" />
                                        Verification Checklist
                                    </h4>
                                    <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                                        <li>Verify name matches ID proof</li>
                                        <li>Check expiration dates</li>
                                        <li>Ensure images are clear and readable</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                    <h3 className="text-lg font-semibold mb-4">Admin Decision</h3>
                    <textarea
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-white resize-none h-32 mb-6 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Add notes about approval or rejection reason..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    ></textarea>

                    <div className="flex gap-4 justify-end">
                        <button
                            onClick={() => handleVerify('REJECTED')}
                            className="px-6 py-3 rounded-xl bg-red-600/20 text-red-400 font-semibold border border-red-900/50 hover:bg-red-600/30 transition-colors flex items-center"
                        >
                            <XCircle className="w-5 h-5 mr-2" />
                            Reject Documents
                        </button>
                        <button
                            onClick={() => handleVerify('VERIFIED')}
                            className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-colors flex items-center"
                        >
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Verify & Approve
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DriverVerification;
