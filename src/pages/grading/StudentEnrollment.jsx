import { useState, useEffect } from 'react';
import { gradingService } from '../../services/gradingService';
import {
  Users, Loader2, GraduationCap, UserPlus, AlertCircle, CheckCircle
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

export default function StudentEnrollment() {
  // Simplified version - dropdown only for student selection
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [allStudents, setAllStudents] = useState([]);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingStudents, setFetchingStudents] = useState(false);
  const [fetchingEnrolled, setFetchingEnrolled] = useState(false);
  const [error, setError] = useState(null);

  // Load subjects on mount
  useEffect(() => {
    loadSubjects();
  }, []);

  // Load all students when component mounts
  useEffect(() => {
    loadAllStudents();
  }, []);

  // Load enrolled students when subject changes
  useEffect(() => {
    if (selectedSubject) {
      loadEnrolledStudents();
    } else {
      setEnrolledStudents([]);
      setAvailableStudents([]);
    }
  }, [selectedSubject]);

  // Filter available students
  useEffect(() => {
    if (allStudents.length > 0) {
      // Ensure enrolledStudents is an array
      const enrolledArray = Array.isArray(enrolledStudents) ? enrolledStudents : [];
      const enrolledIds = new Set(enrolledArray.map(s => s.id));
      const available = allStudents.filter(student => !enrolledIds.has(student.id));
      setAvailableStudents(available);
    } else {
      setAvailableStudents([]);
    }
  }, [allStudents, enrolledStudents]);

  async function loadSubjects() {
    setLoading(true);
    try {
      const { data } = await gradingService.getSubjects();
      setSubjects(data);
    } catch (err) {
      setError('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  }

  async function loadAllStudents() {
    setFetchingStudents(true);
    try {
      const data = await gradingService.getAllStudents();
      setAllStudents(data);
    } catch (err) {
      setError('Failed to load students');
    } finally {
      setFetchingStudents(false);
    }
  }

  async function loadEnrolledStudents() {
    if (!selectedSubject) return;
    
    setFetchingEnrolled(true);
    try {
      const data = await gradingService.getEnrolledStudents(parseInt(selectedSubject));
      // Ensure we always set an array
      setEnrolledStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load enrolled students');
      setEnrolledStudents([]); // Always set empty array on error
    } finally {
      setFetchingEnrolled(false);
    }
  }

  const selectedSubjectData = subjects.find(s => s.id.toString() === selectedSubject);

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-50 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Error</h2>
            <p className="text-sm text-gray-500">{error}</p>
          </div>
        </div>
        <Button onClick={() => setError(null)} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

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

      {/* Subject Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Select Subject</label>
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a subject..." />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id.toString()}>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <GraduationCap className="w-3 h-3 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{subject.name}</div>
                    <div className="text-xs text-gray-500">{subject.code} • {subject.yearSection}</div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Subject Info */}
      {selectedSubjectData && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-medium text-blue-900">{selectedSubjectData.name}</h3>
          <p className="text-sm text-blue-700">
            {selectedSubjectData.code} • {selectedSubjectData.yearSection} • 
            Instructor: {selectedSubjectData.instructor?.fullName}
          </p>
        </div>
      )}

      {/* Student Selection - Dropdown Only */}
      {selectedSubject && (
        <div className="space-y-4">
          {fetchingStudents || fetchingEnrolled ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{enrolledStudents.length} enrolled</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>{availableStudents.length} available</span>
                </div>
              </div>

              {/* Student Dropdown Only */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Select Student to Enroll</label>
                <Select value="" onValueChange={(value) => {
                  if (value) {
                    gradingService.enrollStudent(parseInt(selectedSubject), parseInt(value))
                      .then(() => {
                        loadEnrolledStudents(); // Reload the list
                      })
                      .catch(err => setError('Failed to enroll student'));
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a student to enroll..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStudents.map((student) => (
                      <SelectItem key={student.id} value={student.id.toString()}>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                            <Users className="w-3 h-3 text-gray-500" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{student.fullName}</div>
                            <div className="text-xs text-gray-500">{student.email} • {student.yearSection || 'No section'}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {availableStudents.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-300" />
                  <p>All students are enrolled in this subject</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Empty State - No Subject Selected */}
      {!selectedSubject && !loading && (
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
