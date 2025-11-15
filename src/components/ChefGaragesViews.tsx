import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Wrench, X } from 'lucide-react';
import { apiService } from '../services/api';

interface ChefGarage {
  id: number;
  nom: string;
  prenom: string;
  username: string;
  password: string;
}

export function ChefGaragesView() {
  const [chefGarages, setChefGarages] = useState<ChefGarage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingChefGarage, setEditingChefGarage] = useState<ChefGarage | null>(null);

  useEffect(() => {
    loadChefGarages();
  }, []);

  const loadChefGarages = async () => {
    try {
      setLoading(true);
      const data = await apiService.getChefGarages();
      setChefGarages(data);
    } catch (error) {
      console.error('Failed to load chef garages:', error);
      setChefGarages([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredChefGarages = chefGarages.filter(
    (chef) =>
      (chef.nom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (chef.prenom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (chef.username || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (chef: ChefGarage) => {
    setEditingChefGarage(chef);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce chef de garage ?')) {
      return;
    }

    try {
      await apiService.deleteChefGarage(id);
      setChefGarages(chefGarages.filter((chef) => chef.id !== id));
    } catch (error) {
      console.error('Failed to delete chef garage:', error);
      alert('Erreur lors de la suppression du chef de garage');
    }
  };

  const handleAddNew = () => {
    setEditingChefGarage(null);
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Chefs de Garage</h1>
          <p className="text-slate-600 mt-1">
            Gérez les responsables de garage et maintenance
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nouveau Chef de Garage
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un chef de garage..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700"></div>
          <p className="mt-4 text-slate-600">Chargement des chefs de garage...</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChefGarages.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl shadow-sm p-12 text-center">
              <Wrench className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">Aucun chef de garage trouvé</p>
            </div>
          ) : (
            filteredChefGarages.map((chef) => (
              <ChefGarageCard
                key={chef.id}
                chefGarage={chef}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      )}

      {showModal && (
        <ChefGarageModal
          chefGarage={editingChefGarage}
          onClose={() => setShowModal(false)}
          onSave={loadChefGarages}
        />
      )}
    </div>
  );
}

interface ChefGarageCardProps {
  chefGarage: ChefGarage;
  onEdit: (chef: ChefGarage) => void;
  onDelete: (id: number) => void;
}

function ChefGarageCard({ chefGarage, onEdit, onDelete }: ChefGarageCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-amber-100 rounded-lg">
          <Wrench className="w-8 h-8 text-amber-600" />
        </div>
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
          Actif
        </span>
      </div>

      <h3 className="text-xl font-semibold text-slate-900 mb-1">
        {chefGarage.prenom} {chefGarage.nom}
      </h3>
      <p className="text-slate-600 text-sm mb-4">@{chefGarage.username}</p>

      <div className="flex gap-2">
        <button
          onClick={() => onEdit(chefGarage)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
        >
          <Edit2 className="w-4 h-4" />
          Modifier
        </button>
        <button
          onClick={() => onDelete(chefGarage.id)}
          className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

interface ChefGarageModalProps {
  chefGarage: ChefGarage | null;
  onClose: () => void;
  onSave: () => void;
}

function ChefGarageModal({ chefGarage, onClose, onSave }: ChefGarageModalProps) {
  const [formData, setFormData] = useState<ChefGarage>(
    chefGarage || {
      id: 0,
      nom: '',
      prenom: '',
      username: '',
      password: '',
    }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (chefGarage) {
        // Update existing chef garage
        const updateData: any = {
          nom: formData.nom,
          prenom: formData.prenom,
          username: formData.username,
        };
        
        // Only include password if it was changed
        if (formData.password) {
          updateData.password = formData.password;
        }
        
        await apiService.updateChefGarage(chefGarage.id, updateData);
      } else {
        // Create new chef garage
        await apiService.createChefGarage(formData);
      }
      onSave();
      onClose();
    } catch (err) {
      console.error('Failed to save chef garage:', err);
      setError('Erreur lors de l\'enregistrement du chef de garage');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">
            {chefGarage ? 'Modifier Chef de Garage' : 'Nouveau Chef de Garage'}
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
              Mot de passe {chefGarage && '(laisser vide pour ne pas changer)'}
            </label>
            <input
              type="password"
              required={!chefGarage}
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
              {loading ? 'Enregistrement...' : (chefGarage ? 'Mettre à jour' : 'Créer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}