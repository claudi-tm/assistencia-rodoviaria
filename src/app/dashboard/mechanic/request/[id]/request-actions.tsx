'use client';

import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface RequestActionsProps {
  requestId: string;
  currentStatus: string;
  mechanicId: string | null;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export default function RequestActions({
  requestId,
  currentStatus,
  mechanicId,
}: RequestActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleAssignToMe = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await axios.patch(`/api/assistance-requests/${requestId}`, {
        status: 'ASSIGNED',
        action: 'assign',
      });

      setSuccess('Solicitação atribuída com sucesso!');
      router.refresh();
    } catch (error: unknown) {
      const apiError = error as ApiError;
      setError(apiError.response?.data?.message || 'Erro ao atribuir solicitação');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await axios.patch(`/api/assistance-requests/${requestId}`, {
        status: newStatus,
        action: 'update',
      });

      setSuccess(`Status atualizado para ${newStatus} com sucesso!`);
      router.refresh();
    } catch (error: unknown) {
      const apiError = error as ApiError;
      setError(apiError.response?.data?.message || 'Erro ao atualizar status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold">Ações</h2>

      {error && (
        <div className="p-3 mt-4 text-sm text-red-500 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 mt-4 text-sm text-green-500 bg-green-100 rounded-md">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
        {currentStatus === 'PENDING' && !mechanicId && (
          <button
            onClick={handleAssignToMe}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {isLoading ? 'Processando...' : 'Atribuir a Mim'}
          </button>
        )}

        {currentStatus === 'ASSIGNED' && (
          <button
            onClick={() => handleUpdateStatus('IN_PROGRESS')}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {isLoading ? 'Processando...' : 'Iniciar Atendimento'}
          </button>
        )}

        {currentStatus === 'IN_PROGRESS' && (
          <button
            onClick={() => handleUpdateStatus('COMPLETED')}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? 'Processando...' : 'Concluir Atendimento'}
          </button>
        )}

        {(currentStatus === 'ASSIGNED' || currentStatus === 'IN_PROGRESS') && (
          <button
            onClick={() => handleUpdateStatus('CANCELLED')}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {isLoading ? 'Processando...' : 'Cancelar Atendimento'}
          </button>
        )}

        {(currentStatus === 'COMPLETED' || currentStatus === 'CANCELLED') && (
          <div className="p-3 text-sm text-gray-500 bg-gray-100 rounded-md">
            Esta solicitação já foi {currentStatus === 'COMPLETED' ? 'concluída' : 'cancelada'} e não pode ser modificada.
          </div>
        )}
      </div>
    </div>
  );
} 