'use client';

import { ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/src/lib/utils';

interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => ReactNode;
  className?: string;
}

interface AdminDataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

export function AdminDataTable<T>({
  columns,
  data,
  emptyMessage = "Nenhum registro encontrado.",
  onRowClick
}: AdminDataTableProps<T>) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-900">
          <TableRow className="border-slate-800 hover:bg-transparent">
            {columns.map((column, index) => (
              <TableHead
                key={index}
                className={cn("text-slate-400 font-bold uppercase text-[10px] tracking-widest py-4", column.className)}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((item, rowIndex) => (
              <TableRow
                key={rowIndex}
                className={cn(
                  "border-slate-800 hover:bg-slate-800/50 transition-colors cursor-default",
                  onRowClick && "cursor-pointer"
                )}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column, colIndex) => (
                  <TableCell key={colIndex} className={cn("py-4 text-slate-300 font-medium", column.className)}>
                    {column.cell
                      ? column.cell(item)
                      : (column.accessorKey ? String(item[column.accessorKey] ?? '') : null)
                    }
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-32 text-center text-slate-500 font-medium">
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
