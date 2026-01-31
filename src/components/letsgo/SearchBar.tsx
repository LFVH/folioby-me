'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface SearchBarProps {
  onSearch: (termo: string) => void
  autoFocus?: boolean
  value?: string
  onClear?: () => void
}

export default function SearchBar({ 
  onSearch, 
  autoFocus = false, 
  value = '',
  onClear 
}: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localQuery, setLocalQuery] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isInitialMount = useRef(true)
  
    useEffect(() => {
    if (!isOpen) {
      setLocalQuery(value)
    }
  }, [value, isOpen])
  // Foco no input quando abrir o dialog
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  // Lógica de search com debounce - CORRIGIDO
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Só dispara a busca se:
    // 1. O usuário está digitando (localQuery mudou)
    // 2. E tem pelo menos 2 caracteres OU está vazio (para limpar)
    if (localQuery !== value) {
      if (localQuery.length >= 2 || localQuery === '') {
        timeoutRef.current = setTimeout(() => {
          console.log("🔍 Executando busca:", localQuery)
          onSearch(localQuery)
        }, 300)
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [localQuery, onSearch, value])

  const handleClear = useCallback(() => {
    setLocalQuery('')
    onSearch('')
    onClear?.()
    inputRef.current?.focus()
  }, [onSearch, onClear])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalQuery(e.target.value)
  }, [])

  const handleOpen = useCallback(() => {
    setIsOpen(true)
  }, [])

  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  // Fechar com ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setLocalQuery('')
        onSearch('')
        onClear?.()
        handleClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, handleClose])

  return (
    <>
      {/* Botão da Lupa (sempre visível) */}
      <button
        onClick={handleOpen}
        className="p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
        title="Buscar conteúdos"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

      {/* Overlay e Dialog */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-70 z-50 transition-opacity duration-300"
            onClick={handleClose}
          />
          
          <div className="fixed top-0 left-0 right-0 z-50 pt-20 px-4">
            <div className="max-w-2xl mx-auto">
              <div className="relative bg-gray-900 rounded-lg shadow-2xl border border-gray-700 p-2">
                <div className="relative flex items-center">
                  <input
                    ref={inputRef}
                    type="text"
                    value={localQuery}
                    onChange={handleChange}
                    placeholder="Buscar categorias ou conteudos..."
                    className="w-full px-4 py-4 pl-12 bg-transparent text-white placeholder-gray-400 focus:outline-none text-lg"
                    autoFocus={autoFocus}
                  />
                  
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>

                  {localQuery && (
                    <button
                      onClick={handleClear}
                      className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
                      title="Fechar e limpar"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}

                  <button
                    onClick={handleClose}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-800"
                    title="Fechar e seguir"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="px-4 pb-2">
                  <p className="text-gray-500 text-sm">
                    Pressione ESC para limpar e fechar Clique fora para navegar
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}