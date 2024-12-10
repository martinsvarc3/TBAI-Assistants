'use client'

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react'

declare global {
  interface Window {
    $memberstackDom: {
      getCurrentMember: () => Promise<{
        data: {
          id: string;
        } | null;
      }>;
    };
  }
}

const ALLOWED_DOMAINS = [
  'webflow.io',
  'webflow.com',
  'app.trainedbyai.com',
  'trainedbyai.com'
];

function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('🔴 Caught error:', error);
      setHasError(true);
      setErrorMessage(error.message);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{errorMessage}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function CharacterSelection() {
  const [memberId, setMemberId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('Initializing...');

  const [activePanel, setActivePanel] = useState<Record<string, 'description' | 'scores'>>(() => {
    return characters.reduce((acc, character) => ({
      ...acc,
      [character.name]: 'description'
    }), {});
  });

  const togglePanel = (characterName: string) => {
    setActivePanel(prev => ({
      ...prev,
      [characterName]: prev[characterName] === 'description' ? 'scores' : 'description'
    }));
  };

  useEffect(() => {
    console.log('🔵 Component mounted - checking environment...');

    const handleMessage = (event: MessageEvent) => {
      console.log('📨 Received message:', event.data);
      
      try {
        const isAllowedOrigin = ALLOWED_DOMAINS.some(domain => 
          event.origin.includes(domain)
        );

        if (!isAllowedOrigin) {
          console.warn('⚠️ Message from unauthorized origin:', event.origin);
          return;
        }

        if (event.data.type === 'SET_MEMBER_ID' && event.data.memberId) {
          console.log('✅ Setting member ID:', event.data.memberId);
          setMemberId(event.data.memberId);
          setStatusMessage('Member ID received');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('❌ Error handling message:', error);
        setError('Failed to process message from parent');
        setIsLoading(false);
      }
    };

    window.addEventListener('message', handleMessage);

    // Initial check
    if (window.parent !== window) {
      console.log('🔵 Running in iframe - requesting member ID...');
      setStatusMessage('Requesting member ID...');
      window.parent.postMessage({ type: 'GET_MEMBER_ID' }, '*');
    } else {
      console.log('🔵 Running standalone - checking Memberstack...');
      setStatusMessage('Checking member status...');
      if (window.$memberstackDom) {
        window.$memberstackDom.getCurrentMember()
          .then(({ data }) => {
            if (data?.id) {
              setMemberId(data.id);
              console.log('✅ Member ID found:', data.id);
            }
          })
          .catch(error => {
            console.error('❌ Memberstack error:', error);
            setError('Failed to get member data');
          })
          .finally(() => setIsLoading(false));
      } else {
        console.error('❌ Memberstack not initialized');
        setError('Memberstack initialization failed');
        setIsLoading(false);
      }
    }

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleStart = async (character: Character) => {
    if (!memberId) {
      console.error('❌ No member ID available');
      setError('Member ID not available. Please try logging in again.');
      return;
    }

    if (character.locked) {
      console.log('⚠️ Character is locked:', character.name);
      return;
    }

    const apiUrls: Record<string, string> = {
      Megan: 'https://hook.eu2.make.com/0p7hdgmvngx1iraz2a6c90z546ahbqex',
      David: 'https://hook.eu2.make.com/54eb38fg3owjjxp1q9nf95r4dg9ex6op',
      Linda: 'https://hook.eu2.make.com/jtgmjkcvgsltevf475nhjsqohgks97rj'
    };

    const apiUrl = apiUrls[character.name];
    if (!apiUrl) {
      console.error('❌ Invalid character name:', character.name);
      setError('Invalid character selection');
      return;
    }

    const fullUrl = `${apiUrl}?member_ID=${memberId}`;
    console.log('✅ Navigation URL:', fullUrl);

    try {
      if (window.parent !== window) {
        console.log('🔵 Sending redirect message to parent');
        window.parent.postMessage({
          type: 'REDIRECT',
          url: fullUrl
        }, '*');
      } else {
        console.log('🔵 Performing direct navigation');
        window.location.href = fullUrl;
      }
    } catch (error) {
      console.error('❌ Navigation error:', error);
      setError('Failed to navigate. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">{statusMessage}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center text-red-600">
          <p className="mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {characters.map((character, index) => (
          <div 
            key={character.name} 
            className={`relative rounded-[32px] bg-white overflow-hidden shadow-lg transition-shadow duration-300 hover:shadow-[0_0_20px_${character.color.replace('#', 'rgba(').slice(0, -1)},0.5)]`}
            style={{ 
              boxShadow: `0 0 15px ${character.color}`
            }}
          >
            <div className="p-4 flex flex-col items-center text-center">
              <div className="w-32 h-32 mb-2 relative overflow-hidden rounded-[20px] transition-all duration-300 ease-in-out hover:shadow-xl" style={{ perspective: '1000px' }}>
                <div className="w-full h-full transition-transform duration-300 ease-in-out hover:scale-110 hover:rotate-y-[-5deg] hover:translate-z-[20px]">
                  <Image
                    src={character.imageSrc}
                    alt={character.name}
                    fill
                    className="object-cover rounded-[20px]"
                  />
                </div>
              </div>
              <div className="w-full mb-2 flex flex-col items-center">
                <div className="flex items-center gap-2 py-1">
                  <h2 className="text-3xl font-bold text-black">
                    {character.name}
                  </h2>
                  <div
                    className="px-3 py-1 rounded-full text-white font-semibold text-sm"
                    style={{ backgroundColor: character.color }}
                  >
                    {character.difficulty.toUpperCase()}
                  </div>
                </div>
                <button
                  className="w-full py-3 rounded-full text-white font-bold text-lg transition-all hover:opacity-90 hover:shadow-lg"
                  style={{
                    backgroundColor: "#5f0bb9",
                    boxShadow: "0 4px 14px 0 rgba(95, 11, 185, 0.39)"
                  }}
                  disabled={character.locked}
                  onClick={() => handleStart(character)}
                >
                  START
                </button>
              </div>
              <div className="relative w-full mb-6 flex-grow">
                <button 
                  onClick={() => togglePanel(character.name)}
                  className="w-full py-3 rounded-full text-black font-semibold text-lg transition-all hover:opacity-90 hover:shadow-lg bg-white shadow-md mb-6"
                >
                  <span>
                    {activePanel[character.name] === 'description' ? 'View Performance' : 'Back to Description'}
                  </span>
                  {activePanel[character.name] === 'description' ? (
                    <ChevronDown size={20} className="inline-block ml-2" />
                  ) : (
                    <ChevronUp size={20} className="inline-block ml-2" />
                  )}
                </button>
                <div className="min-h-[300px] overflow-hidden relative">
                  <AnimatePresence initial={false}>
                    {activePanel[character.name] === 'description' ? (
                      <motion.div
                        key="description"
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "-100%", opacity: 0 }}
                        transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
                        className="absolute inset-0"
                      >
                        <p className="text-gray-600 text-base leading-relaxed text-center flex items-center justify-center h-full">
                          {character.description}
                        </p>
                      </motion.div>
                    ) : character.scores && (
                      <motion.div
                        key="scores"
                        initial={{ y: "-100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
                        className="absolute inset-0 overflow-hidden"
                      >
                        <ScorePanel scores={character.scores} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
            {character.locked && (
              <LockedOverlay 
                previousAssistant={characters[index - 1].name} 
                isLastLocked={index === characters.length - 1}
                difficulty={character.difficulty}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
  return (
  
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {characters.map((character, index) => (
          <div 
            key={character.name} 
            className={`relative rounded-[32px] bg-white overflow-hidden shadow-lg transition-shadow duration-300 hover:shadow-[0_0_20px_${character.color.replace('#', 'rgba(').slice(0, -1)},0.5)]`}
            style={{ 
              boxShadow: `0 0 15px ${character.color}`
            }}
          >
            <div className="p-4 flex flex-col items-center text-center">
              <div className="w-32 h-32 mb-2 relative overflow-hidden rounded-[20px] transition-all duration-300 ease-in-out hover:shadow-xl" style={{ perspective: '1000px' }}>
                <div className="w-full h-full transition-transform duration-300 ease-in-out hover:scale-110 hover:rotate-y-[-5deg] hover:translate-z-[20px]">
                  <Image
                    src={character.imageSrc}
                    alt={character.name}
                    fill
                    className="object-cover rounded-[20px]"
                  />
                </div>
              </div>
              <div className="w-full mb-2 flex flex-col items-center">
                <div className="flex items-center gap-2 py-1">
                  <h2 className="text-3xl font-bold text-black">
                    {character.name}
                  </h2>
                  <div
                    className="px-3 py-1 rounded-full text-white font-semibold text-sm"
                    style={{ backgroundColor: character.color }}
                  >
                    {character.difficulty.toUpperCase()}
                  </div>
                </div>
                <button
                  className="w-full py-3 rounded-full text-white font-bold text-lg transition-all hover:opacity-90 hover:shadow-lg"
                  style={{
                    backgroundColor: "#5f0bb9",
                    boxShadow: "0 4px 14px 0 rgba(95, 11, 185, 0.39)"
                  }}
                  disabled={character.locked}
                  onClick={() => handleStart(character)}
                >
                  START
                </button>
              </div>
              <div className="relative w-full mb-6 flex-grow">
                <button 
                    onClick={() => togglePanel(character.name)}
                    className="w-full py-3 rounded-full text-black font-semibold text-lg transition-all hover:opacity-90 hover:shadow-lg bg-white shadow-md mb-6"
                  >
                    <span>
                      {activePanel[character.name] === 'description' ? 'View Performance' : 'Back to Description'}
                    </span>
                    {activePanel[character.name] === 'description' ? (
                      <ChevronDown size={20} className="inline-block ml-2" />
                    ) : (
                      <ChevronUp size={20} className="inline-block ml-2" />
                    )}
                  </button>
                <div className="min-h-[300px] overflow-hidden relative">
                  <AnimatePresence initial={false}>
                    {activePanel[character.name] === 'description' ? (
                      <motion.div
                        key="description"
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "-100%", opacity: 0 }}
                        transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
                        className="absolute inset-0"
                      >
                        <p className="text-gray-600 text-base leading-relaxed text-center flex items-center justify-center h-full">
                          {character.description}
                        </p>
                      </motion.div>
                    ) : character.scores && (
                      <motion.div
                        key="scores"
                        initial={{ y: "-100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
                        className="absolute inset-0 overflow-hidden"
                      >
                        <ScorePanel scores={character.scores} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
            {character.locked && (
              <LockedOverlay 
                previousAssistant={characters[index - 1].name} 
                isLastLocked={index === characters.length - 1}
                difficulty={character.difficulty}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
  );
}

export default function CharacterSelectionWrapper() {
  return (
    <ErrorBoundary>
      <CharacterSelection />
    </ErrorBoundary>
  );
}
