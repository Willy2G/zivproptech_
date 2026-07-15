import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Lock, Mail, ShieldAlert } from 'lucide-react';
import { useToast } from '../context/ToastContext.jsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const API = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.message || 'Erreur de connexion');
        return;
      }

      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.user));
      showToast('Connexion réussie !');
      navigate('/admin/dashboard');
    } catch (err) {
      showToast('Erreur de communication avec le serveur');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-900 overflow-hidden">
      {/* Background gradients and blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-blob animation-delay-4000"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-2xl shadow-xl shadow-blue-500/30 flex items-center justify-center transform rotate-3 hover:rotate-6 transition-transform duration-300">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-4xl font-extrabold text-white tracking-tight">
          ZIV PROPTECH
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400 font-medium tracking-wide uppercase">
          Portail d'Administration Sécurisé
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-800/60 backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-slate-700/50">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">
                Adresse email
              </label>
              <div className="relative rounded-xl shadow-sm group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-cyan-400 text-slate-500">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 bg-slate-900/50 text-white sm:text-sm border-slate-700 rounded-xl py-3 border focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all placeholder-slate-600"
                  placeholder="admin@zivproptech.ci"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">
                Mot de passe
              </label>
              <div className="relative rounded-xl shadow-sm group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-cyan-400 text-slate-500">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 bg-slate-900/50 text-white sm:text-sm border-slate-700 rounded-xl py-3 border focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all placeholder-slate-600"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 disabled:opacity-70 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Authentification...
                  </span>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 mr-2" />
                    Se connecter
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
