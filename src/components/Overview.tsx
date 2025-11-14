import { MapPin, Truck, Users, CheckCircle } from 'lucide-react';

export function Overview() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Tableau de bord</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<MapPin className="w-8 h-8 text-blue-600" />}
          title="Missions"
          value="24"
          subtitle="dont 8 en cours"
          bgColor="bg-blue-50"
        />
        <StatCard
          icon={<Truck className="w-8 h-8 text-green-600" />}
          title="Véhicules"
          value="12"
          subtitle="disponibles"
          bgColor="bg-green-50"
        />
        <StatCard
          icon={<Users className="w-8 h-8 text-orange-600" />}
          title="Affectations"
          value="18"
          subtitle="actives"
          bgColor="bg-orange-50"
        />
        <StatCard
          icon={<CheckCircle className="w-8 h-8 text-slate-600" />}
          title="Rapports"
          value="45"
          subtitle="ce mois"
          bgColor="bg-slate-50"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            Missions récentes
          </h2>
          <div className="space-y-3">
            <MissionItem
              title="Transport Casablanca - Rabat"
              status="En cours"
              date="14 Nov 2025"
              statusColor="text-blue-600"
            />
            <MissionItem
              title="Livraison Tanger"
              status="Validée"
              date="13 Nov 2025"
              statusColor="text-green-600"
            />
            <MissionItem
              title="Transport Marrakech"
              status="Planifiée"
              date="15 Nov 2025"
              statusColor="text-orange-600"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            Activités récentes
          </h2>
          <div className="space-y-3">
            <ActivityItem
              action="Nouvelle mission créée"
              user="Ahmed Benali"
              time="Il y a 2h"
            />
            <ActivityItem
              action="Véhicule ajouté au parc"
              user="Système"
              time="Il y a 4h"
            />
            <ActivityItem
              action="Affectation validée"
              user="Fatima Zahra"
              time="Il y a 6h"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  bgColor: string;
}

function StatCard({ icon, title, value, subtitle, bgColor }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className={`inline-flex p-3 rounded-lg ${bgColor} mb-4`}>
        {icon}
      </div>
      <h3 className="text-sm font-medium text-slate-600 mb-1">{title}</h3>
      <p className="text-3xl font-bold text-slate-900 mb-1">{value}</p>
      <p className="text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}

interface MissionItemProps {
  title: string;
  status: string;
  date: string;
  statusColor: string;
}

function MissionItem({ title, status, date, statusColor }: MissionItemProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
      <div>
        <p className="font-medium text-slate-900">{title}</p>
        <p className="text-sm text-slate-500">{date}</p>
      </div>
      <span className={`text-sm font-medium ${statusColor}`}>{status}</span>
    </div>
  );
}

interface ActivityItemProps {
  action: string;
  user: string;
  time: string;
}

function ActivityItem({ action, user, time }: ActivityItemProps) {
  return (
    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
      <div className="w-2 h-2 bg-slate-400 rounded-full mt-2" />
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-900">{action}</p>
        <p className="text-sm text-slate-600">{user}</p>
        <p className="text-xs text-slate-500 mt-1">{time}</p>
      </div>
    </div>
  );
}
