import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ShieldAlert, ArrowRight } from 'lucide-react';
import { AuthAPI } from '../../api/auth.api';
import Swal from 'sweetalert2';

const Login: React.FC = () => {
    const [_email, _setEmail] = useState('');
    const [_password, _setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await AuthAPI.login({ email: _email, password: _password });
            // Save token ONLY (Do not save role in local storage for security)
            localStorage.setItem('accessToken', data.accessToken);

            await Swal.fire({
                icon: 'success',
                title: 'Login Successful',
                text: 'Welcome back!',
                background: '#ffffff',
                color: '#1e293b',
                confirmButtonColor: '#1e293b',
                timer: 1500,
                showConfirmButton: false
            });

            // Securely decode the JWT to find the role
            let userRole = 'ROLE_ADMIN'; // Fallback
            try {
                const payload = data.accessToken.split('.')[1];
                const decoded = JSON.parse(atob(payload));
                if (decoded.role) {
                    userRole = decoded.role;
                }
                if (decoded.sub) {
                    localStorage.setItem('userEmail', decoded.sub);
                }
            } catch (e) {
                console.error("Failed to decode token", e);
            }

            if (userRole.includes('AGENCY')) {
                navigate('/agency');
            } else if (userRole.includes('HOTEL')) {
                navigate('/hotel');
            } else if (userRole.includes('IMMIGRATION')) {
                navigate('/immigration');
            } else {
                navigate('/admin/dashboard'); // Default fallback for Admin
            }
        } catch (err: any) {
            Swal.fire({
                icon: 'error',
                title: 'Access Denied',
                text: err.response?.data?.message || 'Invalid credentials. Please try again.',
                background: '#ffffff',
                color: '#1e293b',
                confirmButtonColor: '#dc2626'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
             style={{
                 background: 'linear-gradient(135deg, #e2e8f0 0%, #dde7f7 40%, #e8edf8 100%)'
             }}>
            {/* Subtle background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full"
                     style={{ background: 'radial-gradient(circle, rgba(148,163,184,0.18) 0%, transparent 70%)' }} />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full"
                     style={{ background: 'radial-gradient(circle, rgba(148,163,184,0.14) 0%, transparent 70%)' }} />
            </div>

            {/* Card */}
            <div className="relative z-10 w-full max-w-sm mx-4">
                <div className="glass-panel rounded-2xl p-8">
                    {/* Logo / Brand */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
                             style={{ background: 'rgba(30, 41, 59, 0.07)', border: '1px solid rgba(30,41,59,0.10)' }}>
                            <ShieldAlert size={26} className="text-slate-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Access</h1>
                        <p className="text-slate-500 mt-1.5 text-sm">Smart Visa &amp; Tourist Tracking</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1.5">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <Mail size={16} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={_email}
                                    onChange={(e) => _setEmail(e.target.value)}
                                    className="input-light pl-10"
                                    placeholder="admin@smartvisa.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1.5">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <Lock size={16} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={_password}
                                    onChange={(e) => _setPassword(e.target.value)}
                                    className="input-light pl-10"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-2.5 mt-2"
                        >
                            {loading ? 'Authenticating...' : (
                                <>Secure Login <ArrowRight size={15} /></>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-slate-400 text-xs mt-5">
                    Smart Visa &amp; Tourist Tracking System
                </p>
            </div>
        </div>
    );
};

export default Login;
