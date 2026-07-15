import { getSoftwareBadge } from '../../data/softwareBadges.js';

// Petit badge coloré du logiciel concerné par un lead / témoignage.
export default function SoftwareBadge({ value }) {
  const { label, className } = getSoftwareBadge(value);
  return (
    <span className={`${className} px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap`}>
      {label}
    </span>
  );
}
