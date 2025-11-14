import { Truck, Users, FileText, MapPin } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Truck className="w-8 h-8 text-slate-700" />
              <span className="text-xl font-bold text-slate-900">TransGestion</span>
            </div>
            <button
              onClick={onGetStarted}
              className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Se connecter
            </button>
          </div>
        </div>
      </nav>

      <main>
        <section className="pt-20 pb-24 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
              Gestion de la Mobilité
              <span className="block text-slate-600 mt-2">Simplifiée et Efficace</span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
              Optimisez la gestion de vos missions, véhicules et affectations avec une plateforme
              moderne et intuitive conçue pour les professionnels du transport.
            </p>
            <button
              onClick={onGetStarted}
              className="px-8 py-4 bg-slate-700 text-white rounded-lg text-lg font-semibold hover:bg-slate-800 transition-all hover:shadow-lg"
            >
              Commencer maintenant
            </button>
          </div>
        </section>

        <section className="py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-16">
              Fonctionnalités Principales
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard
                icon={<MapPin className="w-12 h-12 text-slate-700" />}
                title="Gestion des Missions"
                description="Créez, suivez et validez vos missions de transport en temps réel."
              />
              <FeatureCard
                icon={<Truck className="w-12 h-12 text-slate-700" />}
                title="Parc Véhicules"
                description="Gérez votre flotte de véhicules avec suivi de disponibilité et capacité."
              />
              <FeatureCard
                icon={<Users className="w-12 h-12 text-slate-700" />}
                title="Affectations"
                description="Assignez chauffeurs et véhicules aux missions de manière optimale."
              />
              <FeatureCard
                icon={<FileText className="w-12 h-12 text-slate-700" />}
                title="Rapports"
                description="Consultez et générez des rapports détaillés pour chaque mission."
              />
            </div>
          </div>
        </section>

        <section className="py-20 px-4 bg-gradient-to-br from-slate-700 to-slate-800 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Prêt à optimiser votre gestion ?
            </h2>
            <p className="text-xl mb-8 text-slate-200">
              Rejoignez les professionnels qui font confiance à TransGestion pour gérer leur mobilité.
            </p>
            <button
              onClick={onGetStarted}
              className="px-8 py-4 bg-white text-slate-800 rounded-lg text-lg font-semibold hover:bg-slate-50 transition-all hover:shadow-xl"
            >
              Accéder au back-office
            </button>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2025 TransGestion. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-slate-50 p-8 rounded-xl hover:shadow-lg transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}
