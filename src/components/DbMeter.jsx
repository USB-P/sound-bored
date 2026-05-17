import { useEffect, useRef } from 'react'
import { getMeterLevel } from './SoundButton'

function makeShadow(color) {
  return `0 0 22.68px ${color}, 0 0 12.96px ${color}, 0 0 7.56px ${color}, 0 0 3.78px ${color}, 0 0 1.08px ${color}, 0 0 0.54px ${color}`
}

const COLUMNS = [
  ...Array.from({ length: 9 },  () => ({ color: '#7bf1a8', shadow: makeShadow('#00c94f') })),
  ...Array.from({ length: 4 },  () => ({ color: '#fff085', shadow: makeShadow('#f0b50e') })),
  ...Array.from({ length: 2 },  () => ({ color: '#f0b100', shadow: makeShadow('#f0b100') })),
  ...Array.from({ length: 2 },  () => ({ color: '#fb2c36', shadow: makeShadow('#fb2c36') })),
]

export default function DbMeter() {
  const dotRefs = useRef([])
  const rafRef = useRef(null)
  const levelRef = useRef(0)

  useEffect(() => {
    function tick() {
      const raw = getMeterLevel()
      levelRef.current = raw > levelRef.current ? raw : levelRef.current * 0.82
      const boosted = Math.min(1, Math.pow(levelRef.current * 5, 0.7))
      const activeCount = Math.round(boosted * COLUMNS.length)

      for (let col = 0; col < COLUMNS.length; col++) {
        const isActive = col < activeCount
        const { color, shadow } = COLUMNS[col]
        const d0 = dotRefs.current[col * 2]
        const d1 = dotRefs.current[col * 2 + 1]
        if (!d0 || !d1) continue
        d0.style.background = isActive ? color : '#2a2a2a'
        d0.style.boxShadow = isActive ? shadow : 'none'
        d1.style.background = isActive ? color : '#2a2a2a'
        d1.style.boxShadow = isActive ? shadow : 'none'
      }

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <div className="db-meter">
      {COLUMNS.map((_, col) => (
        <div key={col} className="db-meter-col">
          <div ref={el => { dotRefs.current[col * 2] = el }} className="db-meter-dot" />
          <div ref={el => { dotRefs.current[col * 2 + 1] = el }} className="db-meter-dot" />
        </div>
      ))}
    </div>
  )
}
