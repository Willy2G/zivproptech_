import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, ExternalLink, LogOut } from 'lucide-react';
import { navItems } from '../../data/navigation.js';

export default function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const current = navItems.find((item) => pathname.startsWith(item.path));
  const title = current?.title || 'Administration';

  const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
  const initials = user.name ? user.name.substring(0, 2).toUpperCase() : 'AD';

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 h-20 flex items-center justify-between px-8 flex-shrink-0 z-10 shadow-sm">
      <h1 className="text-2xl font-bold font-heading text-ziv-navy">{title}</h1>

      <div className="flex items-center space-x-6">
        <Link
          to="/"
          className="text-gray-400 hover:text-ziv-cyan transition-colors"
          title="Voir le site public"
        >
          <ExternalLink className="h-5 w-5" />
        </Link>
        <button type="button" className="relative text-gray-400 hover:text-ziv-cyan transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white" />
        </button>
        <div className="flex items-center pl-6 border-l border-gray-200">
          <div className="h-9 w-9 rounded-full bg-ziv-cyan flex items-center justify-center text-white font-bold text-sm shadow-md">
            {initials}
          </div>
          <div className="ml-3 hidden md:block">
            <p className="text-sm font-bold text-gray-700 leading-none">{user.name || 'Admin ZIV'}</p>
            <p className="text-xs text-gray-500 mt-1">{user.role === 'super_admin' ? 'Super Administrateur' : 'Éditeur'}</p>
          </div>
          <button 
            onClick={handleLogout}
            title="Se déconnecter"
            className="ml-4 text-gray-400 hover:text-red-500 transition-colors"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
