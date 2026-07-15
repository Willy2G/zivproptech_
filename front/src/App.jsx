import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import PublicSite from './pages/PublicSite.jsx';
import AdminApp from './backoffice/AdminApp.jsx';
import { fetchSettings } from './services/api.js';

/**
 * Racine de l'application. Deux espaces cohabitent dans le meme projet :
 *  - "/"        : le site vitrine public (PublicSite)
 *  - "/admin/*" : le back office d'administration (AdminApp)
 * Aucun second projet / install : tout partage les memes dependances.
 */
export default function App() {
  useEffect(() => {
    fetchSettings().then(s => {
      if (s.favicon_url) {
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.getElementsByTagName('head')[0].appendChild(link);
        }
        link.href = s.favicon_url;
      }
    }).catch(() => {});
  }, []);

  return (
    <Routes>
      <Route path="/admin/*" element={<AdminApp />} />
      <Route path="/*" element={<PublicSite />} />
    </Routes>
  );
}
