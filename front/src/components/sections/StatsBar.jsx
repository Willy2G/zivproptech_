const STATS = [
  { value: '+50', label: 'Promoteurs & Agences Équipés' },
  { value: '+ 100', label: 'Projets gérés via nos ERP' },
  { value: '7j/7', label: 'Support Technique' },
];

export default function StatsBar() {
  return (
    <section className="bg-ziv-blue py-6 border-b border-blue-900 relative z-20 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-blue-400/30">
          {STATS.map((stat) => (
            <div key={stat.label} className="py-2">
              <div className="text-3xl font-heading font-extrabold text-white mb-1">{stat.value}</div>
              <div className="text-blue-200 text-sm font-medium uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
