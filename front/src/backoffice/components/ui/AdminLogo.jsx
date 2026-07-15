import { useState, useEffect } from 'react';
import { fetchSettings } from '../../../services/api.js';

// Logo "ZIV ADMIN" affiche en tete de la sidebar.
export default function AdminLogo() {
  const [logo, setLogo] = useState(null);

  useEffect(() => {
    fetchSettings().then(s => { if (s.logo_url) setLogo(s.logo_url); }).catch(() => {});
  }, []);

  if (logo) {
    return (
      <div className="flex items-center">
        <img src={logo} alt="Logo ZIV ADMIN" className="h-8 object-contain bg-white rounded p-1" />
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <svg
        className="h-8 w-8 text-ziv-cyan mr-2"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M2 22L22 2v8l-8 4 8 8H2V14l8-4-8-8z" fill="currentColor" fillOpacity="0.2" />
      </svg>
      <span className="font-heading font-bold text-xl tracking-tight text-white">
        ZIV<span className="text-ziv-cyan">ADMIN</span>
      </span>
    </div>
  );
}
