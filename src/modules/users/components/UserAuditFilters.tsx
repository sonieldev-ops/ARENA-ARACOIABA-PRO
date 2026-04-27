import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserAuditFiltersProps {
  filters: any;
  setFilters: (f: any) => void;
}

export function UserAuditFilters({ filters, setFilters }: UserAuditFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Buscar por ID ou motivo..."
          className="pl-10 h-9"
          value={filters.search || ""}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
      </div>

      <Select
        value={filters.action || "ALL"}
        onValueChange={(v) => setFilters({ ...filters, action: v === "ALL" ? undefined : v })}
      >
        <SelectTrigger className="w-[180px] h-9">
          <SelectValue placeholder="Tipo de Ação" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Todas as Ações</SelectItem>
          <SelectItem value="USER_APPROVED">Aprovação</SelectItem>
          <SelectItem value="USER_REJECTED">Rejeição</SelectItem>
          <SelectItem value="USER_ACCESS_CHANGED">Mudança de Acesso</SelectItem>
          <SelectItem value="SIGNUP">Cadastro</SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => setFilters({})}
        className="h-9"
      >
        <X className="h-4 w-4 mr-2" /> Limpar
      </Button>
    </div>
  );
}
