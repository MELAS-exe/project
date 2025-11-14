import { useState } from 'react';
import { Search, FileText, Calendar, User } from 'lucide-react';

export function ReportsView() {
  const [searchTerm, setSearchTerm] = useState('');

  const reports = [
    {
      id: 1,
      titre: 'Rapport Mission Casablanca',
      date: '2025-11-13T10:00:00',
      author: 'Mohammed Alami',
    },
    {
      id: 2,
      titre: 'Rapport Transport Rabat',
      date: '2025-11-12T14:30:00',
      author: 'Fatima Zahra',
    },
    {
      id: 3,
      titre: 'Rapport Livraison Tanger',
      date: '2025-11-11T09:15:00',
      author: 'Ahmed Benali',
    },
  ];

  const filteredReports = reports.filter((report) =>
    report.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Rapports</h1>
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

      <div className="grid gap-4">
        {filteredReports.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">Aucun rapport trouvé</p>
          </div>
        ) : (
          filteredReports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))
        )}
      </div>
    </div>
  );
}

interface ReportCardProps {
  report: {
    id: number;
    titre: string;
    date: string;
    author: string;
  };
}

function ReportCard({ report }: ReportCardProps) {
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
        <div className="flex items-start gap-4 flex-1">
          <div className="p-3 bg-slate-100 rounded-lg">
            <FileText className="w-8 h-8 text-slate-600" />
          </div>

          <div className="flex-1">
            <h3 className="text-xl font-semibold text-slate-900 mb-3">
              {report.titre}
            </h3>

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{report.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(report.date)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 ml-4">
          <button className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium">
            Télécharger
          </button>
          <button className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-sm font-medium">
            Voir
          </button>
        </div>
      </div>
    </div>
  );
}
