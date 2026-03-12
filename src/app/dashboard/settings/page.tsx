import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UserPlus, Pencil, Trash2, Shield, User, Eye } from 'lucide-react';

const mockUsers = [
  {
    id: '1',
    name: 'Juan Díaz',
    email: 'juan.diaz@cocos-capital.com.ar',
    role: 'ADMIN',
    lastLogin: '2025-03-12 09:15',
    active: true,
  },
  {
    id: '2',
    name: 'María González',
    email: 'maria.gonzalez@cocos-capital.com.ar',
    role: 'ANALYST',
    lastLogin: '2025-03-11 16:40',
    active: true,
  },
  {
    id: '3',
    name: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@cocos-capital.com.ar',
    role: 'ANALYST',
    lastLogin: '2025-03-10 11:22',
    active: true,
  },
  {
    id: '4',
    name: 'Ana López',
    email: 'ana.lopez@cocos-capital.com.ar',
    role: 'VIEWER',
    lastLogin: '2025-03-09 14:05',
    active: true,
  },
  {
    id: '5',
    name: 'Pedro Martínez',
    email: 'pedro.martinez@cocos-capital.com.ar',
    role: 'VIEWER',
    lastLogin: '2025-02-28 10:00',
    active: false,
  },
];

const roleConfig = {
  ADMIN: {
    label: 'Admin',
    icon: <Shield className="h-3 w-3" />,
    className: 'bg-red-100 text-red-700',
  },
  ANALYST: {
    label: 'Analista',
    icon: <User className="h-3 w-3" />,
    className: 'bg-blue-100 text-blue-700',
  },
  VIEWER: {
    label: 'Viewer',
    icon: <Eye className="h-3 w-3" />,
    className: 'bg-gray-100 text-gray-600',
  },
};

export default function SettingsPage() {
  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <Header title="Configuración" subtitle="Gestión de usuarios y configuración del sistema" />
      <div className="flex-1 space-y-4 md:space-y-6 p-4 md:p-6">
        {/* User management */}
        <Card className="border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold text-gray-900">
                Gestión de Usuarios
              </CardTitle>
              <p className="mt-0.5 text-sm text-gray-500">
                {mockUsers.filter((u) => u.active).length} usuarios activos
              </p>
            </div>
            <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700">
              <UserPlus className="h-4 w-4" />
              Agregar usuario
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {/* Mobile: card list */}
            <div className="block md:hidden divide-y divide-gray-100">
              {mockUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                    {u.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">{u.name}</p>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${roleConfig[u.role as keyof typeof roleConfig].className}`}>
                        {roleConfig[u.role as keyof typeof roleConfig].icon}
                        {roleConfig[u.role as keyof typeof roleConfig].label}
                      </span>
                    </div>
                    <p className="truncate text-xs text-gray-500">{u.email}</p>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-1">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${u.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {u.active ? 'Activo' : 'Inactivo'}
                    </span>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-xs">Nombre</TableHead>
                    <TableHead className="text-xs">Email</TableHead>
                    <TableHead className="text-xs">Rol</TableHead>
                    <TableHead className="text-xs">Último acceso</TableHead>
                    <TableHead className="text-xs">Estado</TableHead>
                    <TableHead className="text-xs"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUsers.map((u) => (
                    <TableRow key={u.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                            {u.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{u.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{u.email}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${roleConfig[u.role as keyof typeof roleConfig].className}`}
                        >
                          {roleConfig[u.role as keyof typeof roleConfig].icon}
                          {roleConfig[u.role as keyof typeof roleConfig].label}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">{u.lastLogin}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            u.active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {u.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* System config */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="border border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-gray-900">
                Configuración de Escaneos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Dominio principal', value: 'cocos-capital.com.ar' },
                { label: 'Variaciones a monitorear', value: '156 dominios' },
                { label: 'Frecuencia de escaneo', value: 'Cada 6 horas' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.value}</p>
                  </div>
                  <Button variant="outline" size="sm">Editar</Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-gray-900">
                Umbrales de Alertas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm">Risk Score mínimo para alertar</Label>
                <Input type="number" defaultValue={60} min={0} max={100} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Similitud mínima de dominio (%)</Label>
                <Input type="number" defaultValue={70} min={0} max={100} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">VirusTotal: detecciones para alertar</Label>
                <Input type="number" defaultValue={3} min={0} />
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Guardar configuración
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
