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

const scrollbarStyles = `
  .scrollbar-thin {
    scrollbar-width: thin;
    scrollbar-color: #888 #f1f1f1;
  }
  .scrollbar-thin::-webkit-scrollbar {
    width: 6px;
  }
  .scrollbar-thin::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background-color: #888;
    border-radius: 3px;
  }
  .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background-color: #555;
  }
`

interface Character {
  name: string
  difficulty: "Easy" | "Intermediate" | "Expert"
  age: number
  description: string
  imageSrc: string
  color: string
  locked?: boolean
  scores?: {
    overallPerformance: number
    engagement: number
    objectionHandling: number
    informationGathering: number
    programExplanation: number
    closingSkills: number
    overallEffectiveness: number
  }
}

const characters: Character[] = [
  {
    name: "Megan",
    difficulty: "Easy",
    age: 25,
    description: "I'm Megan, 25, fresh out of college with my marketing degree and diving headfirst into real estate. Everything's new territory for me right now, especially wholesaling - it's like learning a whole new language! I'm super eager to learn though, and I've got plenty of questions. Hope you don't mind walking me through the basics.",
    imageSrc: "https://cdn.prod.website-files.com/6715d8211d464cb83a0c72a1/672e571489c14976033b13e0_Obr%C3%A1zek%20WhatsApp%2C%202024-11-08%20v%2019.21.46_99e4962c-p-500.jpg",
    color: "#48C7AE",
    locked: false, // Add this line
    scores: {
      overallPerformance: 83,
      engagement: 80,
      objectionHandling: 81,
      informationGathering: 82,
      programExplanation: 83,
      closingSkills: 84,
      overallEffectiveness: 85
    }
  },
  {
    name: "David",
    difficulty: "Intermediate",
    age: 40,
    description: "I'm David, 40, and I approach real estate decisions with the same analytical mindset I've developed over years in finance. Currently evaluating multiple offers for my property from wholesalers, and I need to make sure I'm not leaving money on the table. I dig into the details and expect clear, data-backed answers. Let's break down these options systematically.",
    imageSrc: "https://cdn.prod.website-files.com/6715d8211d464cb83a0c72a1/6729085f757129974706314d_image%20(6)-p-500.png",
    color: "#FCA147",
    locked: true,
    scores: {
      overallPerformance: 88,
      engagement: 85,
      objectionHandling: 86,
      informationGathering: 87,
      programExplanation: 88,
      closingSkills: 89,
      overallEffectiveness: 90
    }
  },
  {
    name: "Linda",
    difficulty: "Expert",
    age: 55,
    description: "I'm Linda, 55, with decades in real estate investing and a legal background that makes me question everything twice. I've seen too many deals go south to take anything at face value. While wholesaling might be legal, I have serious concerns about how it's used with distressed properties. Let's talk ethics and compliance.",
    imageSrc: "https://cdn.prod.website-files.com/6715d8211d464cb83a0c72a1/6729085f8a8dc1e8f78eae9b_image%20(7)-p-500.png",
    color: "#DC2626",
    locked: true,
    scores: {
      overallPerformance: 93,
      engagement: 90,
      objectionHandling: 91,
      informationGathering: 92,
      programExplanation: 93,
      closingSkills: 94,
      overallEffectiveness: 95
    }
  },
]

