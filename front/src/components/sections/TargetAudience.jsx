import { Building, Landmark, Map, Users } from 'lucide-react';

const AUDIENCES = [
  { icon: Building, label: 'Promoteurs Immobiliers', color: 'text-ziv-blue' },
  { icon: Landmark, label: 'Agences Immobilières', color: 'text-ziv-cyan' },
  { icon: Map, label: 'Aménageurs Fonciers', color: 'text-teal-600' },
  { icon: Users, label: 'Syndic Copropriété', color: 'text-emerald-600' },
];

export default function TargetAudience() {
  return (
    <section className="py-10 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">
            Les Solutions Logicielles destinées aux
          </p>
          <p className="text-xl font-heading font-extrabold text-ziv-navy">
            Professionnels de l'immobilier
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-6 md:gap-12 opacity-80">
          {AUDIENCES.map(({ icon: Ico, label, color }) => (
            <div
              key={label}
              className="flex items-center bg-gray-50 px-6 py-3 rounded-xl border border-gray-100 shadow-sm hover:border-ziv-cyan transition-colors"
            >
              <Ico className={`h-5 w-5 mr-3 ${color}`} />
              <span className="font-heading font-semibold text-gray-800">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
