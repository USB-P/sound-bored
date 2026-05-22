import { useEffect } from 'react'

export const CHANGELOG_VERSION = '1'

export const CHANGELOG = [
  {
    version: '1',
    title: "what's new",
    items: [
      'Added a last-played avatar indicator on each sound button — see who played what in real time',
      'Play events now track who played which sound for future leaderboard stats',
      'Added a "clear my last played indicator" button at the bottom of the page',
    ],
  },
]

export default function ChangelogModal({ onClose }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const entry = CHANGELOG[0]

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal changelog-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{entry.title}</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <ul className="changelog-list">
          {entry.items.map((item, i) => (
            <li key={i} className="changelog-item">{item}</li>
          ))}
        </ul>
        <button className="modal-submit" onClick={onClose}>got it</button>
      </div>
    </div>
  )
}
