import { Building2, Home, Layers, Map, ShieldCheck, Users, Wallet } from 'lucide-react';

// Registre des seules icones pilotees dynamiquement depuis data/*.js.
// (Import cible plutot que `import *` afin de garder un bundle leger / tree-shakable.)
const REGISTRY = { Building2, Home, Layers, Map, ShieldCheck, Users, Wallet };

/**
 * Rend une icone lucide-react a partir de son nom.
 * Ex: <Icon name="Building2" className="h-6 w-6" />
 */
export default function Icon({ name, ...props }) {
  const LucideIcon = REGISTRY[name];
  if (!LucideIcon) return null;
  return <LucideIcon {...props} />;
}
