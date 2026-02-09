# DataTable Component

Componente reutilizable de tabla para la aplicación Digital Bank.

## Características

- **Genérico**: Acepta cualquier tipo de datos mediante TypeScript generics
- **Flexible**: Configuración de columnas con renderizado personalizado
- **Estilizado**: Integrado con el sistema de colores COLORS
- **Responsive**: Basado en Material UI Table components
- **Manejo de vacío**: Mensaje personalizable cuando no hay datos

## Uso Básico

```tsx
import DataTable, { DataTableColumn } from '@/components/common/DataTable';

// Define las columnas
const columns: DataTableColumn<MyType>[] = [
  {
    header: 'Nombre',
    key: 'name', // Acceso directo a propiedad
  },
  {
    header: 'Email',
    key: 'user.email', // Acceso a propiedades anidadas
  },
  {
    header: 'Estado',
    render: (row) => ( // Renderizado personalizado
      <Chip label={row.status} />
    ),
  },
];

// Usar el componente
<DataTable
  columns={columns}
  data={myData}
  emptyMessage="No hay datos disponibles"
/>
```

## Props

### DataTableColumn<T>

- `header` (string): Texto del encabezado de la columna
- `key` (string, opcional): Clave para acceder al valor en el objeto. Soporta notación de punto para propiedades anidadas
- `render` (function, opcional): Función de renderizado personalizado `(row: T, index: number) => React.ReactNode`
- `align` ('left' | 'right' | 'center', opcional): Alineación del contenido
- `width` (string | number, opcional): Ancho de la columna
- `headerSx` (object, opcional): Estilos adicionales para el encabezado
- `cellSx` (object, opcional): Estilos adicionales para las celdas

### DataTableProps<T>

- `columns` (DataTableColumn<T>[]): Array de configuración de columnas
- `data` (T[]): Array de datos a mostrar
- `emptyMessage` (string, opcional): Mensaje cuando no hay datos. Default: "No hay datos para mostrar"
- `getRowKey` (function, opcional): Función para obtener la key única de cada fila
- `rowSx` (object, opcional): Estilos adicionales para las filas
- `tableSx` (object, opcional): Estilos adicionales para el TableContainer

## Ejemplos

### Tabla de Cuentas

```tsx
const accountColumns: DataTableColumn<Account>[] = [
  {
    header: 'Número de Cuenta',
    render: (account) => (
      <span style={{ fontFamily: 'monospace' }}>
        {account.accountNumber}
      </span>
    ),
  },
  {
    header: 'Usuario',
    render: (account) => 
      `${account.owner?.firstname} ${account.owner?.lastname}`,
  },
  {
    header: 'Saldo',
    render: (account) => (
      <span style={{ color: COLORS.state.success }}>
        {account.currency === 'USD' ? '$' : 'S/.'} 
        {parseFloat(account.balance).toFixed(2)}
      </span>
    ),
  },
];
```

### Tabla de Transacciones

```tsx
const transactionColumns: DataTableColumn<Transaction>[] = [
  {
    header: 'ID',
    render: (tx) => tx.id.substring(0, 8) + '...',
    cellSx: { fontFamily: 'monospace', fontSize: '0.75rem' },
  },
  {
    header: 'Fecha',
    render: (tx) => new Date(tx.createdAt).toLocaleString('es-ES'),
    cellSx: { fontSize: '0.875rem' },
  },
  {
    header: 'Estado',
    render: (tx) => (
      <Chip
        label={tx.status}
        sx={{
          backgroundColor: tx.status === 'POSTED' 
            ? COLORS.state.success 
            : COLORS.state.warning,
        }}
      />
    ),
  },
];
```

## Notas

- El componente usa el sistema de colores COLORS de la aplicación
- Por defecto, el componente busca una propiedad `id` en el objeto rowpara usar como key
- Si usas `render`, el valor de `key` es ignorado
- Los estilos sx adicionales se mezclan con los estilos por defecto