function ScorePanel({ scores }: { scores: NonNullable<Character['scores']> }) {
  const categories = [
    { key: 'overallPerformance', label: 'Overall Performance' },
    { key: 'engagement', label: 'Engagement' },
    { key: 'objectionHandling', label: 'Objection Handling' },
    { key: 'informationGathering', label: 'Information Gathering' },
    { key: 'programExplanation', label: 'Program Explanation' },
    { key: 'closingSkills', label: 'Closing Skills' },
    { key: 'overallEffectiveness', label: 'Overall Effectiveness' },
  ];

  return (
    <>
      <style jsx>{scrollbarStyles}</style>
      <div className="w-full text-sm h-[320px] flex flex-col">
        <div className="flex-grow overflow-y-auto pr-2 scrollbar-thin">
          <h3 className="text-sm font-semibold mb-2 sticky top-0 bg-white py-2 z-10">Score based on past 10 calls</h3>
          {categories.map(({ key, label }) => (
            <div key={key} className="bg-[#f8fdf6] p-3 rounded-lg mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className={`font-medium ${key === 'overallPerformance' ? 'text-base' : 'text-xs'}`}>{label}</span>
                <span className={`font-bold text-green-500 ${key === 'overallPerformance' ? 'text-lg' : 'text-xs'}`}>{scores[key as keyof typeof scores]}/100</span>
              </div>
              <div className={`bg-gray-200 rounded-full overflow-hidden ${key === 'overallPerformance' ? 'h-3' : 'h-2'}`}>
                <div 
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${scores[key as keyof typeof scores]}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <button
          className="w-full py-4 my-6 rounded-full text-black font-semibold text-lg transition-all hover:opacity-90 hover:shadow-lg bg-white shadow-md"
          onClick={() => {/* Add navigation logic here */}}
        >
          Go to Call Records
        </button>
      </div>
    </>
  );
}

function LockedOverlay({ previousAssistant, isLastLocked, difficulty }: { previousAssistant: string; isLastLocked: boolean; difficulty: string }) {
  const glowColor = 
    difficulty === 'Easy' 
      ? 'rgba(72, 199, 174, 0.5)' 
      : difficulty === 'Intermediate'
        ? 'rgba(252, 161, 71, 0.5)'
        : 'rgba(220, 38, 38, 0.5)';

  return (
    <div 
      className="absolute inset-0 rounded-[32px] flex items-center justify-center bg-black/40 backdrop-blur-sm" 
      style={{ 
        boxShadow: `0 0 20px ${
          difficulty === 'Easy' 
            ? 'rgba(72, 199, 174, 0.5)' 
            : difficulty === 'Intermediate'
              ? 'rgba(252, 161, 71, 0.5)'
              : 'rgba(220, 38, 38, 0.5)'
        }`
      }}
    >
      <div className="w-[400px] h-[400px] p-6 pt-16 text-center flex flex-col items-center justify-start">
        <div>
          <div className="flex justify-center items-center gap-4 mb-8 w-full">
            <Image
              src={difficulty === 'Expert' 
                ? "https://res.cloudinary.com/drkudvyog/image/upload/v1733371487/red_white_bold_syqkx8.png"
                : difficulty === 'Intermediate'
                  ? "https://res.cloudinary.com/drkudvyog/image/upload/v1733371487/orange_white_bold_d1mnnd.png"
                  : "https://res.cloudinary.com/drkudvyog/image/upload/v1733371487/green_white_bold_syqkx8.png"}
              alt="Locked"
              width={64}
              height={64}
              className="object-contain"
            />
          </div>
          <h3 className="text-3xl font-bold text-white mb-4">Character Locked</h3>
          <p className="text-white text-xl mb-8">
            {isLastLocked 
              ? `Unlock ${previousAssistant} First` 
              : `Achieve Overall Performance above 85 from the past 10 calls on ${previousAssistant} to Unlock.`
            }
          </p>
          {!isLastLocked && (
            <div className="w-full">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-white">Overall Performance</span>
                <span className="text-sm font-bold text-white">85/100</span>
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden relative">
                <div 
                  className="h-full bg-gradient-to-r from-white to-gray-200 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: '85%' }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CharacterSelection() {
  const [memberId, setMemberId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  let isMounted = true;

  const handleMessage = (event: MessageEvent) => {
    const isAllowedOrigin = ALLOWED_DOMAINS.some(domain => 
      event.origin.includes(domain)
    );

    if (!isAllowedOrigin) {
      console.warn('⚠️ Received message from unauthorized origin:', event.origin);
      return;
    }

    if (event.data.type === 'SET_MEMBER_ID' && event.data.memberId) {
      console.log('✅ Received member ID from parent window');
      setMemberId(event.data.memberId);
      setIsLoading(false);
    }
  };

  const initializeMemberstack = async () => {
    try {
      const isIframe = window.parent !== window;

      if (isIframe) {
        console.log('🔵 Running in iframe, requesting member ID from parent...');
        window.parent.postMessage({ type: 'GET_MEMBER_ID' }, '*');
      } else {
        console.log('🔵 Running standalone, checking Memberstack directly...');
        if (window.$memberstackDom) {
          const { data } = await window.$memberstackDom.getCurrentMember();
          if (data?.id && isMounted) {
            setMemberId(data.id);
            console.log('✅ Member ID found:', data.id);
          }
        } else {
          console.error('❌ Memberstack not initialized');
          setError('Memberstack initialization failed');
        }
      }
    } catch (error) {
      console.error('❌ Error initializing:', error);
      if (isMounted) {
        setError('Failed to initialize member data');
      }
    } finally {
      if (isMounted) {
        setIsLoading(false);
      }
    }
  };

  window.addEventListener('message', handleMessage);
  initializeMemberstack();

  return () => {
    isMounted = false;
    window.removeEventListener('message', handleMessage);
  };
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
        // Fallback to direct navigation if postMessage fails
        window.location.href = fullUrl;
    }
  };
  
const [activePanel, setActivePanel] = useState<Record<string, 'description' | 'scores'>>(() => {
  // Initialize with description panel for all characters
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

  if (isLoading) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

if (error) {
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center text-red-600">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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
  )
}
