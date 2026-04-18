type Props = { streak: number }

export function SquirrelMascot({ streak }: Props) {
  const getSquirrel = () => {
    if (streak === 0) return { emoji: '🐿️', mood: 'Come on, you got this!', nuts: 0 }
    if (streak < 3)   return { emoji: '🐿️', mood: 'Great start, keep going!', nuts: 1 }
    if (streak < 7)   return { emoji: '🐿️💪', mood: 'You\'re on a roll!', nuts: 3 }
    if (streak < 14)  return { emoji: '🐿️⭐', mood: 'One week strong!', nuts: 7 }
    if (streak < 30)  return { emoji: '🐿️🏆', mood: 'Two weeks? Legend.', nuts: 14 }
    return { emoji: '🐿️👑', mood: 'Absolute unit. Crowned squirrel.', nuts: 30 }
  }

  const { emoji, mood, nuts } = getSquirrel()

  return (
    <div className="squirrel-container">
      <div className="squirrel-emoji">{emoji}</div>
      <p className="squirrel-mood">{mood}</p>
      {nuts > 0 && (
        <div className="nuts-row">
          {Array.from({ length: Math.min(nuts, 10) }).map((_, i) => (
            <span key={i} className="nut">🌰</span>
          ))}
          {nuts > 10 && <span className="nut-overflow">+{nuts - 10} more</span>}
        </div>
      )}
    </div>
  )
}
