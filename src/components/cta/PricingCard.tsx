interface PricingCardProps {
  plano: {
    id: number;
    nome: string;
    preco: string;
    periodo: string;
    economia?: string;
    popular?: boolean;
    beneficios: string[];
    corDestaque: 'red' | 'orange' | 'green';
  };
  assinaturaSelecionada: number | null;
  onSelecionar: (id: number) => void;
}

export function PricingCard({ plano, assinaturaSelecionada, onSelecionar }: PricingCardProps) {
  const isSelecionado = assinaturaSelecionada === plano.id;
  const isPopular = plano.popular;

  // Cores baseadas no tipo de plano
  const cores = {
    red: {
      bg: 'bg-red-600',
      bgHover: 'hover:bg-red-700',
      ring: 'ring-red-500',
      light: 'bg-red-50',
      text: 'text-red-600'
    },
    orange: {
      bg: 'bg-orange-500',
      bgHover: 'hover:bg-orange-600',
      ring: 'ring-orange-400',
      light: 'bg-orange-50',
      text: 'text-orange-600'
    },
    green: {
      bg: 'bg-green-600',
      bgHover: 'hover:bg-green-700',
      ring: 'ring-green-500',
      light: 'bg-green-50',
      text: 'text-green-600'
    }
  };

  const cor = cores[plano.corDestaque];

  return (
    <div 
      className={`bg-white rounded-lg shadow-xl overflow-hidden transition-all duration-300 cursor-pointer transform hover:scale-105 ${
        isSelecionado 
          ? `ring-4 ${cor.ring} scale-105` 
          : isPopular 
            ? 'ring-2 ring-orange-400' 
            : 'ring-1 ring-gray-300'
      }`}
      onClick={() => onSelecionar(plano.id)}
    >
      {/* Header do Card */}
      <div className={`px-6 py-8 text-white ${isPopular ? 'bg-gradient-to-r from-orange-500 to-red-500' : cor.bg}`}>
        {isPopular && (
          <div className="bg-yellow-400 text-yellow-900 px-3 py-1 text-sm font-bold rounded-full inline-block mb-4">
            🏆 MAIS POPULAR
          </div>
        )}
        
        <h3 className="text-2xl font-bold text-center">{plano.nome}</h3>
        
        <div className="mt-4 flex justify-center items-baseline">
          <span className="text-4xl font-extrabold">{plano.preco}</span>
          <span className="text-lg font-medium opacity-90 ml-2">{plano.periodo}</span>
        </div>
        
        {plano.economia && (
          <div className="mt-2 text-center">
            <span className="bg-black/20 px-3 py-1 rounded-full text-sm font-semibold">
              💰 Economize {plano.economia}
            </span>
          </div>
        )}
      </div>

      {/* Lista de Benefícios */}
      <div className="px-6 py-8 bg-white">
        <ul className="space-y-4">
          {plano.beneficios.map((beneficio, index) => (
            <li key={index} className="flex items-start">
              <svg className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="ml-3 text-gray-700">{beneficio}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Botão de Seleção */}
      <div className="px-6 py-4 bg-gray-50 text-center">
        <button
          className={`w-full px-4 py-3 rounded-md font-semibold transition-colors ${
            isSelecionado 
              ? `${cor.bg} text-white shadow-lg` 
              : `bg-gray-800 text-white ${cor.bgHover}`
          }`}
        >
          {isSelecionado ? '✅ Selecionado' : 'Selecionar Este Plano'}
        </button>
      </div>
    </div>
  );
}