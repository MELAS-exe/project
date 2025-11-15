import { useState, useEffect } from 'react';
import { Plus, Search, Calendar, MapPin, CheckCircle, Clock, Edit2, Trash2, X } from 'lucide-react';
import { apiService } from '../services/api';

interface Mission {
  id: number;
  titre: string;
  detail: string;
  date: string;
  destination: string;
  statut: boolean;
}

interface Agent {
  id: number;
  prenom: string;
  nom: string;
}

export function MissionsView() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'validated' | 'pending'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingMission, setEditingMission] = useState<Mission | null>(null);

  useEffect(() => {
    loadMissions();
    loadAgents();
  }, []);

  const loadMissions = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAllMissions();
      setMissions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load missions:', error);
      setMissions([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAgents = async () => {
    try {
      const data = await apiService.getAgents();
      setAgents(data);
    } catch (error) {
      console.error('Failed to load agents:', error);
      setAgents([]);
    }
  };

  const filteredMissions = missions.filter((mission) => {
    const matchesSearch =
      (mission.titre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mission.destination || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'validated') return matchesSearch && mission.statut;
    if (filterStatus === 'pending') return matchesSearch && !mission.statut;

    return matchesSearch;
  });

  const handleEdit = (mission: Mission) => {
    setEditingMission(mission);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette mission ?')) {
      return;
    }

    try {
      await apiService.deleteMission(id);
      setMissions(missions.filter((mission) => mission.id !== id));
    } catch (error) {
      console.error('Failed to delete mission:', error);
      alert('Erreur lors de la suppression de la mission');
    }
  };

  const handleValidate = async (id: number) => {
    try {
      await apiService.validateMission(id);
      loadMissions();
    } catch (error) {
      console.error('Failed to validate mission:', error);
      alert('Erreur lors de la validation de la mission');
    }
  };

  const handleAddNew = () => {
    setEditingMission(null);
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Missions</h1>
          <p className="text-slate-600 mt-1">
            Gérez les missions et leurs affectations
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nouvelle mission
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher une mission..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Toutes
            </button>
            <button
              onClick={() => setFilterStatus('validated')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'validated'
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Validées
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'pending'
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              En attente
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700"></div>
          <p className="mt-4 text-slate-600">Chargement des missions...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredMissions.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">Aucune mission trouvée</p>
            </div>
          ) : (
            filteredMissions.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onValidate={handleValidate}
              />
            ))
          )}
        </div>
      )}

      {showModal && (
        <MissionModal
          mission={editingMission}
          agents={agents}
          onClose={() => setShowModal(false)}
          onSave={loadMissions}
        />
      )}
    </div>
  );
}

interface MissionCardProps {
  mission: Mission;
  onEdit: (mission: Mission) => void;
  onDelete: (id: number) => void;
  onValidate: (id: number) => void;
}

function MissionCard({ mission, onEdit, onDelete, onValidate }: MissionCardProps) {
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
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-xl font-semibold text-slate-900">{mission.titre}</h3>
            {mission.statut ? (
              <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                Validée
              </span>
            ) : (
              <span className="flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                <Clock className="w-4 h-4" />
                En attente
              </span>
            )}
          </div>

          <p className="text-slate-600 mb-4">{mission.detail}</p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{mission.destination}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(mission.date)}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 ml-4">
          {!mission.statut && (
            <button
              onClick={() => onValidate(mission.id)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              Valider
            </button>
          )}
          <button
            onClick={() => onEdit(mission)}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(mission.id)}
            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface MissionModalProps {
  mission: Mission | null;
  agents: Agent[];
  onClose: () => void;
  onSave: () => void;
}

function MissionModal({ mission, agents, onClose, onSave }: MissionModalProps) {
  const [formData, setFormData] = useState({
    titre: mission?.titre || '',
    detail: mission?.detail || '',
    date: mission?.date ? mission.date.substring(0, 16) : '',
    destination: mission?.destination || '',
    agentId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const missionData = {
        titre: formData.titre,
        detail: formData.detail,
        date: new Date(formData.date).toISOString(),
        destination: formData.destination,
        statut: false,
      };

      if (mission) {
        await apiService.updateMission(mission.id, missionData);
      } else {
        if (!formData.agentId) {
          setError('Veuillez sélectionner un agent');
          setLoading(false);
          return;
        }
        await apiService.createMission(parseInt(formData.agentId), missionData);
      }
      onSave();
      onClose();
    } catch (err) {
      console.error('Failed to save mission:', err);
      setError('Erreur lors de l\'enregistrement de la mission');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">
            {mission ? 'Modifier Mission' : 'Nouvelle Mission'}
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
              Titre
            </label>
            <input
              type="text"
              required
              value={formData.titre}
              onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Détails
            </label>
            <textarea
              required
              value={formData.detail}
              onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Destination
            </label>
            <input
              type="text"
              required
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Date et heure
            </label>
            <input
              type="datetime-local"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
          </div>

          {!mission && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Agent
              </label>
              <select
                required
                value={formData.agentId}
                onChange={(e) => setFormData({ ...formData, agentId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              >
                <option value="">Sélectionner un agent</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.prenom} {agent.nom}
                  </option>
                ))}
              </select>
            </div>
          )}

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
              {loading ? 'Enregistrement...' : (mission ? 'Mettre à jour' : 'Créer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}