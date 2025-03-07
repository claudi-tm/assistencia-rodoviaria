import { authOptions } from '@/lib/auth/auth-options';
import { getServerSession } from 'next-auth/next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await getServerSession(authOptions);

  // Se o usuário estiver autenticado, redirecionar para o dashboard apropriado
  if (session) {
    if (session.user.role === 'DRIVER') {
      redirect('/dashboard/driver');
    } else if (session.user.role === 'MECHANIC') {
      redirect('/dashboard/mechanic');
    } else if (session.user.role === 'MANAGER') {
      redirect('/dashboard/manager');
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container flex items-center justify-between px-4 py-6 mx-auto">
          <h1 className="text-2xl font-bold text-indigo-600">Assistência Rodoviária</h1>
          <div className="space-x-4">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              Registrar
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <section className="py-20 bg-indigo-50">
          <div className="container px-4 mx-auto">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="mb-6 text-4xl font-bold text-gray-900">
                Assistência Rodoviária Quando Você Mais Precisa
              </h2>
              <p className="mb-8 text-xl text-gray-600">
                Solicite assistência rodoviária de forma rápida e fácil. Nossos mecânicos estão prontos para ajudar em qualquer situação de emergência na estrada.
              </p>
              <Link
                href="/register"
                className="px-8 py-3 text-lg font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                Comece Agora
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="container px-4 mx-auto">
            <h2 className="mb-12 text-3xl font-bold text-center text-gray-900">
              Como Funciona
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="p-6 text-center bg-white rounded-lg shadow">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 text-white bg-indigo-600 rounded-full">
                  1
                </div>
                <h3 className="mb-2 text-xl font-semibold">Registre-se</h3>
                <p className="text-gray-600">
                  Crie sua conta em poucos minutos e esteja pronto para solicitar assistência quando precisar.
                </p>
              </div>
              <div className="p-6 text-center bg-white rounded-lg shadow">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 text-white bg-indigo-600 rounded-full">
                  2
                </div>
                <h3 className="mb-2 text-xl font-semibold">Solicite Assistência</h3>
                <p className="text-gray-600">
                  Descreva o problema, forneça sua localização e envie a solicitação com apenas alguns cliques.
                </p>
              </div>
              <div className="p-6 text-center bg-white rounded-lg shadow">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 text-white bg-indigo-600 rounded-full">
                  3
                </div>
                <h3 className="mb-2 text-xl font-semibold">Receba Ajuda</h3>
                <p className="text-gray-600">
                  Um mecânico qualificado será designado para sua solicitação e irá até você para resolver o problema.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-indigo-600">
          <div className="container px-4 mx-auto text-center">
            <h2 className="mb-6 text-3xl font-bold text-white">
              Pronto para começar?
            </h2>
            <p className="mb-8 text-xl text-indigo-100">
              Registre-se agora e tenha acesso a assistência rodoviária quando precisar.
            </p>
            <div className="space-x-4">
              <Link
                href="/register"
                className="px-8 py-3 text-lg font-medium text-indigo-600 bg-white rounded-md hover:bg-gray-100"
              >
                Registrar
              </Link>
              <Link
                href="/login"
                className="px-8 py-3 text-lg font-medium text-white border border-white rounded-md hover:bg-indigo-700"
              >
                Entrar
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 bg-gray-800">
        <div className="container px-4 mx-auto">
          <div className="text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Assistência Rodoviária. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
