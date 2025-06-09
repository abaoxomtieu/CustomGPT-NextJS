"use client"

import * as React from "react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"

interface Column {
  accessorKey?: string
  header: string | React.ReactNode
  id?: string
  cell?: ({ row }: { row: any }) => React.ReactNode
}

interface DataTableProps {
  columns: Column[]
  data: any[]
  loading?: boolean
  onRowSelectionChange?: (selectedIds: string[]) => void
  rowKey: string
  pageSize?: number
}

export function DataTable({ 
  columns, 
  data, 
  loading, 
  onRowSelectionChange, 
  rowKey,
  pageSize = 10 
}: DataTableProps) {
  const [selectedRows, setSelectedRows] = React.useState<string[]>([])

  const handleRowSelection = (rowId: string, checked: boolean) => {
    const newSelection = checked 
      ? [...selectedRows, rowId]
      : selectedRows.filter(id => id !== rowId)
    
    setSelectedRows(newSelection)
    onRowSelectionChange?.(newSelection)
  }

  const handleSelectAll = (checked: boolean) => {
    const newSelection = checked ? data.map(row => row[rowKey]) : []
    setSelectedRows(newSelection)
    onRowSelectionChange?.(newSelection)
  }

  if (loading) {
    return <div className="p-4 text-center">Đang tải...</div>
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedRows.length === data.length && data.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            {columns.map((column, index) => (
              <TableHead key={column.accessorKey || column.id || index}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + 1} className="text-center">
                Không có dữ liệu
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, rowIndex) => (
              <TableRow key={row[rowKey] || rowIndex}>
                <TableCell>
                  <Checkbox
                    checked={selectedRows.includes(row[rowKey])}
                    onCheckedChange={(checked) => 
                      handleRowSelection(row[rowKey], checked as boolean)
                    }
                  />
                </TableCell>
                {columns.map((column, colIndex) => (
                  <TableCell key={column.accessorKey || column.id || colIndex}>
                    {column.cell 
                      ? column.cell({ row: { original: row } })
                      : column.accessorKey 
                        ? row[column.accessorKey]
                        : null
                    }
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
} 