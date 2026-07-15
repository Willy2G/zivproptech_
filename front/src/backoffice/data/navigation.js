import {
  Box,
  FileText,
  HelpCircle,
  LayoutDashboard,
  MessageSquare,
  Search,
  Users,
} from 'lucide-react';

// Configuration de la navigation laterale, groupee par section.
// `path` est absolu (prefixe /admin) ; `title` = titre affiche dans le header.
export const navGroups = [
  {
    label: "Vue d'ensemble",
    items: [
      { path: '/admin/dashboard', label: 'Tableau de bord', title: 'Tableau de bord', icon: LayoutDashboard },
      { path: '/admin/crm', label: 'CRM (Démos & RDV)', title: 'Gestion CRM & Leads', icon: Users, badge: 3 },
    ],
  },
  {
    label: 'Contenu du Site',
    items: [
      { path: '/admin/logiciels', label: 'Logiciels & Tarifs', title: 'Catalogue Logiciels & Tarifs', icon: Box },
      { path: '/admin/blog', label: 'Blog & Ressources', title: 'Blog & Ressources PropTech', icon: FileText },
      { path: '/admin/temoignages', label: 'Témoignages', title: 'Témoignages Clients', icon: MessageSquare },
      { path: '/admin/faq', label: 'FAQ & Chatbot', title: 'FAQ & Chatbot', icon: HelpCircle },
    ],
  },
  {
    label: 'Configuration',
    items: [{ path: '/admin/seo', label: 'SEO & Apparence', title: 'Apparence & SEO', icon: Search }],
  },
];

// Liste a plat (retrouver le titre depuis un pathname).
export const navItems = navGroups.flatMap((g) => g.items);
