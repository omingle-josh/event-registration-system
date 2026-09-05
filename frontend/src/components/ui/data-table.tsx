import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table"

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  cell: (item: T) => React.ReactNode;
}

interface CommonTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string | number;
}

export function CommonTable<T>({ data, columns, keyExtractor }: CommonTableProps<T>) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-b border-white/10 hover:bg-transparent">
          {columns.map((col) => (
            <TableHead key={col.key} className="font-semibold text-slate-200">
              {col.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow
            key={keyExtractor(item)}
            className="border-b border-white/5 hover:bg-slate-800/40"
          >
            {columns.map((col) => (
              <TableCell key={col.key} className="text-slate-300">
                {col.cell(item)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
