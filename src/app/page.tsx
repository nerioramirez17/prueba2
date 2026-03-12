import Link from 'next/link';
import { Shield, MailCheck, ArrowRight, Lock, Users } from 'lucide-react';

export default function SelectorPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#0f1629]">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C%2Fg%3E%3C%2Fsvg%3E")`,
        }}
      />

      <div className="relative w-full max-w-3xl px-6">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/30">
            <Shield className="h-9 w-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Cocos Security Portal</h1>
          <p className="mt-2 text-sm text-slate-400">
            Plataforma de Seguridad · Cocos Capital
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Portal de Seguridad */}
          <Link href="/dashboard" className="group">
            <div className="flex h-full flex-col rounded-2xl bg-white p-8 shadow-2xl transition-transform duration-200 group-hover:-translate-y-1 group-hover:shadow-blue-500/20">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50">
                <Shield className="h-7 w-7 text-blue-600" />
              </div>
              <div className="mb-2 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                  <Lock className="h-3 w-3" />
                  Solo equipo de seguridad
                </span>
              </div>
              <h2 className="mb-2 text-xl font-bold text-gray-900">
                Portal de Seguridad
              </h2>
              <p className="flex-1 text-sm text-gray-500">
                Monitoreo de amenazas, análisis de dominios, redes sociales y gestión de alertas en tiempo real.
              </p>
              <div className="mt-6 flex items-center text-sm font-semibold text-blue-600">
                Acceder al portal
                <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>

          {/* Validador de Phishing */}
          <Link href="/checker" className="group">
            <div className="flex h-full flex-col rounded-2xl bg-white p-8 shadow-2xl transition-transform duration-200 group-hover:-translate-y-1 group-hover:shadow-green-500/20">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-green-50">
                <MailCheck className="h-7 w-7 text-green-600" />
              </div>
              <div className="mb-2 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                  <Users className="h-3 w-3" />
                  Todos los empleados
                </span>
              </div>
              <h2 className="mb-2 text-xl font-bold text-gray-900">
                Validador de Phishing
              </h2>
              <p className="flex-1 text-sm text-gray-500">
                ¿Recibiste un mail sospechoso? Validá si es phishing antes de interactuar. Ideal para mails de proveedores, pagos y otras ALYCs.
              </p>
              <div className="mt-6 flex items-center text-sm font-semibold text-green-600">
                Validar un mail
                <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        </div>

        <p className="mt-8 text-center text-xs text-slate-500">
          Solo para uso interno del equipo de Cocos Capital
        </p>
      </div>
    </div>
  );
}
