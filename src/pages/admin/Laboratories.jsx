import { useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Save,
  Users,
  CheckCircle,
  XCircle
} from 'lucide-react';

// Inline Badge component - THIS WAS MISSING!
const Badge = ({ variant, children }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    destructive: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variants[variant] || variants.default}`}>
      {children}
    </span>
  );
};

// Instructor options for dropdown
const instructors = [
  'Mr. Cruz',
  'Ms. Dela Vega', 
  'Mr. Ramirez',
  'Ms. Santos',
  'Mr. Garcia',
  'Ms. Johnson',
  'Mr. Smith'
];

// Helper to generate seating grid
const generateSeats = (capacity) => {
  const seats = [];
  const cols = 6;
  const rows = Math.ceil(capacity / cols);
  let seatNum = 1;
  
  for (let r = 0; r < rows; r++) {
    const row = { row: r + 1, seats: [] };
    for (let c = 0; c < cols && seatNum <= capacity; c++) {
      // Randomly assign some seats as occupied for demo
      const isOccupied = Math.random() > 0.6;
      row.seats.push({
        id: `S${seatNum.toString().padStart(2, '0')}`,
        status: isOccupied ? 'occupied' : 'available',
        user: isOccupied ? `Student ${seatNum}` : null
      });
      seatNum++;
    }
    seats.push(row);
  }
  return seats;
};

// Mock data - 5 labs with proper structure
const initialLabs = [
  { 
    id: 1, 
    name: 'Lab A', 
    instructor: 'Mr. Cruz', 
    capacity: 30,
    status: 'Active',
    layout: generateSeats(30)
  },
  { 
    id: 2, 
    name: 'Computer Lab 1', 
    instructor: 'Ms. Dela Vega', 
    capacity: 24,
    status: 'Active',
    layout: generateSeats(24)
  },
  { 
    id: 3, 
    name: 'Computer Lab 2', 
    instructor: 'Mr. Ramirez', 
    capacity: 20,
    status: 'Inactive',
    layout: generateSeats(20)
  },
  { 
    id: 4, 
    name: 'Lab B', 
    instructor: 'Ms. Santos', 
    capacity: 40,
    status: 'Active',
    layout: generateSeats(40)
  },
  { 
    id: 5, 
    name: 'Computer Lab 3', 
    instructor: 'Mr. Garcia', 
    capacity: 36,
    status: 'Inactive',
    layout: generateSeats(36)
  },
];

function Laboratories() {
  const [labs, setLabs] = useState(initialLabs);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedLab, setExpandedLab] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLab, setNewLab] = useState({ 
    name: '', 
    capacity: '', 
    instructor: instructors[0], 
    status: 'Active' 
  });

  // Filter labs based on search
  const filteredLabs = labs.filter(lab => 
    lab.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lab.instructor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Toggle seat occupancy
  const toggleSeat = (labId, rowIndex, seatIndex) => {
    setLabs(labs.map(lab => {
      if (lab.id !== labId) return lab;
      
      const newLayout = [...lab.layout];
      const seat = newLayout[rowIndex].seats[seatIndex];
      seat.status = seat.status === 'occupied' ? 'available' : 'occupied';
      if (seat.status === 'occupied' && !seat.user) {
        seat.user = 'Student';
      } else if (seat.status === 'available') {
        seat.user = null;
      }
      
      return { ...lab, layout: newLayout };
    }));
  };

  // Delete lab
  const deleteLab = (id) => {
    if (confirm('Are you sure you want to delete this laboratory?')) {
      setLabs(labs.filter(lab => lab.id !== id));
      if (expandedLab === id) setExpandedLab(null);
    }
  };

  // Add new lab
  const handleAddLab = () => {
    if (!newLab.name || !newLab.capacity) {
      alert('Please fill in all required fields');
      return;
    }
    
    const capacity = parseInt(newLab.capacity);
    const lab = {
      id: Date.now(),
      name: newLab.name,
      instructor: newLab.instructor,
      capacity: capacity,
      status: newLab.status,
      layout: generateSeats(capacity)
    };
    
    setLabs([...labs, lab]);
    setShowAddModal(false);
    setNewLab({ name: '', capacity: '', instructor: instructors[0], status: 'Active' });
  };

  // Status badge helper
  const getStatusBadge = (status) => {
    const variant = status === 'Active' ? 'success' : 'destructive';
    return <Badge variant={variant}>{status}</Badge>;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laboratories Management</h1>
          <p className="text-gray-500">Manage laboratory rooms, assignments, and seating</p>
        </div>
        <button 
          className="flex items-center h-10 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Laboratory
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search laboratories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Labs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredLabs.map((lab) => (
          <div key={lab.id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            {/* Card Header */}
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{lab.name}</h3>
                  <div className="flex items-center mt-1 text-sm text-gray-500">
                    <Users className="w-4 h-4 mr-1" />
                    <span>Capacity: {lab.capacity} seats</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors" 
                    title="Edit"
                    onClick={() => alert('Edit functionality would open here')}
                  >
                    <Edit2 className="w-4 h-4 text-blue-600" />
                  </button>
                  <button 
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors" 
                    title="Delete"
                    onClick={() => deleteLab(lab.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm">
                  <span className="text-gray-500">Instructor: </span>
                  <span className="font-medium text-gray-900">{lab.instructor}</span>
                </div>
                {getStatusBadge(lab.status)}
              </div>
            </div>

            {/* Seating Layout */}
            <div className="p-5 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-700">Seating Layout</p>
                <button
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  onClick={() => setExpandedLab(expandedLab === lab.id ? null : lab.id)}
                >
                  {expandedLab === lab.id ? 'Collapse' : 'Expand'}
                </button>
              </div>
              
              <div className={`space-y-2 ${expandedLab === lab.id ? '' : 'max-h-32 overflow-hidden'}`}>
                {lab.layout.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex items-center justify-center gap-2">
                    <span className="text-xs text-gray-400 w-6">R{row.row}</span>
                    <div className="flex gap-2">
                      {row.seats.map((seat, seatIndex) => (
                        <button
                          key={seatIndex}
                          onClick={() => toggleSeat(lab.id, rowIndex, seatIndex)}
                          className={`w-8 h-8 rounded flex items-center justify-center text-xs font-medium transition-colors ${
                            seat.status === 'occupied' 
                              ? 'bg-blue-500 text-white hover:bg-blue-600' 
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`}
                          title={seat.status === 'occupied' ? `Seat ${seat.id}: ${seat.user}` : `Seat ${seat.id}: Available`}
                        >
                          {seat.id.replace('S', '')}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              {expandedLab !== lab.id && lab.layout.length > 4 && (
                <div className="text-center mt-2">
                  <span className="text-xs text-gray-400">
                    + {lab.layout.length - 4} more rows
                  </span>
                </div>
              )}
              
              {/* Legend */}
              <div className="flex items-center justify-center gap-4 mt-4 text-xs">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded mr-1"></div>
                  <span className="text-gray-600">Occupied</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-200 rounded mr-1"></div>
                  <span className="text-gray-600">Empty</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredLabs.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No laboratories found matching your search.</p>
        </div>
      )}

      {/* Add Lab Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Add New Laboratory</h2>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lab Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Lab C"
                  value={newLab.name}
                  onChange={(e) => setNewLab({...newLab, name: e.target.value})}
                  className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity *</label>
                  <input
                    type="number"
                    placeholder="30"
                    value={newLab.capacity}
                    onChange={(e) => setNewLab({...newLab, capacity: e.target.value})}
                    className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={newLab.status}
                    onChange={(e) => setNewLab({...newLab, status: e.target.value})}
                    className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Instructor</label>
                <select
                  value={newLab.instructor}
                  onChange={(e) => setNewLab({...newLab, instructor: e.target.value})}
                  className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {instructors.map(inst => (
                    <option key={inst} value={inst}>{inst}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button 
                className="h-10 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button 
                className="flex items-center h-10 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                onClick={handleAddLab}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Laboratory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Laboratories;
