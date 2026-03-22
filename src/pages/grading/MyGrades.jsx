import { useState, useEffect } from 'react';
import { gradingService } from '../../services/gradingService';
import { ClipboardList } from 'lucide-react';

const REMARKS_STYLE = {
  PASSED:      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  CONDITIONAL: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  FAILED:      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  INC:         'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
  DROPPED:     'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500',
};

function gradeColor(g) {
  if (g == null) return 'text-zinc-400';
  if (g <= 2.00) return 'text-emerald-600 dark:text-emerald-400';
  if (g <= 3.00) return 'text-blue-600 dark:text-blue-400';
  if (g === 4.00) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

export default function MyGrades() {
  const [grades,  setGrades]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    gradingService.getMyGrades()
      .then((r) => setGrades(r.data))
      .finally(() => setLoading(false));
  }, []);

  const passed = grades.filter((g) => g.remarks === 'PASSED').length;
  const validGrades = grades
    .map((g) => g.transmutedGrade)
    .filter((v) => v != null);
  const gwa = validGrades.length > 0
    ? (validGrades.reduce((a, b) => a + b, 0) / validGrades.length).toFixed(2)
    : null;

  function gwaColor(v) {
    if (v == null) return 'text-zinc-400';
    const n = parseFloat(v);
    if (n <= 2.00) return 'text-emerald-600 dark:text-emerald-400';
    if (n <= 3.00) return 'text-blue-600 dark:text-blue-400';
    return 'text-red-600 dark:text-red-400';
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <ClipboardList size={22} className="text-blue-600" />
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            My Grades
          </h1>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 ml-9">
          Your academic performance this term
        </p>
      </div>

      {/* Summary stats */}
      {!loading && grades.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            {
              label: 'Subjects enrolled',
              value: grades.length,
              color: 'text-zinc-900 dark:text-zinc-100',
            },
            {
              label: 'Subjects passed',
              value: passed,
              color: 'text-emerald-600 dark:text-emerald-400',
            },
            {
              label: 'GWA',
              value: gwa ?? '—',
              color: gwaColor(gwa),
            },
          ].map((stat) => (
            <div key={stat.label}
              className="bg-white dark:bg-zinc-900 border border-zinc-200
                         dark:border-zinc-800 rounded-2xl p-5">
              <p className="text-xs font-medium uppercase tracking-wide
                            text-zinc-400 mb-1">
                {stat.label}
              </p>
              <p className={`text-2xl font-semibold font-mono ${stat.color}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200
                        dark:border-zinc-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              {Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b border-zinc-100 dark:border-zinc-800">
                  {Array.from({ length: 6 }).map((__, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="animate-pulse bg-zinc-100 dark:bg-zinc-800
                                      rounded h-5 w-full" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty state */}
      {!loading && grades.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <ClipboardList size={40}
            className="text-zinc-300 dark:text-zinc-600 mb-4" />
          <p className="text-base font-medium text-zinc-500">No grades available yet</p>
          <p className="text-sm text-zinc-400 mt-1">
            Your instructor has not entered any grades for you yet.
          </p>
        </div>
      )}

      {/* Grades table */}
      {!loading && grades.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200
                        dark:border-zinc-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/60 border-b
                               border-zinc-200 dark:border-zinc-800">
                  {['Subject','Code','Instructor','Year & Section',
                    'Grade','Remarks'].map((h) => (
                    <th key={h}
                      className="px-5 py-3.5 text-left text-xs font-semibold
                                 uppercase tracking-wide text-zinc-400 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grades.map((g) => {
                  const remarks = g.remarks ?? 'INC';
                  return (
                    <tr key={g.id}
                      className="border-b border-zinc-100 dark:border-zinc-800
                                 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/60
                                 transition-colors">
                      <td className="px-5 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                        {g.subject.name}
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs bg-blue-50 dark:bg-blue-900/30
                                         text-blue-700 dark:text-blue-400 px-2 py-0.5
                                         rounded-lg">
                          {g.subject.code}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-zinc-500">
                        {g.subject.instructor?.fullName || g.subject.instructor?.name || '—'}
                      </td>
                      <td className="px-5 py-4 text-zinc-500">{g.subject.yearSection}</td>
                      <td className={`px-5 py-4 text-base font-semibold font-mono
                                      ${gradeColor(g.transmutedGrade)}`}>
                        {g.transmutedGrade != null ? g.transmutedGrade.toFixed(2) : '—'}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                                         uppercase tracking-wide ${REMARKS_STYLE[remarks]}`}>
                          {remarks}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
