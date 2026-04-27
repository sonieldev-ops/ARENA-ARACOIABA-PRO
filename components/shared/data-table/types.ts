import { ColumnDef } from "@tanstack/react-table";

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  placeholder?: string;
  onDelete?: (rows: TData[]) => void;
  isLoading?: boolean;
}

export interface DataTableFilterOption {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface DataTableFilterField<TData> {
  label: string;
  value: keyof TData;
  options?: DataTableFilterOption[];
}
