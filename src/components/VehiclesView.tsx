import { useState, useEffect } from 'react';
import { Plus, Search, Truck, Users } from 'lucide-react';
import { apiService } from '../services/api';
import type { Vehicule } from '../types';

export function VehiclesView() {
  const [vehicles, setVehicles] = useState<Vehicule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAllVehicules();
      setVehicles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load vehicles:', error);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredVehicles = vehicles.filter((vehicle) =>
    vehicle.plaque.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Véhicules</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors">
          <Plus className="w-5 h-5" />
          <span>Nouveau véhicule</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par plaque ou type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700"></div>
          <p className="mt-4 text-slate-600">Chargement des véhicules...</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl shadow-sm p-12 text-center">
              <Truck className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">Aucun véhicule trouvé</p>
            </div>
          ) : (
            filteredVehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

interface VehicleCardProps {
  vehicle: Vehicule;
}

function VehicleCard({ vehicle }: VehicleCardProps) {
  const getVehicleIcon = (type: string) => {
    return <Truck className="w-12 h-12 text-slate-600" />;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-slate-100 rounded-lg">
          {getVehicleIcon(vehicle.type)}
        </div>
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
          Disponible
        </span>
      </div>

      <h3 className="text-xl font-semibold text-slate-900 mb-2">
        {vehicle.plaque}
      </h3>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Type</span>
          <span className="font-medium text-slate-900">{vehicle.type}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Capacité</span>
          <span className="flex items-center gap-1 font-medium text-slate-900">
            <Users className="w-4 h-4" />
            {vehicle.capacite}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium">
          Modifier
        </button>
        <button className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-sm font-medium">
          Détails
        </button>
      </div>
    </div>
  );
}
