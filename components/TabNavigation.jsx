// components/TabNavigation.jsx
import { cn } from '../lib/utils';
import { FileText, Sparkles } from 'lucide-react';
import PropTypes from 'prop-types';

const TabNavigation = ({ activeTab, onTabChange, isDark }) => {
  const tabs = [
    {
      id: 'structured',
      label: 'Estruturação de Perguntas',
      icon: FileText,
      description: 'Construa sua pergunta de pesquisa passo a passo'
    },
    {
      id: 'intelligent',
      label: 'Busca Inteligente com IA',
      icon: Sparkles,
      description: 'Digite sua ideia e receba descritores MeSH/DeCS'
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'relative p-6 rounded-xl transition-all duration-300 text-left',
                'border-2 hover:shadow-lg transform hover:scale-[1.02]',
                isActive
                  ? isDark
                    ? 'bg-gradient-to-br from-blue-900 to-purple-900 border-blue-500'
                    : 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-500'
                  : isDark
                    ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                    : 'bg-white border-gray-200 hover:border-gray-300'
              )}
            >
              {/* Badge de ativo */}
              {isActive && (
                <div className="absolute top-3 right-3">
                  <span className={cn(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    isDark
                      ? 'bg-blue-500 text-white'
                      : 'bg-blue-500 text-white'
                  )}>
                    Ativo
                  </span>
                </div>
              )}
              
              <div className="flex items-start gap-4">
                <div className={cn(
                  'p-3 rounded-lg',
                  isActive
                    ? 'bg-gradient-to-br from-blue-500 to-purple-500'
                    : isDark
                      ? 'bg-gray-700'
                      : 'bg-gray-100'
                )}>
                  <Icon className={cn(
                    'w-6 h-6',
                    isActive ? 'text-white' : isDark ? 'text-gray-400' : 'text-gray-600'
                  )} />
                </div>
                
                <div className="flex-1">
                  <h3 className={cn(
                    'font-semibold text-lg mb-1',
                    isActive
                      ? isDark ? 'text-white' : 'text-blue-900'
                      : isDark ? 'text-gray-200' : 'text-gray-900'
                  )}>
                    {tab.label}
                  </h3>
                  <p className={cn(
                    'text-sm',
                    isActive
                      ? isDark ? 'text-gray-300' : 'text-blue-700'
                      : isDark ? 'text-gray-400' : 'text-gray-600'
                  )}>
                    {tab.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

TabNavigation.propTypes = {
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
  isDark: PropTypes.bool.isRequired
};

export default TabNavigation;