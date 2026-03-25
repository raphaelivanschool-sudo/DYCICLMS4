import { useState, useEffect } from 'react';
import { gradingService } from '../../services/gradingService';
import {
  Users, Search, Plus, Check, X, Loader2, GraduationCap, UserPlus, AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

export default function StudentEnrollment() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [enrolling, setEnrolling] = useState({});
  const [success, setSuccess] = useState({});
  const [error, setError] = useState(null);
  const [fetchingSubjects, setFetchingSubjects] = useState(true);

  // Load subjects on mount
  useEffect(() => {
    loadSubjects();
  }, []);

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchQuery.trim() && selectedSubject) {
        searchStudents();
      } else {
        setStudents([]);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery, selectedSubject]);

  async function loadSubjects() {
    setFetchingSubjects(true);
    try {
      const { data } = await gradingService.getSubjects();
      setSubjects(data);
    } catch (err) {
      setError('Failed to load subjects');
    } finally {
      setFetchingSubjects(false);
    }
  }

  async function searchStudents() {
    if (!selectedSubject) {
      setError('Please select a subject first');
      return;
    }
    setSearching(true);
    setError(null);
    try {
      const subject = subjects.find(s => s.id.toString() === selectedSubject);
      const { data } = await gradingService.searchStudents(
        searchQuery,
        subject?.yearSection
      );
      setStudents(data);
    } catch (err) {
      setError('Failed to search students');
    } finally {
      setSearching(false);
    }
  }

  async function handleEnroll(studentId) {
    if (!selectedSubject) return;
    
    setEnrolling(prev => ({ ...prev, [studentId]: true }));
    setError(null);
    
    try {
      await gradingService.enrollStudent(parseInt(selectedSubject), studentId);
      setSuccess(prev => ({ ...prev, [studentId]: true }));
      
      // Clear success after 2 seconds
      setTimeout(() => {
        setSuccess(prev => ({ ...prev, [studentId]: false }));
      }, 2000);
    } catch (err) {
      if (err.response?.status === 409) {
        setError('Student is already enrolled in this subject');
      } else {
        setError(err.response?.data?.error || 'Failed to enroll student');
      }
    } finally {
      setEnrolling(prev => ({ ...prev, [studentId]: false }));
    }
  }

  const selectedSubjectData = subjects.find(s => s.id.toString() === selectedSubject);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-50 rounded-lg">
          <UserPlus className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Student Enrollment</h2>
          <p className="text-sm text-gray-500">Enroll students in subjects manually</p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Subject Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Select Subject</label>
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={fetchingSubjects ? "Loading subjects..." : "Choose a subject"} />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id.toString()}>
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-gray-400" />
                  <span>{subject.name}</span>
                  <span className="text-xs text-gray-400">({subject.code})</span>
                  <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {subject.yearSection}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Student Search */}
      {selectedSubject && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Search Students</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {searching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
              )}
            </div>
            <p className="text-xs text-gray-500">
              {selectedSubjectData && (
                <>Showing students from {selectedSubjectData.yearSection} or matching your search</>
              )}
            </p>
          </div>

          {/* Student Results */}
          {students.length > 0 ? (
            <div className="border rounded-lg divide-y">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{student.fullName}</p>
                      <p className="text-sm text-gray-500">{student.email}</p>
                      <p className="text-xs text-gray-400">{student.yearSection}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleEnroll(student.id)}
                    disabled={enrolling[student.id] || success[student.id]}
                    size="sm"
                    className={success[student.id] ? 'bg-green-600 hover:bg-green-700' : ''}
                  >
                    {enrolling[student.id] ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : success[student.id] ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Enrolled
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-1" />
                        Enroll
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          ) : searchQuery.trim() && !searching ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No students found matching "{searchQuery}"</p>
              <p className="text-sm text-gray-400 mt-1">
                Try searching with a different name or email
              </p>
            </div>
          ) : null}
        </div>
      )}

      {/* Empty State - No Subject Selected */}
      {!selectedSubject && !fetchingSubjects && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <GraduationCap className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-600 font-medium">Select a subject to start enrolling students</p>
          <p className="text-sm text-gray-400 mt-1">
            Choose from the dropdown above to see available subjects
          </p>
        </div>
      )}
    </div>
  );
}
