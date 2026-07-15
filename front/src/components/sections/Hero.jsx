import { ArrowRight, Award, CheckCircle, HardHat } from 'lucide-react';

// Maquette "chantier" affichee dans la carte de droite du hero.
function DashboardMockup() {
  return (
    <div className="relative hidden md:block">
      <div className="glass-card rounded-2xl p-6 shadow-2xl relative z-20 transform hover:-translate-y-2 transition-transform duration-500">
        <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="text-white/80 text-sm font-medium flex items-center">
            <HardHat className="h-4 w-4 mr-2 text-ziv-cyan" /> LOTIGES ERP - Chantier BTP
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="text-white/60 text-xs mb-1">Budget Réalisé</div>
            <div className="text-white font-bold text-xl flex items-end">
              75% <span className="text-xs text-green-400 ml-2 font-normal">Normal</span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full mt-2">
              <div className="bg-green-400 h-1.5 rounded-full" style={{ width: '75%' }} />
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="text-white/60 text-xs mb-1">Stock Matériaux</div>
            <div className="text-white font-bold text-xl flex items-end">
              Alerte <span className="text-xs text-red-400 ml-2 font-normal">Ciment</span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full mt-2">
              <div className="bg-red-400 h-1.5 rounded-full" style={{ width: '20%' }} />
            </div>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="text-white/60 text-xs mb-3">Planning d'exécution (Gros Œuvre)</div>
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-20 text-[10px] text-white/50">Fondations</div>
              <div className="flex-grow bg-white/10 h-4 rounded relative">
                <div className="absolute left-0 top-0 h-full bg-ziv-cyan rounded w-1/3" />
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-20 text-[10px] text-white/50">Élévation</div>
              <div className="flex-grow bg-white/10 h-4 rounded relative">
                <div className="absolute left-1/3 top-0 h-full bg-blue-400 rounded w-1/2" />
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-20 text-[10px] text-white/50">Toiture</div>
              <div className="flex-grow bg-white/10 h-4 rounded relative">
                <div className="absolute left-3/4 top-0 h-full bg-white/30 rounded w-1/4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="absolute -bottom-6 -left-8 glass-card rounded-xl p-4 shadow-xl z-30 flex items-center animate-bounce"
        style={{ animationDuration: '3s' }}
      >
        <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center mr-3 border border-yellow-500/30">
          <Award className="h-5 w-5 text-yellow-400" />
        </div>
        <div>
          <div className="text-white text-sm font-bold">Évaluation d'Or</div>
          <div className="text-white/60 text-[10px]">Innovation Technologique</div>
        </div>
      </div>

      <div className="absolute -top-6 -right-6 glass-card rounded-xl p-4 shadow-xl z-10 flex items-center">
        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
          <CheckCircle className="h-5 w-5 text-green-400" />
        </div>
        <div>
          <div className="text-white text-sm font-bold">Facture validée</div>
          <div className="text-white/60 text-xs">Fournisseur BTP</div>
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="hero-pattern pt-32 pb-20 lg:pt-40 lg:pb-24 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-ziv-navy/95 to-ziv-blue/90" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
          <div className="text-center lg:text-left mb-12 lg:mb-0">
            <a
              href="#about"
              className="inline-flex items-center py-1.5 px-4 rounded-full bg-yellow-400/20 text-yellow-300 text-xs sm:text-sm font-bold tracking-wider mb-6 border border-yellow-400/30 cursor-pointer hover:bg-yellow-400/30 transition-colors"
            >
              <Award className="h-4 w-4 mr-2 text-yellow-400" />
              Prix d'Excellence d'Or - Innovation Technologique
            </a>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-white leading-tight mb-6">
              Pilotez toute votre activité <br className="hidden lg:block" />{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-ziv-cyan to-blue-400">
                Immobilière
              </span>{' '}
              avec ZIV.
            </h1>
            <p className="mt-4 text-lg text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              La première suite PropTech conçue et adaptée aux réalités immobilières en Côte
              d'Ivoire et en Afrique de l'Ouest. Générez des leads, gérez vos projets, vos ventes
              et vos loyers avec des solutions logicielles de pointe.
            </p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              <a
                href="#contact"
                className="bg-ziv-cyan hover:bg-cyan-500 text-white font-bold py-4 px-8 rounded-xl shadow-[0_0_20px_rgba(0,168,181,0.4)] hover:shadow-[0_0_30px_rgba(0,168,181,0.6)] transition-all duration-300 text-lg flex items-center justify-center transform hover:-translate-y-1"
              >
                Démarrer ma Démo
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
              <a
                href="#solutions"
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold py-4 px-8 rounded-xl transition duration-300 text-lg flex items-center justify-center backdrop-blur-md"
              >
                Voir les Logiciels
              </a>
            </div>
          </div>

          <DashboardMockup />
        </div>
      </div>
    </section>
  );
}
