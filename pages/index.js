// pages/index.js

import { useState, useEffect } from 'react';
import ResearchAssistant from '../components/scenarios/ResearchAssistant';
import WelcomeModal from '../components/WelcomeModal';
import Footer from '../components/Footer';
import { Moon, Sun } from 'lucide-react';

export default function HomePage() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleStartResearch = () => {
    setShowWelcome(false);
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <div className="min-h-screen py-4 px-2 md:py-8 md:px-4 bg-background">
      <WelcomeModal isOpen={showWelcome} onStart={handleStartResearch} isDark={isDark} />
      {!showWelcome && (
        <>
          <div className="w-full max-w-6xl mx-auto">
            <div className="flex flex-col items-center relative">
              <h1
                className={`text-xl md:text-3xl font-bold mb-4 text-center ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}
              >
                Assistente de Estruturação de Perguntas de Pesquisa.
              </h1>
              <img
                src="/logo_biblioteca.svg"
                alt="Logo Biblioteca"
                className={`h-auto w-full max-w-4xl mx-auto md:max-w-[65%]`}
              />

              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full ${
                  isDark ? 'bg-gray-800 text-yellow-300' : 'bg-gray-200 text-gray-800'
                } hover:bg-opacity-80 transition-colors fixed top-4 right-4 z-10 md:static md:absolute md:right-0 md:top-0`}
              >
                {isDark ? <Sun size={24} /> : <Moon size={24} />}
              </button>
            </div>
            <div className="container mx-auto px-4">
              <ResearchAssistant isDark={isDark} />
            </div>
          </div>
          <Footer isDark={isDark} />
        </>
      )}
    </div>
  );
}
