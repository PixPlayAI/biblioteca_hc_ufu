// pages/index.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import ResearchAssistant from '../components/scenarios/ResearchAssistant';
import WelcomeModal from '../components/WelcomeModal';
import Footer from '../components/Footer';
import { Moon, Sun } from 'lucide-react';
import { cn } from '../lib/utils';

{/* 

// Importa a página de busca MeSH
import MeshSearchPage from './mesh-search';

export default function HomePage() {
  return <MeshSearchPage />;
}
*/}


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
    <>
      <Head>
        <meta
          name="description"
          content="Página inicial do Assistente Digital para Estruturação de Perguntas de Pesquisa em Saúde desenvolvido pelo HC-UFU/Ebserh."
        />
      </Head>
      <div className="min-h-screen py-4 px-2 md:py-8 md:px-4 bg-background text-foreground">
        <WelcomeModal isOpen={showWelcome} onStart={handleStartResearch} isDark={isDark} />
        {!showWelcome && (
          <>
            <div className="w-full max-w-6xl mx-auto">
              <div className="flex flex-col items-center relative">
                <h1
                  className={`text-xl md:text-3xl font-bold mb-4 text-center ${
                    isDark ? 'text-foreground' : 'text-foreground'
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
                  className={cn(
                    `p-2 rounded-full transition-colors`,
                    isDark
                      ? 'bg-background text-primary hover:bg-muted-foreground'
                      : 'bg-muted-foreground text-primary hover:bg-secondary-foreground',
                    'fixed top-4 right-4 z-10 md:static md:absolute md:right-0 md:top-0'
                  )}
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
    </>
  );
}
