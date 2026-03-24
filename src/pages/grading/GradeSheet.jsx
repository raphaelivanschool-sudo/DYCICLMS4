import { useState, useEffect } from 'react';
import { gradingService } from '../../services/gradingService';
import { previewGrade } from '../../utils/gradeComputer';
import {
  Users, Save, Loader2, AlertCircle, ClipboardList
} from 'lucide-react';

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

export default function GradeSheet() {
  const [subjects,     setSubjects]     = useState([]);
  const [selected,     setSelected]     = useState(null);
  const [grades,       setGrades]       = useState([]);
  const [edits,        setEdits]        = useState({});
  const [saving,       setSaving]       = useState(false);
  const [saved,        setSaved]        = useState(false);
  const [loadingGrades,setLoadingGrades]= useState(false);

  useEffect(() => {
    gradingService.getSubjects().then((r) => setSubjects(r.data));
  }, []);

  async function loadGrades(subjectId) {
    setLoadingGrades(true);
    try {
      const { data } = await gradingService.getGradesForSubject(subjectId);
      setGrades(data);
      setEdits({});
      setSaved(false);
    } finally {
      setLoadingGrades(false);
    }
  }

  function handleEdit(gradeId, field, value) {
    setEdits((prev) => ({
      ...prev,
      [gradeId]: { ...prev[gradeId], [field]: value },
    }));
  }

  function getPreview(grade) {
    const e = edits[grade.id] || {};
    const prelim     = e.prelim     ?? grade.prelim;
    const midterm    = e.midterm    ?? grade.midterm;
    const semiFinals = e.semiFinals ?? grade.semiFinals;
    const finals     = e.finals     ?? grade.finals;
    if ((e.remarks ?? grade.remarks) === 'DROPPED') {
      return { transmutedGrade: grade.transmutedGrade ?? null, remarks: 'DROPPED' };
    }
    return previewGrade(prelim, midterm, semiFinals, finals);
  }

  async function handleSaveAll() {
    setSaving(true);
    try {
      await Promise.all(
        Object.entries(edits).map(([gradeId, data]) =>
          gradingService.updateGrade(parseInt(gradeId), data)
        )
      );
      await loadGrades(selected);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  function handleDiscard() {
    setEdits({});
  }

  const editCount = Object.keys(edits).length;
  const hasEdits  = editCount > 0;

  const inputClass = `w-20 text-center rounded-lg px-2 py-1.5 text-sm font-mono
    bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700
    focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none
    transition-all`;

  const numInput = (gradeId, field, savedValue) => (
    <input
      type="number" min="0" max="100" step="0.01"
      defaultValue={savedValue ?? ''}
      onChange={(e) => handleEdit(gradeId, field, e.target.value)}
      className={inputClass}
    />
  );

  return (
    <div className="flex flex-col gap-6">

      {/* Subject selector */}
      <div className="flex items-end gap-4">
        <div className="flex flex-col gap-1.5 flex-1 max-w-sm">
          <label className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            Select subject
          </label>
          <select
            className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200
                       dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm
                       text-zinc-900 dark:text-zinc-100
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       focus:outline-none transition-all"
            value={selected || ''}
            onChange={(e) => {
              const id = parseInt(e.target.value);
              setSelected(id);
              loadGrades(id);
            }}>
            <option value="">Choose a subject...</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name} — {s.yearSection}</option>
            ))}
          </select>
        </div>

        {selected && grades.length > 0 && (
          <div className="inline-flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800
                          text-zinc-600 dark:text-zinc-300 px-3 py-2 rounded-xl text-sm mb-0.5">
            <Users size={14} />
            {grades.length} student{grades.length !== 1 ? 's' : ''}
          </div>
        )}

        {saved && (
          <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mb-0.5">
            Saved successfully
          </span>
        )}
      </div>

      {/* Empty prompt */}
      {!selected && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <ClipboardList size={36}
            className="text-zinc-300 dark:text-zinc-600 mb-3" />
          <p className="text-sm font-medium text-zinc-400">
            Select a subject to begin
          </p>
        </div>
      )}

      {/* Grade table */}
      {selected && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200
                        dark:border-zinc-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/60 border-b
                               border-zinc-200 dark:border-zinc-800">
                  {['Student','Prelim','Midterm','Semi-Finals','Finals',
                    'Grade','Remarks','Override'].map((h) => (
                    <th key={h}
                      className="px-5 py-3.5 text-left text-xs font-semibold
                                 uppercase tracking-wide text-zinc-400
                                 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loadingGrades
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-zinc-100 dark:border-zinc-800">
                        {Array.from({ length: 8 }).map((__, j) => (
                          <td key={j} className="px-5 py-4">
                            <div className="animate-pulse bg-zinc-100 dark:bg-zinc-800
                                            rounded h-5 w-full" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : grades.map((g) => {
                      const preview  = getPreview(g);
                      const isEdited = !!edits[g.id];
                      const tGrade   = preview.transmutedGrade;
                      const remarks  = preview.remarks;
                      return (
                        <tr key={g.id}
                          className={`border-b border-zinc-100 dark:border-zinc-800
                            last:border-0 transition-colors
                            ${isEdited
                              ? 'bg-amber-50/60 dark:bg-amber-950/20'
                              : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/60'}`}>
                          <td className="px-5 py-4 min-w-[180px]">
                            <p className="font-medium text-zinc-900 dark:text-zinc-100">
                              {g.student.name || g.student.fullName}
                            </p>
                            <p className="text-xs text-zinc-400 mt-0.5">
                              {g.student.email}
                            </p>
                          </td>
                          <td className="px-5 py-4">
                            {numInput(g.id, 'prelim', g.prelim)}
                          </td>
                          <td className="px-5 py-4">
                            {numInput(g.id, 'midterm', g.midterm)}
                          </td>
                          <td className="px-5 py-4">
                            {numInput(g.id, 'semiFinals', g.semiFinals)}
                          </td>
                          <td className="px-5 py-4">
                            {numInput(g.id, 'finals', g.finals)}
                          </td>
                          <td className={`px-5 py-4 text-base font-semibold
                                          font-mono ${gradeColor(tGrade)}`}>
                            {tGrade != null ? tGrade.toFixed(2) : '—'}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs
                                             font-semibold uppercase tracking-wide
                                             ${REMARKS_STYLE[remarks] ?? ''}`}>
                              {remarks}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <select
                              defaultValue={g.remarks === 'DROPPED' ? 'DROPPED' : ''}
                              onChange={(e) =>
                                handleEdit(g.id, 'remarks', e.target.value || null)}
                              className="text-xs rounded-lg border border-zinc-200
                                         dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800
                                         px-2 py-1 text-zinc-600 dark:text-zinc-300
                                         focus:outline-none focus:ring-2 focus:ring-blue-500">
                              <option value="">Auto</option>
                              <option value="DROPPED">Dropped</option>
                              <option value="INC">INC</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })
                }
              </tbody>
            </table>
          </div>

          {/* Action bar — only when unsaved edits exist */}
          {hasEdits && (
            <div className="flex items-center justify-between border-t
                            border-zinc-200 dark:border-zinc-800 p-4
                            bg-white dark:bg-zinc-900 rounded-b-2xl">
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <AlertCircle size={15} className="text-amber-500" />
                {editCount} unsaved change{editCount !== 1 ? 's' : ''}
              </div>
              <div className="flex items-center gap-3">
                <button onClick={handleDiscard}
                  className="text-sm text-zinc-500 hover:text-zinc-700 px-4 py-2
                             rounded-xl border border-zinc-200 dark:border-zinc-700
                             transition-colors">
                  Discard
                </button>
                <button onClick={handleSaveAll} disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm
                             font-medium bg-blue-600 hover:bg-blue-700 text-white
                             disabled:opacity-50 disabled:cursor-not-allowed
                             transition-colors">
                  {saving
                    ? <Loader2 size={14} className="animate-spin" />
                    : <Save size={14} />
                  }
                  {saving ? 'Saving...' : 'Save All'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
