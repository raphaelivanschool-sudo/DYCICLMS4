import { useState, useEffect } from 'react';
import { gradingService } from '../../services/gradingService';
import {
  BookOpen, BookPlus, Plus, Trash2, CalendarDays, Users, X, Loader2, AlertCircle, Eye, UserCheck
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';

export default function SubjectManager() {
  const [subjects,    setSubjects]    = useState([]);
  const [open,        setOpen]        = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [fetching,    setFetching]    = useState(true);
  const [error,       setError]       = useState(null);
  const [deleteTarget,setDeleteTarget]= useState(null);
  const [form, setForm] = useState({ name: '', code: '', yearSection: '' });
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [fetchingStudents, setFetchingStudents] = useState(false);
  const [showStudentsDialog, setShowStudentsDialog] = useState(false);

  useEffect(() => {
    loadSubjects();
    
    // Set up an interval to refresh subjects periodically for real-time updates
    const interval = setInterval(() => {
      loadSubjects();
    }, 10000); // Refresh every 10 seconds
    
    return () => clearInterval(interval);
  }, []);

  async function loadEnrolledStudents(subject) {
    if (!subject) return;
    
    setFetchingStudents(true);
    try {
      const { data } = await gradingService.getEnrolledStudents(subject.id);
      setEnrolledStudents(data);
    } catch (err) {
      console.error('Failed to load enrolled students:', err);
      setEnrolledStudents([]);
    } finally {
      setFetchingStudents(false);
    }
  }

  function handleViewStudents(subject) {
    setSelectedSubject(subject);
    setShowStudentsDialog(true);
    loadEnrolledStudents(subject);
  }

  async function loadSubjects() {
    setFetching(true);
    try {
      const { data } = await gradingService.getSubjects();
      setSubjects(data);
    } finally {
      setFetching(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await gradingService.createSubject(form);
      setForm({ name: '', code: '', yearSection: '' });
      setOpen(false);
      await loadSubjects();
    } catch (err) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await gradingService.deleteSubject(deleteTarget);
      await loadSubjects();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to remove subject.');
    } finally {
      setDeleteTarget(null);
    }
  }

  const inputClass = `w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200
    dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100
    placeholder:text-zinc-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent
    focus:outline-none transition-all`;

  return (
    <div>

      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <div className="inline-flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800
                        px-3 py-1.5 rounded-xl text-sm text-zinc-600 dark:text-zinc-300">
          <BookOpen size={15} />
          {subjects.length} active subject{subjects.length !== 1 ? 's' : ''}
        </div>

        <button onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700
                     text-white px-4 py-2 rounded-xl text-sm font-medium
                     transition-colors">
          <Plus size={16} />
          Add Subject
        </button>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={(e) => e.target === e.currentTarget && (setOpen(false), setError(null))}>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border
                          border-zinc-200 dark:border-zinc-800 p-6 shadow-xl
                          w-full max-w-md relative">
            <button onClick={() => { setOpen(false); setError(null); }}
              className="absolute top-5 right-5 text-zinc-400
                          hover:text-zinc-600 transition-colors">
              <X size={16} />
            </button>

            <div className="flex items-center gap-2.5 text-lg font-semibold mb-6">
              <BookPlus size={18} className="text-blue-600" />
              <span className="text-zinc-900 dark:text-zinc-100">New Subject</span>
            </div>

            <form onSubmit={handleCreate} className="flex flex-col gap-4">

              {error && (
                <div className="flex items-start gap-2.5 bg-red-50 dark:bg-red-900/20
                                border border-red-200 dark:border-red-800 rounded-xl
                                px-4 py-3 text-sm text-red-600 dark:text-red-400">
                  <AlertCircle size={15} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Subject name
                </label>
                <input required placeholder="e.g. Programming 1"
                  className={inputClass}
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Subject code
                </label>
                <input required placeholder="e.g. CS101"
                  className={inputClass}
                  value={form.code}
                  onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Year &amp; Section
                </label>
                <input required placeholder="e.g. 2-A"
                  className={inputClass}
                  value={form.yearSection}
                  onChange={(e) => setForm((p) => ({ ...p, yearSection: e.target.value }))} />
              </div>

              <div className="flex gap-3 justify-end mt-2">
                <button type="button" onClick={() => setOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium border
                             border-zinc-200 dark:border-zinc-700 bg-transparent
                             hover:bg-zinc-50 dark:hover:bg-zinc-800
                             text-zinc-700 dark:text-zinc-300 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm
                             font-medium bg-blue-600 hover:bg-blue-700 text-white
                             disabled:opacity-50 disabled:cursor-not-allowed
                             transition-colors">
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  {loading ? 'Creating...' : 'Create subject'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Skeleton loading */}
      {fetching && (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i}
              className="animate-pulse bg-zinc-100 dark:bg-zinc-800 rounded-2xl h-20" />
          ))}
        </div>
      )}

      {/* Subject cards */}
      {!fetching && subjects.length > 0 && (
        <div className="flex flex-col gap-4">
          {subjects.map((s) => (
            <div key={s.id}
              className="flex items-center justify-between bg-white dark:bg-zinc-900
                         border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5
                         hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    {s.name}
                  </span>
                  <span className="font-mono text-xs bg-blue-50 dark:bg-blue-900/30
                                   text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-lg">
                    {s.code}
                  </span>
                </div>
              <div className="flex items-center gap-2 mt-1.5 text-xs text-zinc-500">
                <CalendarDays size={13} />
                <span>{s.yearSection}</span>
                <span>·</span>
                <Users size={13} />
                <span>{s._count?.grades || 0} student{(s._count?.grades || 0) !== 1 ? 's' : ''}</span>
                <span>·</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewStudents(s)}
                  className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-1 h-auto"
                >
                  <Eye size={13} className="mr-1" />
                  View Students
                </Button>
              </div>
              </div>

              <button onClick={() => setDeleteTarget(s.id)}
                className="flex items-center gap-1.5 text-sm text-red-500
                           hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20
                           px-3 py-1.5 rounded-xl transition-colors border border-transparent
                           hover:border-red-200 dark:hover:border-red-800">
                <Trash2 size={15} />
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!fetching && subjects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BookOpen size={40} className="text-zinc-300 dark:text-zinc-600 mb-4" />
          <p className="text-base font-medium text-zinc-500">No subjects yet</p>
          <p className="text-sm text-zinc-400 mt-1">
            Add your first subject to start managing grades.
          </p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={(e) => e.target === e.currentTarget && setDeleteTarget(null)}>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border
                          border-zinc-200 dark:border-zinc-800 p-6 shadow-xl
                          w-full max-w-sm relative">
            <div className="flex items-start gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-900/30
                              flex items-center justify-center shrink-0">
                <Trash2 size={16} className="text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  Remove subject
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  This will deactivate the subject. Existing grade records will be
                  preserved and can be recovered by an admin.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium border
                           border-zinc-200 dark:border-zinc-700 text-zinc-700
                           dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800
                           transition-colors">
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-red-600
                           hover:bg-red-700 text-white transition-colors">
                Yes, remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enrolled Students Dialog */}
      {showStudentsDialog && selectedSubject && (
        <Dialog open={showStudentsDialog} onOpenChange={setShowStudentsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-600" />
                Enrolled Students - {selectedSubject.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{selectedSubject.code}</span> • {selectedSubject.yearSection}
              </div>
              
              {fetchingStudents ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : enrolledStudents.length > 0 ? (
                <div className="border rounded-lg divide-y max-h-96 overflow-y-auto">
                  {enrolledStudents.map((student) => (
                    <div key={student.id} className="flex items-center gap-3 p-4 hover:bg-gray-50">
                      <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{student.fullName}</p>
                        <p className="text-sm text-gray-500">{student.email}</p>
                        <p className="text-xs text-gray-400">{student.yearSection}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No students enrolled yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Use the Student Enrollment panel to add students to this subject
                  </p>
                </div>
              )}
              
              <div className="flex justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => setShowStudentsDialog(false)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
}
