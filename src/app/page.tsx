'use client'

import CharacterSelection from "@/components/ui/CharacterSelection";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100">
      <div className="dashboard-wrapper" style={{ overflow: 'visible' }}>
        <CharacterSelection />
      </div>
    </main>
  );
}
