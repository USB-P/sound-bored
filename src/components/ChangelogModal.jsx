import { useEffect } from 'react'

export const CHANGELOG_VERSION = '3'

export const CHANGELOG = [
  {
    version: '3',
    title: "what's new",
    items: [
      'sounds are all the same volume now. no more getting blasted.',
      'each button shows who last played it. updates live.',
      'every play gets tracked. leaderboards are coming.',
      'button at the bottom clears your avatar from everyone else\'s view',
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
