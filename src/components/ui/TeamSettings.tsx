'use client'

import TeamSettings from './TeamSettings'
import { useState, useEffect } from 'react'
import { Settings, Save } from 'lucide-react'

interface TeamSettings {
  past_calls_count: number;
}

export default function TeamSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<TeamSettings>({
    past_calls_count: 10
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch current settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/character-performance?teamId=team_default');
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/character-performance', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamId: 'team_default',
          pastCallsCount: settings.past_calls_count
        }),
      });

      if (response.ok) {
        setMessage('Settings saved successfully');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to save settings');
      }
    } catch (error) {
      setMessage('Error saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
        title="Team Settings"
      >
        <Settings className="w-6 h-6 text-gray-600" />
      </button>
    );
  }

return (
    <div className="w-full bg-white rounded-[20px]">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-5">
        {characters.map((character, index) => (
          // ... your existing character cards code
        ))}
      </div>
      <TeamSettings />  {/* Add this line here */}
    </div>
);
