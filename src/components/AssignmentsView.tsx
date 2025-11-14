import { useState, useEffect } from 'react';
import { Plus, Search, Calendar, User, Truck, MapPin } from 'lucide-react';
import { apiService } from '../services/api';
import type { Affectation } from '../types';

export function AssignmentsView() {
  const [assignments, setAssignments] = useState<Affectation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAffectations();
      setAssignments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load assignments:', error);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssignments = assignments.filter((assignment) =>
    assignment.id.toString().includes(searchTerm)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Affectations</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors">
          <Plus className="w-5 h-5" />
          <span>Nouvelle affectation</span>
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
              <User className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">Aucune affectation trouvée</p>
            </div>
          ) : (
            filteredAssignments.map((assignment) => (
              <AssignmentCard key={assignment.id} assignment={assignment} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

interface AssignmentCardProps {
  assignment: Affectation;
}

function AssignmentCard({ assignment }: AssignmentCardProps) {
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
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-xl font-semibold text-slate-900">
              Affectation #{assignment.id}
            </h3>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              Active
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-600">
                <User className="w-5 h-5" />
                <div>
                  <p className="text-xs text-slate-500">Chauffeur</p>
                  <p className="font-medium text-slate-900">À charger</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-600">
                <Truck className="w-5 h-5" />
                <div>
                  <p className="text-xs text-slate-500">Véhicule</p>
                  <p className="font-medium text-slate-900">À charger</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="w-5 h-5" />
                <div>
                  <p className="text-xs text-slate-500">Mission</p>
                  <p className="font-medium text-slate-900">À charger</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="w-5 h-5" />
                <div>
                  <p className="text-xs text-slate-500">Date</p>
                  <p className="font-medium text-slate-900">{formatDate(assignment.date)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 ml-4">
          <button className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium">
            Modifier
          </button>
          <button className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-sm font-medium">
            Détails
          </button>
        </div>
      </div>
    </div>
  );
}
