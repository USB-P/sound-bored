import { useEffect, useRef, useState } from 'react'
import { SignedIn, SignedOut, SignIn, UserButton, useUser } from '@clerk/clerk-react'
import SoundButton, { stopActiveAudio, isAudioActive, playAudioDirect } from './components/SoundButton'
import DbMeter from './components/DbMeter'
import SuggestModal from './components/SuggestModal'
import { supabase } from './supabase'

const FAV_KEYS = ['1','2','3','4','5','6','7','8','9','0']

const colorGlobs = {
  red:    import.meta.glob('./sounds/red/*.mp3',    { eager: true }),
  blue:   import.meta.glob('./sounds/blue/*.mp3',   { eager: true }),
  white:  import.meta.glob('./sounds/white/*.mp3',  { eager: true }),
  purple: import.meta.glob('./sounds/purple/*.mp3', { eager: true }),
  yellow: import.meta.glob('./sounds/yellow/*.mp3', { eager: true }),
  green:  import.meta.glob('./sounds/green/*.mp3',  { eager: true }),
  orange: import.meta.glob('./sounds/orange/*.mp3', { eager: true }),
  pink:   import.meta.glob('./sounds/pink/*.mp3',   { eager: true }),
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
  const [reverbEnabled, setReverbEnabled] = useState(true)
  const [broadcastEnabled, setBroadcastEnabled] = useState(false)
  const [broadcastUsers, setBroadcastUsers] = useState([])
  const [playCounts, setPlayCounts] = useState({})
  const [showSuggest, setShowSuggest] = useState(false)

  const channelRef = useRef(null)
  const leavingTimeoutsRef = useRef({})
  const reverbEnabledRef = useRef(reverbEnabled)
  const broadcastEnabledRef = useRef(broadcastEnabled)
  useEffect(() => { reverbEnabledRef.current = reverbEnabled }, [reverbEnabled])
  useEffect(() => { broadcastEnabledRef.current = broadcastEnabled }, [broadcastEnabled])

  useEffect(() => {
    if (user) {
      setFavorites(user.unsafeMetadata?.favorites ?? [])
      setReverbEnabled(user.unsafeMetadata?.reverb ?? true)
      setBroadcastEnabled(user.unsafeMetadata?.broadcast ?? false)
    }
  }, [user?.id])

  useEffect(() => {
    supabase.from('play_counts').select('sound_label, total_plays').then(({ data }) => {
      if (data) {
        const counts = {}
        data.forEach(row => { counts[row.sound_label] = row.total_plays })
        setPlayCounts(counts)
      }
    })

    const sub = supabase
      .channel('play-counts-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'play_counts' }, ({ new: row }) => {
        setPlayCounts(prev => ({ ...prev, [row.sound_label]: row.total_plays }))
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'play_counts' }, ({ new: row }) => {
        setPlayCounts(prev => ({ ...prev, [row.sound_label]: row.total_plays }))
      })
      .subscribe()

    return () => { supabase.removeChannel(sub) }
  }, [])

  useEffect(() => {
    if (!user) return

    const channel = supabase.channel('sound-bored')
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const all = Object.values(state).flat()
        const currentIds = new Set(all.map(u => u.userId))
        const unique = Array.from(new Map(all.map(u => [u.userId, u])).values())

        setBroadcastUsers(prev => {
          const leaving = prev.filter(u => !u.leaving && !currentIds.has(u.userId))
          leaving.forEach(u => {
            if (!leavingTimeoutsRef.current[u.userId]) {
              leavingTimeoutsRef.current[u.userId] = setTimeout(() => {
                setBroadcastUsers(p => p.filter(x => x.userId !== u.userId))
                delete leavingTimeoutsRef.current[u.userId]
              }, 200)
            }
          })
          return [
            ...unique,
            ...leaving.map(u => ({ ...u, leaving: true })),
          ]
        })
      })
      .on('broadcast', { event: 'play' }, ({ payload }) => {
        const sound = sounds.find(s => s.label === payload.label)
        if (sound) playAudioDirect(sound.src, reverbEnabledRef.current)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && broadcastEnabledRef.current) {
          await channel.track({ userId: user.id, avatarUrl: user.imageUrl })
        }
      })

    channelRef.current = channel
    return () => {
      Object.values(leavingTimeoutsRef.current).forEach(clearTimeout)
      leavingTimeoutsRef.current = {}
      supabase.removeChannel(channel)
      channelRef.current = null
      setBroadcastUsers([])
    }
  }, [user?.id])

  useEffect(() => {
    const channel = channelRef.current
    if (!channel || !user) return
    if (broadcastEnabled) {
      channel.track({ userId: user.id, avatarUrl: user.imageUrl })
    } else {
      channel.untrack()
    }
  }, [broadcastEnabled])

  function toggleFavorite(label) {
    const next = favorites.includes(label)
      ? favorites.filter(f => f !== label)
      : [...favorites, label]
    setFavorites(next)
    user.update({ unsafeMetadata: { ...user.unsafeMetadata, favorites: next } })
  }

  async function trackPlay(label) {
    setPlayCounts(prev => ({ ...prev, [label]: (prev[label] ?? 0) + 1 }))
    await supabase.rpc('increment_play_count', { label })
    if (broadcastEnabled && channelRef.current) {
      channelRef.current.send({ type: 'broadcast', event: 'play', payload: { label } })
    }
  }

  function toggleReverb() {
    const next = !reverbEnabled
    setReverbEnabled(next)
    user.update({ unsafeMetadata: { ...user.unsafeMetadata, reverb: next } })
  }

  function toggleBroadcast() {
    const next = !broadcastEnabled
    setBroadcastEnabled(next)
    user.update({ unsafeMetadata: { ...user.unsafeMetadata, broadcast: next } })
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
      if (idx !== -1) {
        const btn = favRefs.current[idx]
        if (btn) {
          btn.classList.add('is-active')
          if (!e.repeat || !isAudioActive()) btn.click()
        }
      }
    }
    function handleKeyUp(e) {
      const idx = FAV_KEYS.indexOf(e.key)
      if (idx !== -1) favRefs.current[idx]?.classList.remove('is-active')
    }
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
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
            <div className="soundboard-title-group">
              <span className="soundboard-title">sound-bored</span>
              <DbMeter />
              <button className={`reverb-toggle header-desktop-only${reverbEnabled ? ' is-on' : ''}`} onClick={toggleReverb}>
                reverb <span key={reverbEnabled ? 'on' : 'off'} className="reverb-toggle-status">{reverbEnabled ? 'on' : 'off'}</span> <span className={`toggle-indicator${reverbEnabled ? ' is-on' : ''}`} />
              </button>
            </div>
            <div className="soundboard-controls">
              <button className={`reverb-toggle header-mobile-only${reverbEnabled ? ' is-on' : ''}`} onClick={toggleReverb}>
                reverb <span key={reverbEnabled ? 'on' : 'off'} className="reverb-toggle-status">{reverbEnabled ? 'on' : 'off'}</span> <span className={`toggle-indicator${reverbEnabled ? ' is-on' : ''}`} />
              </button>
              <button className="suggest-btn header-mobile-only" onClick={() => setShowSuggest(true)}>Suggest new sound</button>
              <div className="broadcast-section">
                <button className={`broadcast-toggle${broadcastEnabled ? ' is-on' : ''}`} onClick={toggleBroadcast}>
                  broadcast <span key={broadcastEnabled ? 'on' : 'off'} className="reverb-toggle-status">{broadcastEnabled ? 'on' : 'off'}</span> <span className={`toggle-indicator${broadcastEnabled ? ' is-on' : ''}`} />
                </button>
                {broadcastUsers.length > 0 && (
                  <div className={`broadcast-avatars${!broadcastEnabled ? ' broadcast-avatars--dim' : ''}`}>
                    {broadcastUsers.map(u => (
                      <img
                        key={u.userId}
                        src={u.avatarUrl}
                        className={`broadcast-avatar${u.leaving ? ' broadcast-avatar--leaving' : ''}`}
                        alt=""
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="soundboard-right">
              <button className="suggest-btn header-desktop-only" onClick={() => setShowSuggest(true)}>Suggest new sound</button>
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
                reverbEnabled={reverbEnabled}
                playCount={playCounts[sound.label] ?? 0}
                onPlay={trackPlay}
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
                reverbEnabled={reverbEnabled}
                playCount={playCounts[sound.label] ?? 0}
                onPlay={trackPlay}
              />
            ))}
          </div>
        </div>
      </SignedIn>
      {showSuggest && user && <SuggestModal user={user} onClose={() => setShowSuggest(false)} />}
    </>
  )
}

export default App
