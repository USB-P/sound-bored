import { useEffect, useRef, useState } from 'react'
import { SignedIn, SignedOut, SignIn, UserButton, useUser } from '@clerk/clerk-react'
import SoundButton, { stopActiveAudio } from './components/SoundButton'

const FAV_KEYS = ['1','2','3','4','5','6','7','8','9','0']

const colorGlobs = {
  red:    import.meta.glob('./sounds/red/*.mp3',    { eager: true }),
  blue:   import.meta.glob('./sounds/blue/*.mp3',   { eager: true }),
  white:  import.meta.glob('./sounds/white/*.mp3',  { eager: true }),
  purple: import.meta.glob('./sounds/purple/*.mp3', { eager: true }),
  yellow: import.meta.glob('./sounds/yellow/*.mp3', { eager: true }),
}

const sounds = Object.entries(colorGlobs).flatMap(([color, modules]) =>
  Object.entries(modules)
    .sort(([a], [b]) => {
      const aNum = /\/\d/.test(a)
      const bNum = /\/\d/.test(b)
      if (aNum && !bNum) return -1
      if (!aNum && bNum) return 1
      return a.localeCompare(b)
    })
    .map(([path, mod]) => ({
      label: path.split('/').pop().replace(/^\d+[_-]/, ''),
      src: mod.default,
      color,
    }))
)

function App() {
  const { user } = useUser()
  const [favorites, setFavorites] = useState([])

  useEffect(() => {
    if (user) setFavorites(user.unsafeMetadata?.favorites ?? [])
  }, [user?.id])

  function toggleFavorite(label) {
    const next = favorites.includes(label)
      ? favorites.filter(f => f !== label)
      : [...favorites, label]
    setFavorites(next)
    user.update({ unsafeMetadata: { ...user.unsafeMetadata, favorites: next } })
  }

  const favRefs = useRef([])
  const favoriteSounds = sounds.filter(s => favorites.includes(s.label))
  const placeholderCount = Math.max(10, favoriteSounds.length) - favoriteSounds.length

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'Escape') {
        stopActiveAudio();
        document.activeElement?.blur();
        return
      }
      const idx = FAV_KEYS.indexOf(e.key)
      if (idx !== -1) favRefs.current[idx]?.click()
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <SignedOut>
        <div className="auth-wrapper">
          <SignIn appearance={{
            variables: {
              colorPrimary: '#cd401d',
              colorBackground: '#171717',
              colorText: '#ffffff',
              colorTextSecondary: '#999999',
              colorInputBackground: '#262626',
              colorInputText: '#ffffff',
              colorNeutral: '#ffffff',
              borderRadius: '8px',
              fontFamily: "'Geist Pixel', monospace",
            },
            elements: {
              card: { border: '1px solid #262626', boxShadow: 'none' },
              formButtonPrimary: { backgroundColor: '#cd401d', '&:hover': { backgroundColor: '#e3855c' } },
              footerAction: { display: 'none' },
            },
          }} />
        </div>
      </SignedOut>

      <SignedIn>
        <div className="soundboard-card">
          <div className="soundboard-header">
            <span className="soundboard-title">Sound-Bored</span>
            <UserButton appearance={{
              variables: {
                colorPrimary: '#cd401d',
                colorBackground: '#171717',
                colorText: '#ffffff',
                colorTextSecondary: '#999999',
                colorInputBackground: '#262626',
                colorInputText: '#ffffff',
                colorNeutral: '#ffffff',
                borderRadius: '8px',
                fontFamily: "'Geist Pixel', monospace",
              },
              elements: {
                card: { border: '1px solid #262626', boxShadow: 'none' },
                formButtonPrimary: { backgroundColor: '#cd401d' },
                footerActionLink: { color: '#e3855c' },
              },
            }} />
          </div>
          <div className="favorites-section">
          <span className="favorites-label">Favourites:</span>
          <div className="favorites-grid">
            {favoriteSounds.map((sound, i) => (
              <SoundButton
                ref={el => { favRefs.current[i] = el }}
                key={sound.label}
                index={i + 1}
                label={sound.label}
                soundSrc={sound.src}
                color={sound.color}
                keyLabel={FAV_KEYS[i]}
                isFavorited
                onToggleFavorite={toggleFavorite}
              />
            ))}
            {Array.from({ length: placeholderCount }).map((_, i) => (
              <div key={`placeholder-${i}`} className="sound-button-placeholder">
                <span className="sound-button-placeholder-key">{FAV_KEYS[favoriteSounds.length + i]}</span>
              </div>
            ))}
          </div>
          </div>
          <div className="sound-grid">
            {sounds.map((sound, i) => (
              <SoundButton
                key={sound.label}
                index={i + 1}
                label={sound.label}
                soundSrc={sound.src}
                color={sound.color}
                isFavorited={favorites.includes(sound.label)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        </div>
      </SignedIn>
    </>
  )
}

export default App
