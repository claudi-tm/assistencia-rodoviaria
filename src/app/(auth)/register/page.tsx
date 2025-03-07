import RegisterForm from '@/components/forms/RegisterForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Registro | Assistência Rodoviária',
  description: 'Registre-se no sistema de assistência rodoviária',
};

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <RegisterForm />
    </div>
  );
} 