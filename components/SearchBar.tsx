// Search Bar Component for Home.tsx
import React from 'react';
import { Search, Filter } from 'lucide-react';
import { TaskStatus } from '../types';

interface SearchBarProps {
  searchQuery: string;
  statusFilter: TaskStatus | 'all';
  onSearchChange: (query: string) => void;
  onFilterChange: (status: TaskStatus | 'all') => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  statusFilter,
  onSearchChange,
  onFilterChange
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Status Filter */}
      <div className="relative">
        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <select
          value={statusFilter}
          onChange={(e) => onFilterChange(e.target.value as TaskStatus | 'all')}
          className="pl-10 pr-8 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer appearance-none"
        >
          <option value="all">All Status</option>
          <option value={TaskStatus.PENDING}>Pending</option>
          <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
          <option value={TaskStatus.COMPLETED}>Completed</option>
        </select>
      </div>
    </div>
  );
};
