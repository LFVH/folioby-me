// src/components/ui/ToggleStatus.tsx
'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';

interface ToggleStatusProps {
  id: number;
  status: boolean;
  type: 'conteudo' | 'categorias';
  toggle: 'isfree' | 'istrend'
  onStatusChange?: (newStatus: boolean) => void;
}

export function ToggleStatus({ id, status, type, toggle, onStatusChange }: ToggleStatusProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(status);

  const handleToggle = async () => {
    setIsLoading(true);
    
    const toastId = toast.loading(
      `Atualizando ${type === 'conteudo' ? 'conteúdo' : 'categoria'}...`,
      {
        position: "top-right",
        autoClose: false,
      }
    );

    try {
      const response = await fetch(`/api/nextsteps/${type}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toggle: toggle
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar');
      }

      const newStatus = !currentStatus;
      setCurrentStatus(newStatus);
      onStatusChange?.(newStatus);
      
      toast.update(toastId, {
        render: `${type === 'conteudo' ? 'Conteúdo' : 'Categoria'} ${
          newStatus ? 'ativado' : 'desativado'
        } com sucesso!`,
        type: 'success',
        isLoading: false,
        autoClose: 3000,
        hideProgressBar: false,
      });

    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      
      toast.update(toastId, {
        render: `Erro ao ${currentStatus ? 'desativar' : 'ativar'} ${
          type === 'conteudo' ? 'conteúdo' : 'categoria'
        }`,
        type: 'error',
        isLoading: false,
        autoClose: 4000,
        hideProgressBar: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${currentStatus 
          ? 'bg-green-500 hover:bg-green-600' 
          : 'bg-gray-300 hover:bg-gray-400'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <span className="sr-only">
        {currentStatus ? 'Desativar' : 'Ativar'}
      </span>
      
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
          ${currentStatus ? 'translate-x-6' : 'translate-x-1'}
          ${isLoading ? 'animate-pulse' : ''}
        `}
      />
    </button>
  );
}