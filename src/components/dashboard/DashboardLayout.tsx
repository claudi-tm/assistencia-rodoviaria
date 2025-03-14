'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const userRole = session?.user?.role || 'DRIVER';

  const menuItems = {
    DRIVER: [
      { name: 'Dashboard', href: '/dashboard/driver' },
      { name: 'Solicitar Assistência', href: '/dashboard/driver/request' },
      { name: 'Minhas Solicitações', href: '/dashboard/driver/requests' },
      { name: 'Perfil', href: '/dashboard/driver/profile' },
    ],
    MECHANIC: [
      { name: 'Dashboard', href: '/dashboard/mechanic' },
      { name: 'Solicitações Pendentes', href: '/dashboard/mechanic/pending' },
      { name: 'Minhas Atribuições', href: '/dashboard/mechanic/assigned' },
      { name: 'Perfil', href: '/dashboard/mechanic/profile' },
    ],
    MANAGER: [
      { name: 'Dashboard', href: '/dashboard/manager' },
      { name: 'Todas Solicitações', href: '/dashboard/manager/requests' },
      { name: 'Gerenciar Mecânicos', href: '/dashboard/manager/mechanics' },
      { name: 'Gerenciar Condutores', href: '/dashboard/manager/drivers' },
      { name: 'Relatórios', href: '/dashboard/manager/reports' },
      { name: 'Perfil', href: '/dashboard/manager/profile' },
    ],
  };

  const currentMenuItems = menuItems[userRole as keyof typeof menuItems] || menuItems.DRIVER;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar para telas maiores */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-indigo-700 transition duration-300 ease-in-out lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        <div className="flex items-center justify-center h-16 bg-indigo-800">
          <span className="text-xl font-semibold text-white">Assistência Rodoviária</span>
        </div>
        <nav className="mt-5">
          <div className="px-4 py-2 text-xs font-semibold text-indigo-200 uppercase">
            {userRole === 'DRIVER' ? 'Condutor' : userRole === 'MECHANIC' ? 'Mecânico' : 'Gerente'}
          </div>
          {currentMenuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-6 py-3 text-white hover:bg-indigo-600 ${pathname === item.href ? 'bg-indigo-800' : ''
                }`}
            >
              <span>{item.name}</span>
            </Link>
          ))}
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center w-full px-6 py-3 mt-4 text-white hover:bg-indigo-600"
          >
            <span>Sair</span>
          </button>
        </nav>
      </div>

      {/* Conteúdo principal */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b">
          <button
            onClick={toggleSidebar}
            className="text-gray-500 focus:outline-none lg:hidden"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </button>
          <div className="flex items-center">
            <span className="text-sm font-semibold text-gray-700">
              {session?.user?.name}
              {session?.user?.role}
            </span>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
} 