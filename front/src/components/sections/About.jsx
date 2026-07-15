import { Award, Lock, Star, Zap } from 'lucide-react';

const PILLARS = [
  {
    icon: Zap,
    iconBg: 'bg-blue-50',
    iconBorder: 'border-blue-100',
    iconColor: 'text-ziv-blue',
    title: 'Productivité & Leads',
    text: "Automatisez l'administratif (quittances, échéanciers) pour que vos équipes se concentrent sur la vente et l'acquisition de nouveaux clients.",
  },
  {
    icon: Lock,
    iconBg: 'bg-teal-50',
    iconBorder: 'border-teal-100',
    iconColor: 'text-teal-600',
    title: 'Sécurité et Continuité',
    text: 'Hébergement Cloud sécurisé, sauvegardes quotidiennes, et archivage inviolable de vos contrats et actes juridiques.',
  },
];

export default function About() {
  return (
    <section id="about" className="py-20 bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
          <div className="mb-10 lg:mb-0 relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-ziv-cyan to-ziv-blue opacity-30 blur-2xl rounded-3xl" />
            <img
              src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
              alt="Logiciels immobiliers en Côte d'Ivoire"
              className="relative rounded-2xl shadow-xl border border-white/50"
            />

            <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-2xl border border-yellow-200 hidden md:block w-64 transform rotate-2 hover:rotate-0 transition-transform duration-300">
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                <Star className="h-5 w-5 text-white fill-current" />
              </div>
              <div className="text-center">
                <Award className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
                <h4 className="font-bold text-gray-900 leading-tight">Prix d'Excellence</h4>
                <p className="text-xs text-yellow-600 font-semibold mt-1">ÉVALUATION D'OR</p>
                <div className="w-8 h-1 bg-gray-200 mx-auto my-2" />
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">
                  Innovation Technologique PropTech
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-heading font-bold text-ziv-navy mb-6">
              L'Expertise PropTech 100% Ouest-Africaine
            </h2>
            <p className="text-gray-600 mb-6 text-lg">
              Développée par <strong>Alerte Foncier</strong>, ZIV n'est pas un logiciel importé et
              adapté à la hâte. C'est une suite primée conçue dès le premier jour pour résoudre les
              défis réels (ACD, VEFA, LBC, OHADA) des professionnels en Côte d'Ivoire et dans la
              sous-région.
            </p>
            <div className="space-y-6 mt-8">
              {PILLARS.map(({ icon: Ico, iconBg, iconBorder, iconColor, title, text }) => (
                <div key={title} className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center border ${iconBorder}`}>
                      <Ico className={`h-5 w-5 ${iconColor}`} />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-bold text-gray-900">{title}</h4>
                    <p className="text-gray-600 text-sm mt-1">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
