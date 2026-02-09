import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
} from '@mui/material';
import { COLORS } from '@/constants/colors';

export interface DataTableColumn<T> {
  header: string;
  key?: keyof T | string;
  render?: (row: T, index: number) => React.ReactNode;
  align?: 'left' | 'right' | 'center';
  width?: string | number;
  headerSx?: any;
  cellSx?: any;
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  emptyMessage?: string;
  getRowKey?: (row: T, index: number) => string | number;
  rowSx?: any;
  tableSx?: any;
}

export default function DataTable<T>({
  columns,
  data,
  emptyMessage = 'No hay datos para mostrar',
  getRowKey,
  rowSx,
  tableSx,
}: DataTableProps<T>) {
  const defaultGetRowKey = (row: T, index: number) => {
    if (getRowKey) return getRowKey(row, index);
    if (typeof row === 'object' && row !== null && 'id' in row) {
      return (row as any).id;
    }
    return index;
  };

  if (!data || data.length === 0) {
    return (
      <Typography sx={{ color: COLORS.text.light, opacity: 0.7, py: 3 }}>
        {emptyMessage}
      </Typography>
    );
  }

  return (
    <TableContainer 
      component={Paper} 
      sx={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        ...tableSx,
      }}
    >
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column, index) => (
              <TableCell
                key={`header-${index}`}
                align={column.align || 'left'}
                sx={{
                  color: COLORS.text.light,
                  fontWeight: 'bold',
                  width: column.width,
                  display: column.hideOnMobile ? { xs: 'none', sm: 'table-cell' } : 'table-cell',
                  ...column.headerSx,
                }}
              >
                {column.header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow 
              key={defaultGetRowKey(row, rowIndex)}
              sx={rowSx}
            >
              {columns.map((column, colIndex) => {
                let content: React.ReactNode;
                
                if (column.render) {
                  content = column.render(row, rowIndex);
                } else if (column.key) {
                  const keys = String(column.key).split('.');
                  let value: any = row;
                  for (const key of keys) {
                    value = value?.[key];
                  }
                  content = value?.toString() || '-';
                } else {
                  content = '-';
                }

                return (
                  <TableCell
                    key={`cell-${rowIndex}-${colIndex}`}
                    align={column.align || 'left'}
                    sx={{
                      color: COLORS.text.light,
                      display: column.hideOnMobile ? { xs: 'none', sm: 'table-cell' } : 'table-cell',
                      ...column.cellSx,
                    }}
                  >
                    {content}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
