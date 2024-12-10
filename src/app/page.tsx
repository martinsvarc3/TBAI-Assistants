import dynamic from 'next/dynamic'

const CharacterSelection = dynamic(() => import('../components/ui/CharacterSelection'), {
  ssr: false // This is crucial - it disables server-side rendering
})

export default function Page() {
  return (
    <main>
      <CharacterSelection />
    </main>
  )
}
