import { useState } from 'react'
import { useApi } from '../../hooks/useApi'
import type { TriggerType } from '../../types'

type Props = {
  triggerTypes: TriggerType[]
  onLogged: () => void
}

export function LogTrigger({ triggerTypes, onLogged }: Props) {
  const { logTrigger, loading } = useApi()
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<TriggerType | null>(null)
  const [resisted, setResisted] = useState<boolean | null>(null)
  const [intensity, setIntensity] = useState(5)
  const [notes, setNotes] = useState('')
  const [customText, setCustomText] = useState('')
  const [done, setDone] = useState(false)

  const categories = [...new Set(triggerTypes.map(t => t.category))]

  const handleSubmit = async () => {
    if (!selected || resisted === null) return
    try {
      await logTrigger({
        trigger_type_id: selected.id,
        resisted,
        intensity,
        notes: notes || undefined,
        custom_trigger_text: selected.category === 'custom' ? customText : undefined
      })
      setDone(true)
      setTimeout(() => {
        setOpen(false)
        setSelected(null)
        setResisted(null)
        setIntensity(5)
        setNotes('')
        setCustomText('')
        setDone(false)
        onLogged()
      }, 1500)
    } catch (err) {
      console.error(err)
    }
  }

  if (!open) {
    return (
      <button className="log-trigger-btn" onClick={() => setOpen(true)}>
        🚨 I have a craving
      </button>
    )
  }

  if (done) {
    return (
      <div className="trigger-done">
        {resisted ? '💪 You resisted! +1 nut for the squirrel 🌰' : '❤️ It\'s okay. Tomorrow is a new day.'}
      </div>
    )
  }

  return (
    <div className="log-trigger-panel">
      <h3>What's triggering you?</h3>

      {/* Trigger type picker grouped by category */}
      {categories.map(cat => (
        <div key={cat} className="trigger-category">
          <p className="category-label">{cat}</p>
          <div className="trigger-options">
            {triggerTypes.filter(t => t.category === cat).map(t => (
              <button
                key={t.id}
                className={`trigger-chip ${selected?.id === t.id ? 'selected' : ''}`}
                onClick={() => setSelected(t)}
              >
                {t.icon} {t.trigger_name}
              </button>
            ))}
          </div>
        </div>
      ))}

      {selected?.category === 'custom' && (
        <input
          type="text"
          placeholder="Describe your trigger..."
          value={customText}
          onChange={e => setCustomText(e.target.value)}
          className="custom-trigger-input"
        />
      )}

      {selected && (
        <>
          <div className="intensity-row">
            <label>Intensity: {intensity}/10</label>
            <input
              type="range" min={1} max={10} value={intensity}
              onChange={e => setIntensity(Number(e.target.value))}
            />
          </div>

          <div className="resisted-row">
            <p>Did you resist?</p>
            <button
              className={`resist-btn ${resisted === true ? 'active' : ''}`}
              onClick={() => setResisted(true)}
            >💪 Yes, I resisted!</button>
            <button
              className={`resist-btn relapse ${resisted === false ? 'active' : ''}`}
              onClick={() => setResisted(false)}
            >😔 No, I vaped</button>
          </div>

          <textarea
            placeholder="Any notes? (optional)"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
          />

          <div className="trigger-actions">
            <button onClick={() => setOpen(false)} className="cancel-btn">Cancel</button>
            <button
              onClick={handleSubmit}
              disabled={loading || resisted === null}
              className="submit-btn"
            >
              {loading ? 'Logging...' : 'Log it'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
