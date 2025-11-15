import { useState, useEffect } from 'react';
import { Plus, Search, Truck, Users, Edit2, Trash2, X } from 'lucide-react';
import { apiService } from '../services/api';

interface Vehicule {
  id: number;
  plaque: string;
  type: string;
  capacite: number;
}

export function VehiclesView() {
  const [vehicles, setVehicles] = useState<Vehicule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicule | null>(null);

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
    (vehicle.plaque || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (vehicle.type || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (vehicle: Vehicule) => {
    setEditingVehicle(vehicle);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingVehicle(null);
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Véhicules</h1>
          <p className="text-slate-600 mt-1">
            Gérez le parc de véhicules et leur disponibilité
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nouveau véhicule
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
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onEdit={handleEdit}
              />
            ))
          )}
        </div>
      )}

      {showModal && (
        <VehicleModal
          vehicle={editingVehicle}
          onClose={() => setShowModal(false)}
          onSave={loadVehicles}
        />
      )}
    </div>
  );
}

interface VehicleCardProps {
  vehicle: Vehicule;
  onEdit: (vehicle: Vehicule) => void;
}

function VehicleCard({ vehicle, onEdit }: VehicleCardProps) {
  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'camion':
        return 'bg-blue-100 text-blue-700';
      case 'voiture':
        return 'bg-green-100 text-green-700';
      case 'van':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-green-100 rounded-lg">
          <Truck className="w-8 h-8 text-green-600" />
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(vehicle.type)}`}>
          {vehicle.type}
        </span>
      </div>

      <h3 className="text-xl font-semibold text-slate-900 mb-1">
        {vehicle.plaque}
      </h3>

      <div className="flex items-center gap-2 text-slate-600 text-sm mb-4">
        <Users className="w-4 h-4" />
        <span>Capacité: {vehicle.capacite} personnes</span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onEdit(vehicle)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
        >
          <Edit2 className="w-4 h-4" />
          Modifier
        </button>
      </div>
    </div>
  );
}

interface VehicleModalProps {
  vehicle: Vehicule | null;
  onClose: () => void;
  onSave: () => void;
}

function VehicleModal({ vehicle, onClose, onSave }: VehicleModalProps) {
  const [formData, setFormData] = useState({
    plaque: vehicle?.plaque || '',
    type: vehicle?.type || '',
    capacite: vehicle?.capacite || 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (vehicle) {
        await apiService.updateVehicule(vehicle.id, formData);
      } else {
        await apiService.createVehicule(formData);
      }
      onSave();
      onClose();
    } catch (err) {
      console.error('Failed to save vehicle:', err);
      setError('Erreur lors de l\'enregistrement du véhicule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">
            {vehicle ? 'Modifier Véhicule' : 'Nouveau Véhicule'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Plaque d'immatriculation
            </label>
            <input
              type="text"
              required
              value={formData.plaque}
              onChange={(e) => setFormData({ ...formData, plaque: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              placeholder="Ex: 12345-A-67"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Type de véhicule
            </label>
            <select
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            >
              <option value="">Sélectionner un type</option>
              <option value="Voiture">Voiture</option>
              <option value="Van">Van</option>
              <option value="Camion">Camion</option>
              <option value="Bus">Bus</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Capacité (nombre de personnes)
            </label>
            <input
              type="number"
              required
              min="1"
              max="50"
              value={formData.capacite}
              onChange={(e) => setFormData({ ...formData, capacite: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Enregistrement...' : (vehicle ? 'Mettre à jour' : 'Créer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}