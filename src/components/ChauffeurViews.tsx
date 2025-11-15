import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, UserCircle, X } from 'lucide-react';

interface Chauffeur {
  id: number;
  nom: string;
  prenom: string;
  username: string;
  password: string;
}

export function ChauffeursView() {
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingChauffeur, setEditingChauffeur] = useState<Chauffeur | null>(null);

  useEffect(() => {
    // TODO: Replace with actual API call
    // fetchChauffeurs();
    setTimeout(() => {
      setChauffeurs([
        {
          id: 1,
          nom: 'Idrissi',
          prenom: 'Hassan',
          username: 'hidrissi',
          password: '',
        },
        {
          id: 2,
          nom: 'Chakir',
          prenom: 'Rachid',
          username: 'rchakir',
          password: '',
        },
        {
          id: 3,
          nom: 'Mansouri',
          prenom: 'Said',
          username: 'smansouri',
          password: '',
        },
        {
          id: 4,
          nom: 'Bennani',
          prenom: 'Omar',
          username: 'obennani',
          password: '',
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const filteredChauffeurs = chauffeurs.filter(
    (chauffeur) =>
      chauffeur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chauffeur.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chauffeur.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (chauffeur: Chauffeur) => {
    setEditingChauffeur(chauffeur);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce chauffeur ?')) {
      // TODO: API call to delete chauffeur
      setChauffeurs(chauffeurs.filter((chauffeur) => chauffeur.id !== id));
    }
  };

  const handleAddNew = () => {
    setEditingChauffeur(null);
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Chauffeurs</h1>
          <p className="text-slate-600 mt-1">
            Gérez les chauffeurs affectés aux missions
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nouveau Chauffeur
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un chauffeur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700"></div>
          <p className="mt-4 text-slate-600">Chargement des chauffeurs...</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredChauffeurs.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl shadow-sm p-12 text-center">
              <UserCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">Aucun chauffeur trouvé</p>
            </div>
          ) : (
            filteredChauffeurs.map((chauffeur) => (
              <ChauffeurCard
                key={chauffeur.id}
                chauffeur={chauffeur}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      )}

      {showModal && (
        <ChauffeurModal
          chauffeur={editingChauffeur}
          onClose={() => setShowModal(false)}
          onSave={(chauffeur) => {
            if (editingChauffeur) {
              // Update existing chauffeur
              setChauffeurs(
                chauffeurs.map((c) => (c.id === chauffeur.id ? chauffeur : c))
              );
            } else {
              // Add new chauffeur
              setChauffeurs([...chauffeurs, { ...chauffeur, id: Date.now() }]);
            }
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}

interface ChauffeurCardProps {
  chauffeur: Chauffeur;
  onEdit: (chauffeur: Chauffeur) => void;
  onDelete: (id: number) => void;
}

function ChauffeurCard({ chauffeur, onEdit, onDelete }: ChauffeurCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-orange-100 rounded-lg">
          <UserCircle className="w-8 h-8 text-orange-600" />
        </div>
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
          Disponible
        </span>
      </div>

      <h3 className="text-xl font-semibold text-slate-900 mb-1">
        {chauffeur.prenom} {chauffeur.nom}
      </h3>
      <p className="text-slate-600 text-sm mb-4">@{chauffeur.username}</p>

      <div className="flex gap-2">
        <button
          onClick={() => onEdit(chauffeur)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
        >
          <Edit2 className="w-4 h-4" />
          Modifier
        </button>
        <button
          onClick={() => onDelete(chauffeur.id)}
          className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

interface ChauffeurModalProps {
  chauffeur: Chauffeur | null;
  onClose: () => void;
  onSave: (chauffeur: Chauffeur) => void;
}

function ChauffeurModal({ chauffeur, onClose, onSave }: ChauffeurModalProps) {
  const [formData, setFormData] = useState<Chauffeur>(
    chauffeur || {
      id: 0,
      nom: '',
      prenom: '',
      username: '',
      password: '',
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
            {chauffeur ? 'Modifier Chauffeur' : 'Nouveau Chauffeur'}
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
              Mot de passe {chauffeur && '(laisser vide pour ne pas changer)'}
            </label>
            <input
              type="password"
              required={!chauffeur}
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
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
              {chauffeur ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}