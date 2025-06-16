
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ChecklistFiltersProps {
  onFiltersChange: (filters: {
    local: string;
    setor: string;
    responsavel: string;
  }) => void;
}

const ChecklistFilters: React.FC<ChecklistFiltersProps> = ({ onFiltersChange }) => {
  const [filters, setFilters] = useState({
    local: '',
    setor: '',
    responsavel: ''
  });

  const handleFilterChange = (field: string, value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = { local: '', setor: '', responsavel: '' };
    setFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const hasActiveFilters = filters.local || filters.setor || filters.responsavel;

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Filtros</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-auto p-1"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="filter-local">Local</Label>
          <Input
            id="filter-local"
            placeholder="Filtrar por local..."
            value={filters.local}
            onChange={(e) => handleFilterChange('local', e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="filter-setor">Setor</Label>
          <Input
            id="filter-setor"
            placeholder="Filtrar por setor..."
            value={filters.setor}
            onChange={(e) => handleFilterChange('setor', e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="filter-responsavel">Responsável</Label>
          <Input
            id="filter-responsavel"
            placeholder="Filtrar por responsável..."
            value={filters.responsavel}
            onChange={(e) => handleFilterChange('responsavel', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default ChecklistFilters;
