import { useState } from 'react';
import { useGameStore } from '../../engine/store';
import { ResourceBar } from '../components/ResourceBar';
import { getRoomDefinition } from '../../data/rooms';
import { getItemDefinition } from '../../data/items';
import { RoomInteraction, MysteryCompletionEvent, MAX_INVENTORY } from '../../engine/types';

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  inspect: { label: 'Free', color: 'var(--text-muted)' },
  search: { label: 'Search', color: 'var(--color-candle)' },
  special: { label: 'Special', color: 'var(--color-exceptional)' },
};

type ResultKind = 'clue' | 'item' | 'narrative';

export function RoomScreen() {
  const currentRoom = useGameStore(s => s.currentRoom);
  const roomStates = useGameStore(s => s.roomStates);
  const exitRoom = useGameStore(s => s.exitRoom);
  const performInteraction = useGameStore(s => s.performInteraction);
  const actions = useGameStore(s => s.actions);
  const silver = useGameStore(s => s.silver);
  const candles = useGameStore(s => s.candles);
  const keys = useGameStore(s => s.keys);
  const inventory = useGameStore(s => s.inventory);

  const [activeResult, setActiveResult] = useState<{ text: string; kind: ResultKind; itemId?: string } | null>(null);
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

    const kind: ResultKind =
      interaction.outcome.type === 'clue' ? 'clue' :
      interaction.outcome.type === 'item' ? 'item' : 'narrative';

    setActiveResult({
      text: interaction.outcome.text,
      kind,
      itemId: result?.itemGained ?? interaction.outcome.itemId,
    });

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

  const canAfford = (interaction: RoomInteraction) => {
    const cost = interaction.cost;
    if ((cost.actions ?? 0) > actions) return false;
    if ((cost.silver ?? 0) > silver) return false;
    if ((cost.candles ?? 0) > candles) return false;
    if ((cost.keys ?? 0) > keys) return false;
    if (interaction.condition?.type === 'hasItem') {
      if (!inventory.includes(interaction.condition.value as string)) return false;
    }
    return true;
  };

  const completedCount = rs ? rs.completedInteractions.length : 0;
  const totalInteractions = roomDef.interactions.length;

  return (
    <div className="screen">
      <ResourceBar />

      {/* FIXED back bar — always visible, never scrolls away */}
      <div className="back-bar">
        <button className="back-btn" onClick={exitRoom}>
          ← Return to Map
        </button>
        <span className="badge badge-accent" style={{ color: `var(--color-${roomDef.rarity})` }}>
          {roomDef.rarity}
        </span>
      </div>

      <div className="screen-scroll" style={{ padding: '0 16px 32px' }}>
        {/* Room header */}
        <div style={{ paddingTop: 16, paddingBottom: 16, borderBottom: '1px solid var(--border-subtle)', marginBottom: 16 }} className="fade-in">
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 26,
            fontWeight: 700,
          }}>{roomDef.name}</h2>
          <p style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 15,
            color: 'var(--text-secondary)',
            fontStyle: 'italic',
            marginTop: 8,
            lineHeight: 1.6,
          }}>{roomDef.description}</p>

          {/* Progress bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              {completedCount}/{totalInteractions} discovered
            </span>
            <div style={{
              flex: 1, height: 4, background: 'var(--border-subtle)',
              borderRadius: 2, overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                background: completedCount === totalInteractions ? 'var(--color-success)' : 'var(--text-accent)',
                borderRadius: 2,
                width: `${(completedCount / totalInteractions) * 100}%`,
                transition: 'width 0.3s',
              }} />
            </div>
          </div>
        </div>

        {/* Inventory display */}
        {inventory.length > 0 && (
          <div style={{
            marginBottom: 16, padding: '10px 12px',
            background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-surface) 100%)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}>
            <span className="uppercase" style={{ display: 'block', color: 'var(--text-muted)', marginBottom: 8 }}>
              Inventory
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              {inventory.map(itemId => {
                const item = getItemDefinition(itemId);
                if (!item) return null;
                return (
                  <div key={itemId} className="badge badge-accent" style={{ padding: '4px 8px', gap: 4 }}>
                    <svg width={14} height={14} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                      <path d={item.icon} stroke="var(--text-accent)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span style={{ fontSize: 11, fontWeight: 500 }}>{item.name}</span>
                  </div>
                );
              })}
              {Array.from({ length: MAX_INVENTORY - inventory.length }).map((_, i) => (
                <div key={`empty-${i}`} style={{
                  width: 32, height: 26, borderRadius: 'var(--radius-sm)',
                  border: '1px dashed var(--border-subtle)',
                }} />
              ))}
            </div>
          </div>
        )}

        {/* Mystery completion overlay */}
        {mysteryEvent && !activeResult && (
          <div className="mystery-card fade-in" style={{ marginBottom: 16 }}>
            <p className="uppercase" style={{ color: 'var(--text-accent)', marginBottom: 8, letterSpacing: '0.15em' }}>
              Mystery Solved
            </p>
            <h3 style={{
              fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 700, marginBottom: 10,
            }}>{mysteryEvent.title}</h3>
            <p style={{
              fontFamily: 'var(--font-serif)', fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)',
            }}>{mysteryEvent.resolution}</p>
            {mysteryEvent.reward && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
                <p className="uppercase" style={{ color: 'var(--color-success)', marginBottom: 4 }}>Reward</p>
                <p style={{ fontSize: 13, color: 'var(--text-primary)' }}>{mysteryEvent.reward.description}</p>
              </div>
            )}
            <button className="btn btn-secondary" style={{ marginTop: 14, width: '100%' }} onClick={dismissMystery}>
              Continue
            </button>
          </div>
        )}

        {/* Result display */}
        {activeResult && (
          <div
            className={`fade-in result-card ${
              activeResult.kind === 'clue' ? 'result-card-clue' :
              activeResult.kind === 'item' ? 'result-card-item' : ''
            }`}
          >
            {activeResult.kind === 'clue' && (
              <p className="uppercase" style={{ color: 'var(--text-accent)', marginBottom: 8, letterSpacing: '0.1em' }}>
                Evidence Discovered
              </p>
            )}
            {activeResult.kind === 'item' && (
              <p className="uppercase" style={{ color: 'var(--color-action)', marginBottom: 8, letterSpacing: '0.1em' }}>
                Item Found
              </p>
            )}
            <p style={{
              fontFamily: 'var(--font-serif)', fontSize: 15, lineHeight: 1.7, color: 'var(--text-primary)',
            }}>{activeResult.text}</p>
            {activeResult.kind === 'item' && activeResult.itemId && (() => {
              const itemDef = getItemDefinition(activeResult.itemId);
              if (!itemDef) return null;
              return (
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 12,
                  padding: '10px 12px',
                  background: 'rgba(92, 184, 92, 0.08)',
                  border: '1px solid rgba(92, 184, 92, 0.2)',
                  borderRadius: 'var(--radius-sm)',
                }}>
                  <svg width={20} height={20} viewBox="0 0 16 16" fill="none">
                    <path d={itemDef.icon} stroke="var(--color-action)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div>
                    <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-action)' }}>
                      {itemDef.name}
                    </span>
                    <span style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4, marginTop: 2 }}>
                      {itemDef.description}
                    </span>
                  </div>
                </div>
              );
            })()}
            <button className="btn btn-secondary" style={{ marginTop: 14, width: '100%' }} onClick={dismissResult}>
              Continue
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="fade-in" style={{
            textAlign: 'center', fontSize: 13, color: 'var(--color-warning)',
            padding: '8px 0', marginBottom: 8,
          }}>{error}</div>
        )}

        {/* Interactions list */}
        {!activeResult && !mysteryEvent && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {roomDef.interactions.map(interaction => {
              const completed = isCompleted(interaction.id);
              const affordable = canAfford(interaction);
              const disabled = (completed && !interaction.repeatable) || !affordable;
              const typeInfo = TYPE_LABELS[interaction.type] ?? TYPE_LABELS.inspect;

              const hasItemCond = interaction.condition?.type === 'hasItem'
                ? interaction.condition.value as string
                : null;
              const hasItemDef = hasItemCond ? getItemDefinition(hasItemCond) : null;
              const playerHasItem = hasItemCond ? inventory.includes(hasItemCond) : true;

              const cardClass = [
                'interaction-card',
                completed && !interaction.repeatable ? 'interaction-card-done' : '',
                !affordable && !completed ? 'interaction-card-locked' : '',
              ].filter(Boolean).join(' ');

              return (
                <button
                  key={interaction.id}
                  className={cardClass}
                  onClick={() => !disabled && handleInteraction(interaction)}
                  style={{
                    cursor: disabled ? 'default' : 'pointer',
                    width: '100%',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="uppercase" style={{ color: typeInfo.color }}>
                      {typeInfo.label}
                    </span>
                    {completed && !interaction.repeatable && (
                      <span className="badge badge-success">Done</span>
                    )}
                    {!affordable && !completed && (
                      <span className="badge badge-danger">
                        {!playerHasItem ? 'Missing item' : "Can't afford"}
                      </span>
                    )}
                  </div>
                  <span style={{
                    fontSize: 15, fontWeight: 600, color: 'var(--text-primary)',
                    fontFamily: 'var(--font-serif)', textAlign: 'left',
                  }}>{interaction.label}</span>
                  <span style={{
                    fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4, textAlign: 'left',
                  }}>{interaction.description}</span>

                  {/* Cost row */}
                  <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: 11, fontWeight: 500 }}>
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

                  {/* Item requirement */}
                  {hasItemDef && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <svg width={12} height={12} viewBox="0 0 16 16" fill="none">
                        <path
                          d={hasItemDef.icon}
                          stroke={playerHasItem ? 'var(--color-action)' : 'var(--color-danger)'}
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span style={{
                        color: playerHasItem ? 'var(--color-action)' : 'var(--color-danger)',
                        fontSize: 11, fontWeight: 500,
                      }}>
                        Requires {hasItemDef.name}
                        {playerHasItem ? ' (consumes)' : ' — not in inventory'}
                      </span>
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
