import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MdRestaurant, MdPerson, MdLock } from 'react-icons/md';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setLoading(true);
    const result = await login(username, password);
    setLoading(false);

    if (result.success) {
      navigate('/takeaway');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white/10 p-8 shadow-2xl backdrop-blur-md border border-white/10">
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/50 mb-4 animate-bounce">
            <MdRestaurant size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Welcome Back</h2>
          <p className="text-indigo-200 mt-2 text-sm text-center">Restaurant Management System Login</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-500/25 border border-red-500/50 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-indigo-200 mb-2">Username</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-300">
                <MdPerson size={20} />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full rounded-xl bg-slate-950/40 border border-white/15 py-3 pl-10 pr-4 text-white placeholder-indigo-300/50 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-all text-base"
                placeholder="Enter username (e.g. admin)"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-indigo-200 mb-2">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-300">
                <MdLock size={20} />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-xl bg-slate-950/40 border border-white/15 py-3 pl-10 pr-4 text-white placeholder-indigo-300/50 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-all text-base"
                placeholder="Enter password (e.g. admin123)"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-xl bg-indigo-500 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center text-xs text-indigo-300/50">
          <p>Demo Accounts:</p>
          <p className="mt-1">Admin: <span className="font-semibold text-indigo-300">admin / admin123</span></p>
          <p>User: <span className="font-semibold text-indigo-300">user / user123</span></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
