import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserRole, UserStatus } from "@/src/types/auth";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UsersToolbarProps {
  filters: any;
  setFilters: (f: any) => void;
  onRefresh: () => void;
}

export function UsersToolbar({ filters, setFilters, onRefresh }: UsersToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 py-4 px-2">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Buscar por nome ou e-mail..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="pl-10"
        />
      </div>

      <Select
        value={filters.role || "ALL"}
        onValueChange={(v) => setFilters({ ...filters, role: v === "ALL" ? undefined : v })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filtrar por Papel" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Todos os Papéis</SelectItem>
          {Object.values(UserRole).map((role) => (
            <SelectItem key={role} value={role}>
              {role}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.status || "ALL"}
        onValueChange={(v) => setFilters({ ...filters, status: v === "ALL" ? undefined : v })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filtrar por Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Todos os Status</SelectItem>
          {Object.values(UserStatus).map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="ghost"
        onClick={() => setFilters({ search: "", role: undefined, status: undefined })}
        className="h-10 px-3"
      >
        <X className="h-4 w-4 mr-2" /> Limpar
      </Button>

      <Button onClick={onRefresh} variant="outline">
        Atualizar
      </Button>
    </div>
  );
}
