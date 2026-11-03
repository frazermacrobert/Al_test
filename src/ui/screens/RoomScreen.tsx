import { useState } from 'react';
import { useGameStore } from '../../engine/store';
import { ResourceBar } from '../components/ResourceBar';
import { getRoomDefinition } from '../../data/rooms';
import { RoomInteraction, MysteryCompletionEvent } from '../../engine/types';

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  inspect: { label: 'Free', color: 'var(--text-muted)' },
  search: { label: 'Search', color: 'var(--color-candle)' },
  special: { label: 'Special', color: 'var(--color-exceptional)' },
};

export function RoomScreen() {
  const currentRoom = useGameStore(s => s.currentRoom);
  const roomStates = useGameStore(s => s.roomStates);
  const exitRoom = useGameStore(s => s.exitRoom);
  const performInteraction = useGameStore(s => s.performInteraction);
  const actions = useGameStore(s => s.actions);
  const silver = useGameStore(s => s.silver);
  const candles = useGameStore(s => s.candles);
  const keys = useGameStore(s => s.keys);

  const [activeResult, setActiveResult] = useState<{ text: string; isClue: boolean } | null>(null);
  const [mysteryEvent, setMysteryEvent] = useState<MysteryCompletionEvent | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!currentRoom) return null;

  const roomDef = getRoomDefinition(currentRoom);
  if (!roomDef) return null;

  const rs = roomStates[currentRoom];

  const handleInteraction = (interaction: RoomInteraction) => {
    setError(null);
    const result = performInteraction(interaction.id);

    if (result?.error) {
      setError(result.error);
      return;
    }

    const isClue = interaction.outcome.type === 'clue';
    setActiveResult({ text: interaction.outcome.text, isClue });

    if (result?.mysteryCompleted) {
      setMysteryEvent(result.mysteryCompleted);
    }
  };

  const dismissResult = () => {
    setActiveResult(null);
  };

  const dismissMystery = () => {
    setMysteryEvent(null);
  };

  const isCompleted = (id: string) => rs?.completedInteractions.includes(id) ?? false;

  const canAfford = (cost: RoomInteraction['cost']) => {
    if ((cost.actions ?? 0) > actions) return false;
    if ((cost.silver ?? 0) > silver) return false;
    if ((cost.candles ?? 0) > candles) return false;
    if ((cost.keys ?? 0) > keys) return false;
    return true;
  };

  const completedCount = rs ? rs.completedInteractions.length : 0;
  const totalInteractions = roomDef.interactions.length;

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
          <div style={styles.progressRow}>
            <span style={styles.progressText}>
              {completedCount}/{totalInteractions} discovered
            </span>
            <div style={styles.progressBar}>
              <div style={{
                ...styles.progressFill,
                width: `${(completedCount / totalInteractions) * 100}%`,
              }} />
            </div>
          </div>
        </div>

        {/* Mystery completion overlay */}
        {mysteryEvent && !activeResult && (
          <div style={styles.mysteryCard} className="fade-in">
            <p style={styles.mysteryLabel}>Mystery Solved</p>
            <h3 style={styles.mysteryTitle}>{mysteryEvent.title}</h3>
            <p style={styles.mysteryResolution}>{mysteryEvent.resolution}</p>
            {mysteryEvent.reward && (
              <div style={styles.rewardBox}>
                <p style={styles.rewardLabel}>Reward</p>
                <p style={styles.rewardText}>{mysteryEvent.reward.description}</p>
              </div>
            )}
            <button style={styles.dismissBtn} onClick={dismissMystery}>
              Continue
            </button>
          </div>
        )}

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
            <button style={styles.dismissBtn} onClick={dismissResult}>
              Continue
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={styles.error} className="fade-in">{error}</div>
        )}

        {/* Interactions */}
        {!activeResult && !mysteryEvent && (
          <div style={styles.interactions}>
            {roomDef.interactions.map(interaction => {
              const completed = isCompleted(interaction.id);
              const affordable = canAfford(interaction.cost);
              const disabled = (completed && !interaction.repeatable) || !affordable;
              const typeInfo = TYPE_LABELS[interaction.type] ?? TYPE_LABELS.inspect;

              return (
                <button
                  key={interaction.id}
                  onClick={() => !disabled && handleInteraction(interaction)}
                  style={{
                    ...styles.interactionBtn,
                    opacity: disabled ? 0.45 : 1,
                    cursor: disabled ? 'default' : 'pointer',
                    borderLeftColor: completed && !interaction.repeatable
                      ? 'var(--color-success)'
                      : !affordable
                        ? 'var(--color-danger)'
                        : 'var(--border-medium)',
                  }}
                >
                  <div style={styles.interactionHeader}>
                    <span style={{ ...styles.interactionType, color: typeInfo.color }}>
                      {typeInfo.label}
                    </span>
                    {completed && !interaction.repeatable && (
                      <span style={styles.completedBadge}>Done</span>
                    )}
                    {!affordable && !completed && (
                      <span style={styles.cantAffordBadge}>Can't afford</span>
                    )}
                  </div>
                  <span style={styles.interactionLabel}>{interaction.label}</span>
                  <span style={styles.interactionDesc}>{interaction.description}</span>
                  {Object.keys(interaction.cost).length > 0 && (
                    <div style={styles.costRow}>
                      {interaction.cost.actions ? (
                        <span style={{ color: 'var(--color-action)' }}>
                          {interaction.cost.actions} Action{interaction.cost.actions > 1 ? 's' : ''}
                        </span>
                      ) : null}
                      {interaction.cost.silver ? (
                        <span style={{ color: 'var(--color-silver)' }}>
                          {interaction.cost.silver} Silver
                        </span>
                      ) : null}
                      {interaction.cost.candles ? (
                        <span style={{ color: 'var(--color-candle)' }}>
                          {interaction.cost.candles} Candle{interaction.cost.candles > 1 ? 's' : ''}
                        </span>
                      ) : null}
                      {interaction.cost.keys ? (
                        <span style={{ color: 'var(--color-key)' }}>
                          {interaction.cost.keys} Key{interaction.cost.keys > 1 ? 's' : ''}
                        </span>
                      ) : null}
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
  progressRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  progressText: {
    fontSize: 11,
    color: 'var(--text-muted)',
    whiteSpace: 'nowrap',
  },
  progressBar: {
    flex: 1,
    height: 4,
    background: 'var(--border-subtle)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'var(--color-success)',
    borderRadius: 2,
    transition: 'width 0.3s',
  },
  mysteryCard: {
    background: 'var(--bg-card)',
    border: '2px solid var(--text-accent)',
    borderRadius: 'var(--radius-lg)',
    padding: 20,
    marginBottom: 16,
  },
  mysteryLabel: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.15em',
    color: 'var(--text-accent)',
    marginBottom: 8,
  },
  mysteryTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: 22,
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: 10,
  },
  mysteryResolution: {
    fontFamily: 'var(--font-serif)',
    fontSize: 14,
    lineHeight: 1.7,
    color: 'var(--text-secondary)',
  },
  rewardBox: {
    marginTop: 12,
    paddingTop: 12,
    borderTop: '1px solid var(--border-subtle)',
  },
  rewardLabel: {
    fontSize: 10,
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    color: 'var(--color-success)',
    marginBottom: 4,
  },
  rewardText: {
    fontSize: 13,
    color: 'var(--text-primary)',
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
    borderLeft: '3px solid var(--border-medium)',
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
  },
  completedBadge: {
    fontSize: 9,
    fontWeight: 600,
    color: 'var(--color-success)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
  },
  cantAffordBadge: {
    fontSize: 9,
    fontWeight: 600,
    color: 'var(--color-danger)',
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
