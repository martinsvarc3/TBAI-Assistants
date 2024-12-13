'use client'

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
    <div className="fixed bottom-4 right-4 bg-white p-6 rounded-lg shadow-xl w-80">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Team Settings</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Number of past calls to consider
        </label>
        <input
          type="number"
          min="1"
          max="100"
          value={settings.past_calls_count}
          onChange={(e) => setSettings({
            ...settings,
            past_calls_count: parseInt(e.target.value) || 10
          })}
          className="w-full p-2 border rounded-md"
        />
      </div>

      <div className="flex justify-end items-center gap-4">
        {message && (
          <span className={`text-sm ${message.includes('Error') || message.includes('Failed') ? 'text-red-500' : 'text-green-500'}`}>
            {message}
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}
