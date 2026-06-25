import React, { useState } from 'react';
import { User, FileText, Globe, CheckCircle, ChevronRight, Save } from 'lucide-react';
import { TouristAPI, PassportAPI } from '../api/tourist.api';
import { VisaAPI } from '../api/visa.api';
import Swal from 'sweetalert2';

const RegistrationWizard: React.FC = () => {
    const [step, setStep] = useState<number>(1);
    const [loading, setLoading] = useState(false);

    // State to hold IDs generated during the wizard
    const [touristId, setTouristId] = useState<number | null>(null);
    const [passportId, setPassportId] = useState<number | null>(null);

    // Forms
    const [touristForm, setTouristForm] = useState({ firstName: '', lastName: '', nationality: '', dateOfBirth: '', gender: 'Male' });
    const [passportForm, setPassportForm] = useState({ passportNumber: '', issueDate: '', expiryDate: '' });
    const [visaForm, setVisaForm] = useState({ visaId: '', visaType: 'Tourist', issueDate: '', expiryDate: '', status: 'Active' });

    const handleTouristSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const newTourist = await TouristAPI.registerTourist(touristForm);
            setTouristId(newTourist.touristId);
            setStep(2);
            Swal.fire({
                toast: true, position: 'top-end', icon: 'success', title: 'Tourist Created', showConfirmButton: false, timer: 3000, background: '#0f172a', color: '#fff'
            });
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to create tourist', background: '#0f172a', color: '#fff', confirmButtonColor: '#ef4444' });
        } finally {
            setLoading(false);
        }
    };

    const handlePassportSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!touristId) return;
        setLoading(true);
        try {
            const newPassport = await PassportAPI.createPassport(touristId, passportForm);
            setPassportId(newPassport.passportId);
            setStep(3);
            Swal.fire({
                toast: true, position: 'top-end', icon: 'success', title: 'Passport Assigned', showConfirmButton: false, timer: 3000, background: '#0f172a', color: '#fff'
            });
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to create passport', background: '#0f172a', color: '#fff', confirmButtonColor: '#ef4444' });
        } finally {
            setLoading(false);
        }
    };

    const handleVisaSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!passportId) return;
        setLoading(true);
        try {
            await VisaAPI.createVisa({
                ...visaForm,
                visaId: Number(visaForm.visaId),
                passportId: passportId
            });
            setStep(4); // Finished
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to issue visa', background: '#0f172a', color: '#fff', confirmButtonColor: '#ef4444' });
        } finally {
            setLoading(false);
        }
    };

    const resetWizard = () => {
        setStep(1);
        setTouristId(null);
        setPassportId(null);
        setTouristForm({ firstName: '', lastName: '', nationality: '', dateOfBirth: '', gender: 'Male' });
        setPassportForm({ passportNumber: '', issueDate: '', expiryDate: '' });
        setVisaForm({ visaId: '', visaType: 'Tourist', issueDate: '', expiryDate: '', status: 'Active' });
    };

    return (
        <div className="space-y-8 w-full max-w-4xl mx-auto">
            {/* Progress Bar */}
            <div className="glass-panel p-6 rounded-2xl">
                <div className="flex items-center justify-between">
                    <div className={`flex flex-col items-center gap-2 ${step >= 1 ? 'text-indigo-400' : 'text-slate-500'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-indigo-400 bg-indigo-400/20' : 'border-slate-600 bg-slate-800'}`}>
                            <User size={20} />
                        </div>
                        <span className="text-sm font-medium">1. Tourist</span>
                    </div>
                    <div className={`flex-1 h-1 mx-4 rounded-full ${step >= 2 ? 'bg-indigo-500/50' : 'bg-slate-700'}`}></div>
                    
                    <div className={`flex flex-col items-center gap-2 ${step >= 2 ? 'text-blue-400' : 'text-slate-500'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-blue-400 bg-blue-400/20' : 'border-slate-600 bg-slate-800'}`}>
                            <Globe size={20} />
                        </div>
                        <span className="text-sm font-medium">2. Passport</span>
                    </div>
                    <div className={`flex-1 h-1 mx-4 rounded-full ${step >= 3 ? 'bg-blue-500/50' : 'bg-slate-700'}`}></div>
                    
                    <div className={`flex flex-col items-center gap-2 ${step >= 3 ? 'text-emerald-400' : 'text-slate-500'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'border-emerald-400 bg-emerald-400/20' : 'border-slate-600 bg-slate-800'}`}>
                            <FileText size={20} />
                        </div>
                        <span className="text-sm font-medium">3. Visa</span>
                    </div>
                </div>
            </div>

            {/* Forms */}
            <div className="glass-panel p-8 rounded-2xl relative overflow-hidden">
                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-300">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
                            <User className="text-indigo-400" /> Register Tourist Profile
                        </h2>
                        <form onSubmit={handleTouristSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">First Name</label>
                                <input type="text" required value={touristForm.firstName} onChange={e => setTouristForm({...touristForm, firstName: e.target.value})} className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Last Name</label>
                                <input type="text" required value={touristForm.lastName} onChange={e => setTouristForm({...touristForm, lastName: e.target.value})} className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Nationality</label>
                                <input type="text" required value={touristForm.nationality} onChange={e => setTouristForm({...touristForm, nationality: e.target.value})} className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Date of Birth</label>
                                <input type="date" required value={touristForm.dateOfBirth} onChange={e => setTouristForm({...touristForm, dateOfBirth: e.target.value})} className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Gender</label>
                                <select value={touristForm.gender} onChange={e => setTouristForm({...touristForm, gender: e.target.value})} className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none">
                                    <option>Male</option>
                                    <option>Female</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div className="md:col-span-2 flex justify-end mt-4">
                                <button type="submit" disabled={loading} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all flex items-center gap-2">
                                    {loading ? 'Processing...' : 'Next Step: Passport'} <ChevronRight size={18} />
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-300">
                        <div className="mb-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center gap-3">
                            <CheckCircle className="text-indigo-400" size={24} />
                            <div>
                                <p className="text-sm font-medium text-white">Tourist Profile Created</p>
                                <p className="text-xs text-indigo-300">Tourist ID: #{touristId}</p>
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
                            <Globe className="text-blue-400" /> Assign Passport
                        </h2>
                        <form onSubmit={handlePassportSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-300 mb-2">Passport Number</label>
                                <input type="text" required value={passportForm.passportNumber} onChange={e => setPassportForm({...passportForm, passportNumber: e.target.value})} className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Issue Date</label>
                                <input type="date" required value={passportForm.issueDate} onChange={e => setPassportForm({...passportForm, issueDate: e.target.value})} className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Expiry Date</label>
                                <input type="date" required value={passportForm.expiryDate} onChange={e => setPassportForm({...passportForm, expiryDate: e.target.value})} className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div className="md:col-span-2 flex justify-between mt-4">
                                <button type="button" onClick={() => setStep(1)} className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-all">Back</button>
                                <button type="submit" disabled={loading} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all flex items-center gap-2">
                                    {loading ? 'Processing...' : 'Next Step: Visa'} <ChevronRight size={18} />
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {step === 3 && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-300">
                        <div className="mb-6 flex gap-4">
                            <div className="flex-1 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center gap-3">
                                <CheckCircle className="text-indigo-400" size={24} />
                                <div><p className="text-sm font-medium text-white">Tourist Profile</p><p className="text-xs text-indigo-300">ID: #{touristId}</p></div>
                            </div>
                            <div className="flex-1 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-3">
                                <CheckCircle className="text-blue-400" size={24} />
                                <div><p className="text-sm font-medium text-white">Passport</p><p className="text-xs text-blue-300">ID: #{passportId}</p></div>
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
                            <FileText className="text-emerald-400" /> Issue Visa to Passport
                        </h2>
                        <form onSubmit={handleVisaSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Visa ID (Manual Entry)</label>
                                <input type="number" required value={visaForm.visaId} onChange={e => setVisaForm({...visaForm, visaId: e.target.value})} className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Visa Type</label>
                                <select value={visaForm.visaType} onChange={e => setVisaForm({...visaForm, visaType: e.target.value})} className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 outline-none appearance-none">
                                    <option>Tourist</option>
                                    <option>Business</option>
                                    <option>Transit</option>
                                    <option>Student</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Issue Date</label>
                                <input type="date" required value={visaForm.issueDate} onChange={e => setVisaForm({...visaForm, issueDate: e.target.value})} className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Expiry Date</label>
                                <input type="date" required value={visaForm.expiryDate} onChange={e => setVisaForm({...visaForm, expiryDate: e.target.value})} className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 outline-none" />
                            </div>
                            <div className="md:col-span-2 flex justify-between mt-4">
                                <button type="button" onClick={() => setStep(2)} className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-all">Back</button>
                                <button type="submit" disabled={loading} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-all flex items-center gap-2">
                                    {loading ? 'Processing...' : 'Complete Registration'} <Save size={18} />
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {step === 4 && (
                    <div className="animate-in zoom-in-95 duration-500 text-center py-12">
                        <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="text-emerald-400" size={48} />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">Registration Complete!</h2>
                        <p className="text-slate-400 mb-8 max-w-md mx-auto">
                            The Tourist, Passport, and Visa have been successfully linked and issued across the microservices.
                        </p>
                        <button onClick={resetWizard} className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-all">
                            Start New Registration
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RegistrationWizard;
