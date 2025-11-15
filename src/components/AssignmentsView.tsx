import { useState, useEffect } from 'react';
import { Plus, Search, Calendar, User, Truck, MapPin, X, Trash2 } from 'lucide-react';
import { apiService } from '../services/api';

interface Affectation {
  id: number;
  date: string;
}

interface ChefGarage {
  id: number;
  nom: string;
  prenom: string;
}

interface Chauffeur {
  id: number;
  nom: string;
  prenom: string;
}

interface Vehicule {
  id: number;
  plaque: string;
  type: string;
}

interface Mission {
  id: number;
  titre: string;
  destination: string;
}

export function AssignmentsView() {
  const [assignments, setAssignments] = useState<Affectation[]>([]);
  const [chefGarages, setChefGarages] = useState<ChefGarage[]>([]);
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [vehicules, setVehicules] = useState<Vehicule[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [affectationsData, chefsData, chauffeursData, vehiculesData, missionsData] = await Promise.all([
        apiService.getAffectations(),
        apiService.getChefGarages(),
        apiService.getChauffeurs(),
        apiService.getAllVehicules(),
        apiService.getAllMissions(),
      ]);

      setAssignments(Array.isArray(affectationsData) ? affectationsData : []);
      setChefGarages(Array.isArray(chefsData) ? chefsData : []);
      setChauffeurs(Array.isArray(chauffeursData) ? chauffeursData : []);
      setVehicules(Array.isArray(vehiculesData) ? vehiculesData : []);
      setMissions(Array.isArray(missionsData) ? missionsData : []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette affectation ?')) {
      return;
    }

    try {
      await apiService.deleteAffectation(id);
      setAssignments(assignments.filter((assignment) => assignment.id !== id));
    } catch (error) {
      console.error('Failed to delete assignment:', error);
      alert('Erreur lors de la suppression de l\'affectation');
    }
  };

  const filteredAssignments = assignments.filter((assignment) =>
    assignment.id.toString().includes(searchTerm)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Affectations</h1>
          <p className="text-slate-600 mt-1">
            Gérez les affectations de chauffeurs et véhicules aux missions
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nouvelle affectation
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher une affectation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700"></div>
          <p className="mt-4 text-slate-600">Chargement des affectations...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredAssignments.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">Aucune affectation trouvée</p>
            </div>
          ) : (
            filteredAssignments.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      )}

      {showModal && (
        <AssignmentModal
          chefGarages={chefGarages}
          chauffeurs={chauffeurs}
          vehicules={vehicules}
          missions={missions}
          onClose={() => setShowModal(false)}
          onSave={loadAll}
        />
      )}
    </div>
  );
}

interface AssignmentCardProps {
  assignment: Affectation;
  onDelete: (id: number) => void;
}

function AssignmentCard({ assignment, onDelete }: AssignmentCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-xl font-semibold text-slate-900">Affectation #{assignment.id}</h3>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              Active
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-600 text-sm">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(assignment.date)}</span>
          </div>
        </div>

        <button
          onClick={() => onDelete(assignment.id)}
          className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

interface AssignmentModalProps {
  chefGarages: ChefGarage[];
  chauffeurs: Chauffeur[];
  vehicules: Vehicule[];
  missions: Mission[];
  onClose: () => void;
  onSave: () => void;
}

function AssignmentModal({ chefGarages, chauffeurs, vehicules, missions, onClose, onSave }: AssignmentModalProps) {
  const [formData, setFormData] = useState({
    chefId: '',
    chauffeurId: '',
    vehiculeId: '',
    missionId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiService.createAffectation(
        parseInt(formData.chefId),
        parseInt(formData.chauffeurId),
        parseInt(formData.vehiculeId),
        parseInt(formData.missionId)
      );
      onSave();
      onClose();
    } catch (err) {
      console.error('Failed to create assignment:', err);
      setError('Erreur lors de la création de l\'affectation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">
            Nouvelle Affectation
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
              Chef de Garage
            </label>
            <select
              required
              value={formData.chefId}
              onChange={(e) => setFormData({ ...formData, chefId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            >
              <option value="">Sélectionner un chef de garage</option>
              {chefGarages.map((chef) => (
                <option key={chef.id} value={chef.id}>
                  {chef.prenom} {chef.nom}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Chauffeur
            </label>
            <select
              required
              value={formData.chauffeurId}
              onChange={(e) => setFormData({ ...formData, chauffeurId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            >
              <option value="">Sélectionner un chauffeur</option>
              {chauffeurs.map((chauffeur) => (
                <option key={chauffeur.id} value={chauffeur.id}>
                  {chauffeur.prenom} {chauffeur.nom}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Véhicule
            </label>
            <select
              required
              value={formData.vehiculeId}
              onChange={(e) => setFormData({ ...formData, vehiculeId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            >
              <option value="">Sélectionner un véhicule</option>
              {vehicules.map((vehicule) => (
                <option key={vehicule.id} value={vehicule.id}>
                  {vehicule.plaque} - {vehicule.type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Mission
            </label>
            <select
              required
              value={formData.missionId}
              onChange={(e) => setFormData({ ...formData, missionId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            >
              <option value="">Sélectionner une mission</option>
              {missions.map((mission) => (
                <option key={mission.id} value={mission.id}>
                  {mission.titre} - {mission.destination}
                </option>
              ))}
            </select>
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
              {loading ? 'Création...' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}