import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Shield, X } from 'lucide-react';
import { apiService } from '../services/api';

interface Admin {
  id: number;
  username: string;
  password: string;
  prenom: string;
  nom: string;
  role: string;
}

export function AdminsView() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAdmins();
      setAdmins(data);
    } catch (error) {
      console.error('Failed to load admins:', error);
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredAdmins = admins.filter(
    (admin) =>
      (admin.nom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (admin.prenom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (admin.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (admin.role || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (admin: Admin) => {
    setEditingAdmin(admin);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet administrateur ?')) {
      return;
    }
    
    try {
      await apiService.deleteAdmin(id);
      setAdmins(admins.filter((admin) => admin.id !== id));
    } catch (error) {
      console.error('Failed to delete admin:', error);
      alert('Erreur lors de la suppression de l\'administrateur');
    }
  };

  const handleAddNew = () => {
    setEditingAdmin(null);
    setShowModal(true);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-100 text-purple-700';
      case 'ADMIN':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Administrateurs</h1>
          <p className="text-slate-600 mt-1">
            Gérez les comptes administrateurs du système
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nouvel Admin
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un administrateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700"></div>
          <p className="mt-4 text-slate-600">Chargement des administrateurs...</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAdmins.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl shadow-sm p-12 text-center">
              <Shield className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">Aucun administrateur trouvé</p>
            </div>
          ) : (
            filteredAdmins.map((admin) => (
              <AdminCard
                key={admin.id}
                admin={admin}
                onEdit={handleEdit}
                onDelete={handleDelete}
                getRoleBadgeColor={getRoleBadgeColor}
              />
            ))
          )}
        </div>
      )}

      {showModal && (
        <AdminModal
          admin={editingAdmin}
          onClose={() => setShowModal(false)}
          onSave={loadAdmins}
        />
      )}
    </div>
  );
}

interface AdminCardProps {
  admin: Admin;
  onEdit: (admin: Admin) => void;
  onDelete: (id: number) => void;
  getRoleBadgeColor: (role: string) => string;
}

function AdminCard({ admin, onEdit, onDelete, getRoleBadgeColor }: AdminCardProps) {
  const roleDisplay = admin.role ? admin.role.replace('_', ' ') : 'N/A';
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-slate-100 rounded-lg">
          <Shield className="w-8 h-8 text-slate-600" />
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(admin.role || '')}`}>
          {roleDisplay}
        </span>
      </div>

      <h3 className="text-xl font-semibold text-slate-900 mb-1">
        {admin.prenom} {admin.nom}
      </h3>
      <p className="text-slate-600 text-sm mb-4">@{admin.username}</p>

      <div className="flex gap-2">
        <button
          onClick={() => onEdit(admin)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
        >
          <Edit2 className="w-4 h-4" />
          Modifier
        </button>
        <button
          onClick={() => onDelete(admin.id)}
          className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

interface AdminModalProps {
  admin: Admin | null;
  onClose: () => void;
  onSave: () => void;
}

function AdminModal({ admin, onClose, onSave }: AdminModalProps) {
  const [formData, setFormData] = useState<Admin>(
    admin || {
      id: 0,
      username: '',
      password: '',
      prenom: '',
      nom: '',
      role: 'ADMIN',
    }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (admin) {
        // Update existing admin
        const updateData: any = {
          username: formData.username,
          prenom: formData.prenom,
          nom: formData.nom,
          role: formData.role,
        };
        
        // Only include password if it was changed
        if (formData.password) {
          updateData.password = formData.password;
        }
        
        await apiService.updateAdmin(admin.id, updateData);
      } else {
        // Create new admin
        await apiService.createAdmin(formData);
      }
      onSave();
      onClose();
    } catch (err) {
      console.error('Failed to save admin:', err);
      setError('Erreur lors de l\'enregistrement de l\'administrateur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">
            {admin ? 'Modifier Admin' : 'Nouvel Admin'}
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
              Mot de passe {admin && '(laisser vide pour ne pas changer)'}
            </label>
            <input
              type="password"
              required={!admin}
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Rôle
            </label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            >
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
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
              {loading ? 'Enregistrement...' : (admin ? 'Mettre à jour' : 'Créer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}