import { useState, useEffect } from 'react';
import { fetchSettings } from '../../services/api.js';

// Logo ZIV PROPTECH reutilisable (navbar + footer).
export default function Logo({ variant = 'dark' }) {
  const textColor = variant === 'light' ? 'text-white' : 'text-ziv-navy';
  const size = variant === 'light' ? 'h-8 w-8' : 'h-10 w-10';
  const textSize = variant === 'light' ? 'text-xl' : 'text-2xl';
  const [logo, setLogo] = useState(null);

  useEffect(() => {
    fetchSettings().then(s => { if (s.logo_url) setLogo(s.logo_url); }).catch(() => {});
  }, []);

  if (logo) {
    return (
      <div className="flex items-center">
        <img src={logo} alt="Logo ZIV PROPTECH" className={`${variant === 'light' ? 'h-8' : 'h-10'} object-contain`} />
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <svg
        className={`${size} text-ziv-cyan`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 22L22 2v8l-8 4 8 8H2V14l8-4-8-8z" fill="currentColor" fillOpacity="0.1" />
        {variant !== 'light' && (
          <>
            <circle cx="2" cy="22" r="1.5" fill="#0A1E4A" stroke="none" />
            <circle cx="22" cy="2" r="1.5" fill="#0A1E4A" stroke="none" />
          </>
        )}
      </svg>
      <span className={`ml-2 font-heading font-bold ${textSize} tracking-tight ${textColor}`}>
        ZIV<span className="text-ziv-cyan">PROPTECH</span>
      </span>
    </div>
  );
}
