import { SignedIn, SignedOut, SignIn, UserButton } from '@clerk/clerk-react'
import SoundButton from './components/SoundButton'
import newLeader from './sounds/newLeader.mp3'

function App() {
  return (
    <>
      <SignedOut>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10vh' }}>
          <SignIn />
        </div>
      </SignedOut>

      <SignedIn>
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem' }}>
            <UserButton />
          </div>
          <h1>Sound Bored</h1>
          <SoundButton label="New Leader" soundSrc={newLeader} />
        </div>
      </SignedIn>
    </>
  )
}

export default App
