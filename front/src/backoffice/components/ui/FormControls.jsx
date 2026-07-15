// Primitives de formulaire partagees par les vues du back office.
// Styles cohérents (fond gris clair, focus cyan).

const baseInput =
  'w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-ziv-cyan focus:border-ziv-cyan outline-none';

export function Field({ label, children, hint }) {
  return (
    <div>
      {label && <label className="block text-sm font-bold text-gray-700 mb-1">{label}</label>}
      {children}
      {hint && <p className="text-[10px] text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

export function TextInput({ className = '', ...props }) {
  return <input className={`${baseInput} ${className}`} {...props} />;
}

export function TextArea({ className = '', ...props }) {
  return <textarea className={`${baseInput} leading-relaxed ${className}`} {...props} />;
}

export function Select({ className = '', children, ...props }) {
  return (
    <select className={`${baseInput} ${className}`} {...props}>
      {children}
    </select>
  );
}

// Bouton d'enregistrement standard (icone Save + libelle).
export function SaveButton({ children = 'Enregistrer les modifications', className = 'bg-ziv-navy hover:bg-ziv-blue' }) {
  return (
    <button
      type="submit"
      className={`${className} text-white font-bold py-2.5 px-6 rounded-lg shadow-md transition-colors flex items-center justify-center`}
    >
      {children}
    </button>
  );
}
