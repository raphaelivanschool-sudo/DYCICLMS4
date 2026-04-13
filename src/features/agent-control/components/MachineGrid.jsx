import { useState } from 'react';
import { Search, Monitor } from 'lucide-react';
import { MachineCard } from './MachineCard';

export function MachineGrid({ machines, onViewScreen }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMachines = machines.filter(machine =>
    machine.hostname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    machine.ipAddress.includes(searchQuery) ||
    machine.mac.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (machines.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
          <Monitor className="w-8 h-8 text-gray-400 dark:text-gray-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No agents connected
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          Agents will appear here once they register with the system. Make sure the agent software is installed and running on your machines.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by hostname, IP, or MAC..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 
            bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
            placeholder-gray-400 dark:placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredMachines.map(machine => (
          <MachineCard 
            key={machine.id} 
            machine={machine} 
            onViewScreen={onViewScreen}
          />
        ))}
      </div>

      {/* No results */}
      {filteredMachines.length === 0 && searchQuery && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No machines found matching "{searchQuery}"
          </p>
        </div>
      )}
    </div>
  );
}
