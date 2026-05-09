import { useState, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { employeesApi } from '@/api/employees';
import type { Employee } from '@/types';
import { cn } from '@/utils/cn';
import { Search, X } from 'lucide-react';

interface EmployeeSearchProps {
  value?: Employee | null;
  onChange: (employee: Employee | null) => void;
  placeholder?: string;
  className?: string;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const debouncedFn = useCallback(
    (v: T) => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setDebounced(v), delay);
    },
    [delay],
  );

  return debounced;
}

export function EmployeeSearch({ value, onChange, placeholder = 'Поиск сотрудника...', className }: EmployeeSearchProps) {
  const [inputValue, setInputValue] = useState(
    value ? `${value.lastName} ${value.firstName}` : '',
  );
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const debouncedSearch = search;

  const { data } = useQuery({
    queryKey: ['employees-search', debouncedSearch],
    queryFn: () => employeesApi.getAll({ search: debouncedSearch, limit: 10 }),
    enabled: debouncedSearch.length >= 2,
  });

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setSearch(e.target.value);
    setOpen(true);
    if (!e.target.value) onChange(null);
  };

  const handleSelect = (emp: Employee) => {
    setInputValue(`${emp.lastName} ${emp.firstName} ${emp.middleName ?? ''}`);
    onChange(emp);
    setOpen(false);
    setSearch('');
  };

  const handleClear = () => {
    setInputValue('');
    setSearch('');
    onChange(null);
  };

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={inputValue}
          onChange={handleInput}
          onFocus={() => search.length >= 2 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          className="w-full rounded-md border border-input bg-background px-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && data && data.items.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-md">
          {data.items.map((emp) => (
            <button
              key={emp.id}
              type="button"
              className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
              onMouseDown={() => handleSelect(emp)}
            >
              <div className="font-medium">
                {emp.lastName} {emp.firstName} {emp.middleName}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
