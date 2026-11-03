import { useState } from 'react';
import { useGameStore } from '../../engine/store';
import { ResourceBar } from '../components/ResourceBar';
import { getRoomDefinition } from '../../data/rooms';
import { RoomInteraction } from '../../engine/types';

export function RoomScreen() {
  const currentRoom = useGameStore(s => s.currentRoom);
  const roomStates = useGameStore(s => s.roomStates);
  const exitRoom = useGameStore(s => s.exitRoom);
  const performInteraction = useGameStore(s => s.performInteraction);
  const actions = useGameStore(s => s.actions);
  const silver = useGameStore(s => s.silver);
  const candles = useGameStore(s => s.candles);
  const keys = useGameStore(s => s.keys);
  const casebook = useGameStore(s => s.casebook);

  const [activeResult, setActiveResult] = useState<{ text: string; isClue: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!currentRoom) return null;

  const roomDef = getRoomDefinition(currentRoom);
  if (!roomDef) return null;

  const rs = roomStates[currentRoom];

  const handleInteraction = (interaction: RoomInteraction) => {
    setError(null);
    const err = performInteraction(interaction.id);
    if (err) {
      setError(err);
      return;
    }

    const isClue = interaction.outcome.type === 'clue';
    setActiveResult({ text: interaction.outcome.text, isClue });
  };

  const isCompleted = (id: string) => rs?.completedInteractions.includes(id) ?? false;

  const canAfford = (cost: RoomInteraction['cost']) => {
    if ((cost.actions ?? 0) > actions) return false;
    if ((cost.silver ?? 0) > silver) return false;
    if ((cost.candles ?? 0) > candles) return false;
    if ((cost.keys ?? 0) > keys) return false;
    return true;
  };

  return (
    <div className="screen">
      <ResourceBar />

      <div className="screen-scroll" style={{ padding: '0 16px 24px' }}>
        {/* Room header */}
        <div style={styles.roomHeader} className="fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button style={styles.backBtn} onClick={exitRoom}>
              Return to Map
            </button>
            <span style={{
              fontSize: 10,
              fontWeight: 600,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.1em',
              color: `var(--color-${roomDef.rarity})`,
            }}>
              {roomDef.rarity} · {roomDef.category}
            </span>
          </div>

          <h2 style={styles.roomName}>{roomDef.name}</h2>
          <p style={styles.roomDesc}>{roomDef.description}</p>
        </div>

        {/* Result display */}
        {activeResult && (
          <div
            style={{
              ...styles.resultCard,
              borderColor: activeResult.isClue ? 'var(--text-accent)' : 'var(--border-medium)',
            }}
            className="fade-in"
          >
            {activeResult.isClue && (
              <p style={styles.clueLabel}>Evidence Discovered</p>
            )}
            <p style={styles.resultText}>{activeResult.text}</p>
            <button
              style={styles.dismissBtn}
              onClick={() => setActiveResult(null)}
            >
              Continue
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={styles.error} className="fade-in">{error}</div>
        )}

        {/* Interactions */}
        {!activeResult && (
          <div style={styles.interactions}>
            {roomDef.interactions.map(interaction => {
              const completed = isCompleted(interaction.id);
              const affordable = canAfford(interaction.cost);
              const disabled = (completed && !interaction.repeatable) || !affordable;

              return (
                <button
                  key={interaction.id}
                  onClick={() => !disabled && handleInteraction(interaction)}
                  style={{
                    ...styles.interactionBtn,
                    opacity: disabled ? 0.45 : 1,
                    cursor: disabled ? 'default' : 'pointer',
                  }}
                >
                  <div style={styles.interactionHeader}>
                    <span style={styles.interactionType}>
                      {interaction.type === 'inspect' ? 'Free' : `${interaction.type}`}
                    </span>
                    {completed && !interaction.repeatable && (
                      <span style={styles.completedBadge}>Done</span>
                    )}
                  </div>
                  <span style={styles.interactionLabel}>{interaction.label}</span>
                  <span style={styles.interactionDesc}>{interaction.description}</span>
                  {Object.keys(interaction.cost).length > 0 && (
                    <div style={styles.costRow}>
                      {interaction.cost.actions && (
                        <span style={{ color: 'var(--color-action)' }}>
                          {interaction.cost.actions} Action{interaction.cost.actions > 1 ? 's' : ''}
                        </span>
                      )}
                      {interaction.cost.silver && (
                        <span style={{ color: 'var(--color-silver)' }}>
                          {interaction.cost.silver} Silver
                        </span>
                      )}
                      {interaction.cost.candles && (
                        <span style={{ color: 'var(--color-candle)' }}>
                          {interaction.cost.candles} Candle{interaction.cost.candles > 1 ? 's' : ''}
                        </span>
                      )}
                      {interaction.cost.keys && (
                        <span style={{ color: 'var(--color-key)' }}>
                          {interaction.cost.keys} Key{interaction.cost.keys > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  roomHeader: {
    paddingTop: 16,
    paddingBottom: 16,
    borderBottom: '1px solid var(--border-subtle)',
    marginBottom: 16,
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-accent)',
    fontSize: 13,
    fontWeight: 500,
    padding: '8px 0',
    marginBottom: 12,
    fontFamily: 'var(--font-sans)',
  },
  roomName: {
    fontFamily: 'var(--font-serif)',
    fontSize: 26,
    fontWeight: 700,
    marginTop: 8,
  },
  roomDesc: {
    fontFamily: 'var(--font-serif)',
    fontSize: 15,
    color: 'var(--text-secondary)',
    fontStyle: 'italic',
    marginTop: 8,
    lineHeight: 1.6,
  },
  resultCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-medium)',
    borderRadius: 'var(--radius-md)',
    padding: 16,
    marginBottom: 16,
  },
  clueLabel: {
    fontSize: 10,
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    color: 'var(--text-accent)',
    marginBottom: 8,
  },
  resultText: {
    fontFamily: 'var(--font-serif)',
    fontSize: 15,
    lineHeight: 1.7,
    color: 'var(--text-primary)',
  },
  dismissBtn: {
    marginTop: 12,
    background: 'var(--bg-card-hover)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-secondary)',
    fontSize: 13,
    padding: '8px 16px',
    fontFamily: 'var(--font-sans)',
  },
  error: {
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-warning)',
    padding: '8px 0',
    marginBottom: 8,
  },
  interactions: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  interactionBtn: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-medium)',
    borderRadius: 'var(--radius-md)',
    padding: '12px 14px',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    transition: 'opacity 0.15s',
  },
  interactionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  interactionType: {
    fontSize: 10,
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    color: 'var(--text-muted)',
  },
  completedBadge: {
    fontSize: 9,
    fontWeight: 600,
    color: 'var(--color-success)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
  },
  interactionLabel: {
    fontSize: 15,
    fontWeight: 600,
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-serif)',
  },
  interactionDesc: {
    fontSize: 13,
    color: 'var(--text-secondary)',
    lineHeight: 1.4,
  },
  costRow: {
    display: 'flex',
    gap: 12,
    marginTop: 4,
    fontSize: 11,
    fontWeight: 500,
  },
};
