export const softwareStylesMap = {
  lotiges: {
    tag: 'Promotion',
    accent: {
      bar: 'bg-ziv-blue',
      tagBg: 'bg-blue-50',
      tagText: 'text-ziv-blue',
      iconBg: 'bg-blue-50',
      iconText: 'text-ziv-blue',
      iconHover: 'group-hover:bg-ziv-blue',
      titleHover: 'group-hover:text-ziv-blue',
      check: 'text-ziv-blue',
      cta: 'text-ziv-blue',
      shadow: 'hover:shadow-[0_10px_40px_rgba(29,78,216,0.15)]',
    },
    pricing: {
      hoverBorder: 'hover:border-ziv-blue',
    }
  },
  lotiges_erp: {
    // handled separately in Pricing, but we could put mapping here if needed.
  },
  foncier: {
    tag: 'Lotissement',
    accent: {
      bar: 'bg-teal-500',
      tagBg: 'bg-teal-50',
      tagText: 'text-teal-600',
      iconBg: 'bg-teal-50',
      iconText: 'text-teal-600',
      iconHover: 'group-hover:bg-teal-500',
      titleHover: 'group-hover:text-teal-600',
      check: 'text-teal-500',
      cta: 'text-teal-600',
      shadow: 'hover:shadow-[0_10px_40px_rgba(13,148,136,0.15)]',
    },
    pricing: {
      hoverBorder: 'hover:border-teal-500',
    }
  },
  suit_foncier: {
    // same as foncier (the DB has 'suit_foncier')
    tag: 'Lotissement',
    accent: {
      bar: 'bg-teal-500',
      tagBg: 'bg-teal-50',
      tagText: 'text-teal-600',
      iconBg: 'bg-teal-50',
      iconText: 'text-teal-600',
      iconHover: 'group-hover:bg-teal-500',
      titleHover: 'group-hover:text-teal-600',
      check: 'text-teal-500',
      cta: 'text-teal-600',
      shadow: 'hover:shadow-[0_10px_40px_rgba(13,148,136,0.15)]',
    },
    pricing: {
      hoverBorder: 'hover:border-teal-500',
    }
  },
  gespat: {
    tag: 'Syndic & Agence',
    accent: {
      bar: 'bg-orange-500',
      tagBg: 'bg-orange-50',
      tagText: 'text-orange-600',
      iconBg: 'bg-orange-50',
      iconText: 'text-orange-500',
      iconHover: 'group-hover:bg-orange-500',
      titleHover: 'group-hover:text-orange-500',
      check: 'text-orange-500',
      cta: 'text-orange-500',
      shadow: 'hover:shadow-[0_10px_40px_rgba(249,115,22,0.15)]',
    },
    pricing: {
      hoverBorder: 'hover:border-orange-500',
    }
  },
  vente: {
    tag: null,
    accent: {
      bar: 'bg-indigo-500',
      tagBg: 'bg-indigo-50',
      tagText: 'text-indigo-600',
      iconBg: 'bg-indigo-50',
      iconText: 'text-indigo-500',
      iconHover: 'group-hover:bg-indigo-500',
      titleHover: 'group-hover:text-indigo-500',
      check: 'text-indigo-500',
      cta: 'text-indigo-500',
      shadow: 'hover:shadow-[0_10px_40px_rgba(79,70,229,0.15)]',
    },
    pricing: {
      hoverBorder: 'hover:border-indigo-500',
    }
  },
  easy_vente: { // DB uses 'easy_vente'
    tag: null,
    accent: {
      bar: 'bg-indigo-500',
      tagBg: 'bg-indigo-50',
      tagText: 'text-indigo-600',
      iconBg: 'bg-indigo-50',
      iconText: 'text-indigo-500',
      iconHover: 'group-hover:bg-indigo-500',
      titleHover: 'group-hover:text-indigo-500',
      check: 'text-indigo-500',
      cta: 'text-indigo-500',
      shadow: 'hover:shadow-[0_10px_40px_rgba(79,70,229,0.15)]',
    },
    pricing: {
      hoverBorder: 'hover:border-indigo-500',
    }
  },
  gedaj: {
    tag: 'Obligatoire',
    accent: {
      bar: 'bg-red-500',
      tagBg: 'bg-red-50',
      tagText: 'text-red-600',
      iconBg: 'bg-red-50',
      iconText: 'text-red-500',
      iconHover: 'group-hover:bg-red-500',
      titleHover: 'group-hover:text-red-500',
      check: 'text-red-500',
      cta: 'text-red-500',
      shadow: 'hover:shadow-[0_10px_40px_rgba(220,38,38,0.15)]',
    },
    pricing: {
      hoverBorder: 'hover:border-red-500',
    }
  },
  syndycarre: {
    tag: 'Copropriété',
    accent: {
      bar: 'bg-emerald-500',
      tagBg: 'bg-emerald-50',
      tagText: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
      iconText: 'text-emerald-500',
      iconHover: 'group-hover:bg-emerald-500',
      titleHover: 'group-hover:text-emerald-500',
      check: 'text-emerald-500',
      cta: 'text-emerald-500',
      shadow: 'hover:shadow-[0_10px_40px_rgba(16,185,129,0.15)]',
    },
    pricing: {
      hoverBorder: 'hover:border-emerald-500',
    }
  },
  // fallback for any other
  default: {
    tag: 'Module',
    accent: {
      bar: 'bg-gray-500',
      tagBg: 'bg-gray-50',
      tagText: 'text-gray-600',
      iconBg: 'bg-gray-50',
      iconText: 'text-gray-500',
      iconHover: 'group-hover:bg-gray-500',
      titleHover: 'group-hover:text-gray-500',
      check: 'text-gray-500',
      cta: 'text-gray-500',
      shadow: 'hover:shadow-[0_10px_40px_rgba(107,114,128,0.15)]',
    },
    pricing: {
      hoverBorder: 'hover:border-gray-500',
    }
  }
};
