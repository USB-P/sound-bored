import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

export default function SuggestModal({ user, onClose }) {
  const [name, setName] = useState('')
  const [link, setLink] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success | error

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('loading')
    const { error } = await supabase.from('sound_suggestions').insert({
      user_id: user.id,
      user_name: user.fullName || user.username || user.primaryEmailAddress?.emailAddress,
      sound_name: name.trim(),
      link: link.trim(),
    })
    setStatus(error ? 'error' : 'success')
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">suggest a sound</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {status === 'success' ? (
          <div className="modal-success">
            <p>suggestion sent!</p>
            <button className="modal-submit" onClick={onClose}>close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="modal-field">
              <label className="modal-label">sound name</label>
              <input
                className="modal-input"
                type="text"
                placeholder="e.g. janez_norc"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="modal-field">
              <label className="modal-label">link</label>
              <input
                className="modal-input"
                type="url"
                placeholder="https://..."
                value={link}
                onChange={e => setLink(e.target.value)}
                required
              />
            </div>
            {status === 'error' && <p className="modal-error">something went wrong, try again</p>}
            <button className="modal-submit" type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? 'sending...' : 'send'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
