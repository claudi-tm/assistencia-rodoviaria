'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const assistanceRequestSchema = z.object({
  problemType: z.string().min(1, 'Selecione um tipo de problema'),
  description: z.string().min(10, 'A descrição deve ter pelo menos 10 caracteres'),
  location: z.string().min(5, 'A localização deve ter pelo menos 5 caracteres'),
});

type AssistanceRequestFormData = z.infer<typeof assistanceRequestSchema>;

const problemTypes = [
  'Pneu furado',
  'Motor não liga',
  'Bateria descarregada',
  'Superaquecimento',
  'Problema elétrico',
  'Problema de freios',
  'Problema de transmissão',
  'Outro',
];

export default function AssistanceRequestForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<AssistanceRequestFormData>({
    resolver: zodResolver(assistanceRequestSchema)
  });

  const onSubmit = async (data: AssistanceRequestFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await axios.post('/api/assistance-requests', data);

      setIsSuccess(true);
      reset();

      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push('/dashboard/driver/requests');
        router.refresh();
      }, 2000);
    } catch (error: any) {
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Ocorreu um erro ao solicitar assistência');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl p-8 space-y-8 bg-white rounded-lg shadow-md">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Solicitar Assistência</h1>
        <p className="mt-2 text-gray-600">Preencha o formulário para solicitar assistência rodoviária</p>
      </div>

      {isSuccess ? (
        <div className="p-4 text-green-700 bg-green-100 rounded-md">
          <p className="font-medium">Solicitação enviada com sucesso!</p>
          <p className="mt-1">Você será redirecionado para a página de solicitações.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="problemType" className="block text-sm font-medium text-gray-700">
              Tipo de Problema
            </label>
            <select
              id="problemType"
              {...register('problemType')}
              className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Selecione um tipo de problema</option>
              {problemTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.problemType && (
              <p className="mt-1 text-sm text-red-500">{errors.problemType.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Descrição do Problema
            </label>
            <textarea
              id="description"
              rows={4}
              {...register('description')}
              className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Descreva o problema em detalhes"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Localização
            </label>
            <input
              id="location"
              type="text"
              {...register('location')}
              className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ex: Rodovia BR-101, km 123, próximo ao posto Shell"
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-500">{errors.location.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Enviando...' : 'Solicitar Assistência'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
} 