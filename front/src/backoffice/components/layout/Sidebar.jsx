import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import AdminLogo from '../ui/AdminLogo.jsx';
import { navGroups } from '../../data/navigation.js';
import { fetchLeads } from '../../../services/api.js';

export default function Sidebar({ isOpen, setIsOpen }) {
  const [inProgressCount, setInProgressCount] = useState(0);

  useEffect(() => {
    fetchLeads().then(leads => {
      setInProgressCount(leads.filter(l => l.status === 'in_progress').length);
    }).catch(console.error);
  }, []);

  return (
    <aside className={`${isOpen ? 'w-64' : 'w-20'} bg-ziv-navy text-white flex flex-col h-full shadow-2xl z-20 flex-shrink-0 transition-all duration-300 relative`}>
      <div className={`h-20 flex items-center ${isOpen ? 'px-6' : 'px-0 justify-center'} border-b border-white/10 bg-black/10 overflow-hidden`}>
        {isOpen ? <AdminLogo /> : <span className="font-bold text-xl">ZIV</span>}
      </div>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-3 top-24 bg-white text-ziv-navy rounded-full p-1 shadow-md border border-gray-200 z-50 hover:bg-gray-100"
      >
        {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      <nav className="flex-1 overflow-y-auto py-6 space-y-1 overflow-x-hidden">
        {navGroups.map((group) => (
          <div key={group.label}>
            {isOpen && (
              <p className="px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-4 whitespace-nowrap">
                {group.label}
              </p>
            )}
            {group.items.map(({ path, label, icon: Ico }) => (
              <NavLink
                key={path}
                to={path}
                title={!isOpen ? label : ''}
                className={({ isActive }) =>
                  `flex items-center mx-4 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${isActive
                    ? 'bg-ziv-cyan text-white'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  } ${!isOpen ? 'justify-center' : ''}`
                }
              >
                <Ico className={`h-5 w-5 ${isOpen ? 'mr-3' : ''}`} />
                {isOpen && <span className="whitespace-nowrap">{label}</span>}
                {isOpen && path === '/admin/crm' && inProgressCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white py-0.5 px-2 rounded-full text-[10px] font-bold">
                    {inProgressCount}
                  </span>
                )}
                {!isOpen && path === '/admin/crm' && inProgressCount > 0 && (
                  <span className="absolute right-4 top-2 bg-red-500 w-2 h-2 rounded-full"></span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className={`p-4 border-t border-white/10 flex ${!isOpen ? 'justify-center' : ''}`}>
        <button
          type="button"
          title={!isOpen ? 'Déconnexion' : ''}
          className={`flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors ${isOpen ? 'w-full' : ''}`}
        >
          <LogOut className={`h-5 w-5 ${isOpen ? 'mr-3' : ''}`} />
          {isOpen && 'Déconnexion'}
        </button>
      </div>
    </aside>
  );
}
