import { useState, useEffect } from 'react';
import { Search, FileText, Calendar, Plus, X } from 'lucide-react';
import { apiService } from '../services/api';

interface Rapport {
  id: number;
  titre: string;
  texte: string;
  date: string;
}

interface Affectation {
  id: number;
  date: string;
}

export function ReportsView() {
  const [reports, setReports] = useState<any[]>([]);
  const [affectations, setAffectations] = useState<Affectation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const affectationsData = await apiService.getAffectations();
      setAffectations(Array.isArray(affectationsData) ? affectationsData : []);
      
      // For now, we'll use mock data since there's no get reports endpoint
      setReports([]);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter((report) =>
    (report.titre || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Rapports</h1>
          <p className="text-slate-600 mt-1">
            Gérez les rapports de mission et d'affectation
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nouveau rapport
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un rapport..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700"></div>
          <p className="mt-4 text-slate-600">Chargement des rapports...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredReports.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">Aucun rapport trouvé</p>
              <p className="text-slate-500 text-sm mt-2">
                Créez votre premier rapport pour commencer
              </p>
            </div>
          ) : (
            filteredReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))
          )}
        </div>
      )}

      {showModal && (
        <ReportModal
          affectations={affectations}
          onClose={() => setShowModal(false)}
          onSave={loadData}
        />
      )}
    </div>
  );
}

interface ReportCardProps {
  report: any;
}

function ReportCard({ report }: ReportCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="w-5 h-5 text-slate-600" />
            <h3 className="text-xl font-semibold text-slate-900">{report.titre}</h3>
          </div>

          <p className="text-slate-600 mb-3 line-clamp-2">{report.texte}</p>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(report.date)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ReportModalProps {
  affectations: Affectation[];
  onClose: () => void;
  onSave: () => void;
}

function ReportModal({ affectations, onClose, onSave }: ReportModalProps) {
  const [formData, setFormData] = useState({
    titre: '',
    texte: '',
    affectationId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const reportData = {
        titre: formData.titre,
        texte: formData.texte,
        date: new Date().toISOString(),
      };

      await apiService.createRapport(parseInt(formData.affectationId), reportData);
      onSave();
      onClose();
    } catch (err) {
      console.error('Failed to create report:', err);
      setError('Erreur lors de la création du rapport');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">
            Nouveau Rapport
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
              Affectation
            </label>
            <select
              required
              value={formData.affectationId}
              onChange={(e) => setFormData({ ...formData, affectationId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            >
              <option value="">Sélectionner une affectation</option>
              {affectations.map((affectation) => (
                <option key={affectation.id} value={affectation.id}>
                  Affectation #{affectation.id} - {new Date(affectation.date).toLocaleDateString('fr-FR')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Titre du rapport
            </label>
            <input
              type="text"
              required
              value={formData.titre}
              onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              placeholder="Ex: Rapport de mission Casablanca"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Contenu du rapport
            </label>
            <textarea
              required
              value={formData.texte}
              onChange={(e) => setFormData({ ...formData, texte: e.target.value })}
              rows={8}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none"
              placeholder="Décrivez en détail le déroulement de la mission, les observations et les recommandations..."
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
              {loading ? 'Création...' : 'Créer le rapport'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}