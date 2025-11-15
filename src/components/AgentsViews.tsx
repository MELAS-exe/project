import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, User, X, MapPin } from 'lucide-react';

interface Agent {
  id: number;
  prenom: string;
  nom: string;
  username: string;
  password: string;
  adresse: string;
}

export function AgentsView() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  useEffect(() => {
    // TODO: Replace with actual API call
    // fetchAgents();
    setTimeout(() => {
      setAgents([
        {
          id: 1,
          prenom: 'Youssef',
          nom: 'Benjelloun',
          username: 'ybenjelloun',
          password: '',
          adresse: '12 Rue Hassan II, Casablanca',
        },
        {
          id: 2,
          prenom: 'Amina',
          nom: 'El Fassi',
          username: 'aelfassi',
          password: '',
          adresse: '45 Avenue Mohammed V, Rabat',
        },
        {
          id: 3,
          prenom: 'Karim',
          nom: 'Tazi',
          username: 'ktazi',
          password: '',
          adresse: '78 Boulevard Zerktouni, Marrakech',
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const filteredAgents = agents.filter(
    (agent) =>
      agent.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.adresse.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (agent: Agent) => {
    setEditingAgent(agent);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet agent ?')) {
      // TODO: API call to delete agent
      setAgents(agents.filter((agent) => agent.id !== id));
    }
  };

  const handleAddNew = () => {
    setEditingAgent(null);
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Agents</h1>
          <p className="text-slate-600 mt-1">
            Gérez les agents responsables des missions
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nouvel Agent
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un agent..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700"></div>
          <p className="mt-4 text-slate-600">Chargement des agents...</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl shadow-sm p-12 text-center">
              <User className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">Aucun agent trouvé</p>
            </div>
          ) : (
            filteredAgents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      )}

      {showModal && (
        <AgentModal
          agent={editingAgent}
          onClose={() => setShowModal(false)}
          onSave={(agent) => {
            if (editingAgent) {
              // Update existing agent
              setAgents(
                agents.map((a) => (a.id === agent.id ? agent : a))
              );
            } else {
              // Add new agent
              setAgents([...agents, { ...agent, id: Date.now() }]);
            }
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}

interface AgentCardProps {
  agent: Agent;
  onEdit: (agent: Agent) => void;
  onDelete: (id: number) => void;
}

function AgentCard({ agent, onEdit, onDelete }: AgentCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-blue-100 rounded-lg">
          <User className="w-8 h-8 text-blue-600" />
        </div>
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
          Actif
        </span>
      </div>

      <h3 className="text-xl font-semibold text-slate-900 mb-1">
        {agent.prenom} {agent.nom}
      </h3>
      <p className="text-slate-600 text-sm mb-3">@{agent.username}</p>

      <div className="flex items-start gap-2 text-slate-600 mb-4">
        <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
        <p className="text-sm">{agent.adresse}</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onEdit(agent)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
        >
          <Edit2 className="w-4 h-4" />
          Modifier
        </button>
        <button
          onClick={() => onDelete(agent.id)}
          className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

interface AgentModalProps {
  agent: Agent | null;
  onClose: () => void;
  onSave: (agent: Agent) => void;
}

function AgentModal({ agent, onClose, onSave }: AgentModalProps) {
  const [formData, setFormData] = useState<Agent>(
    agent || {
      id: 0,
      prenom: '',
      nom: '',
      username: '',
      password: '',
      adresse: '',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">
            {agent ? 'Modifier Agent' : 'Nouvel Agent'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Prénom
              </label>
              <input
                type="text"
                required
                value={formData.prenom}
                onChange={(e) =>
                  setFormData({ ...formData, prenom: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nom
              </label>
              <input
                type="text"
                required
                value={formData.nom}
                onChange={(e) =>
                  setFormData({ ...formData, nom: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nom d'utilisateur
            </label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Mot de passe {agent && '(laisser vide pour ne pas changer)'}
            </label>
            <input
              type="password"
              required={!agent}
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Adresse
            </label>
            <textarea
              required
              value={formData.adresse}
              onChange={(e) =>
                setFormData({ ...formData, adresse: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              {agent ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}