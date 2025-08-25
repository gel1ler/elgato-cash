interface TableProps {
  children: React.ReactNode
  className?: string
}

export function Table({ children, className = '' }: TableProps) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-sm border-collapse">
        {children}
      </table>
    </div>
  )
}

export function TableHead({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <thead className={className}>
      {children}
    </thead>
  )
}

export function TableBody({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <tbody className={className}>
      {children}
    </tbody>
  )
}

export function TableRow({ children, className = '', ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={`hover:bg-gray-50 ${className}`} {...props}>
      {children}
    </tr>
  )
}

export function TableHeader({ children, className = '', ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={`border border-gray-300 p-3 font-semibold text-gray-900 text-left bg-gray-50 ${className}`} {...props}>
      {children}
    </th>
  )
}

export function TableCell({ children, className = '', ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={`border border-gray-300 p-3 text-gray-900 ${className}`} {...props}>
      {children}
    </td>
  )
}
