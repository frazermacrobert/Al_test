import { useState } from 'react';
import { useGameStore } from '../../engine/store';
import { ResourceBar } from '../components/ResourceBar';
import { getRoomDefinition } from '../../data/rooms';
import { getItemDefinition } from '../../data/items';
import { getRoomIcon } from '../roomIcons';
import { RoomInteraction, MysteryCompletionEvent, MAX_INVENTORY } from '../../engine/types';

const TYPE_ICONS: Record<string, { label: string; color: string; icon: string }> = {
  inspect: {
    label: 'Free',
    color: 'var(--text-muted)',
    icon: 'M8 3a5 5 0 014.5 7.07l2.7 2.7a.75.75 0 01-1.06 1.06l-2.7-2.7A5 5 0 118 3zm0 1.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z',
  },
  search: {
    label: 'Search',
    color: 'var(--color-candle)',
    icon: 'M8 2c0 0-2 2-2 4.5S8 11 8 11s2-2.5 2-4.5S8 2 8 2zM7 14h2M6 12.5h4',
  },
  special: {
    label: 'Special',
    color: 'var(--color-exceptional)',
    icon: 'M8 2l1.5 4.5H14l-3.7 2.8 1.4 4.5L8 11l-3.7 2.8 1.4-4.5L2 6.5h4.5z',
  },
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 'var(--radius-sm)',
              background: `linear-gradient(135deg, var(--rarity-${roomDef.rarity}-bg) 0%, transparent 100%)`,
              border: `1px solid var(--rarity-${roomDef.rarity}-border)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              boxShadow: 'var(--shadow-tile)',
            }}>
              <svg width={28} height={28} viewBox="0 0 16 16">
                <path
                  d={getRoomIcon(currentRoom!)}
                  fill={`var(--color-${roomDef.rarity})`}
                  fillOpacity="0.25"
                  stroke={`var(--color-${roomDef.rarity})`}
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 24,
                fontWeight: 700,
              }}>{roomDef.name}</h2>
            </div>
          </div>
          <p style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 15,
            color: 'var(--text-secondary)',
            fontStyle: 'italic',
            marginTop: 10,
            lineHeight: 1.6,
          }}>{roomDef.description}</p>

          {/* Progress bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', fontWeight: 500 }}>
              {completedCount}/{totalInteractions}
            </span>
            <div style={{
              flex: 1, height: 6, background: 'rgba(255,235,180,0.06)',
              borderRadius: 3, overflow: 'hidden',
              border: '1px solid rgba(255,235,180,0.04)',
            }}>
              <div style={{
                height: '100%',
                background: completedCount === totalInteractions
                  ? 'linear-gradient(90deg, #48b848, #68d868)'
                  : 'linear-gradient(90deg, #c89830, #e4b44c)',
                borderRadius: 3,
                width: `${(completedCount / totalInteractions) * 100}%`,
                transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: completedCount > 0
                  ? (completedCount === totalInteractions
                    ? '0 0 8px rgba(72,184,72,0.4)'
                    : '0 0 6px rgba(228,180,76,0.3)')
                  : 'none',
              }} />
            </div>
            {completedCount === totalInteractions && (
              <svg width={14} height={14} viewBox="0 0 16 16" style={{ flexShrink: 0 }}>
                <circle cx="8" cy="8" r="6" fill="var(--color-success)" fillOpacity="0.15" stroke="var(--color-success)" strokeWidth="1.5" />
                <path d="M5.5 8l2 2 3.5-3.5" fill="none" stroke="var(--color-success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
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
                    <svg width={14} height={14} viewBox="0 0 16 16" style={{ flexShrink: 0 }}>
                      <path d={item.icon} fill="var(--text-accent)" fillOpacity="0.2" stroke="var(--text-accent)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
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
            className={`slide-up result-card result-discover ${
              activeResult.kind === 'clue' ? 'result-card-clue result-discover-clue' :
              activeResult.kind === 'item' ? 'result-card-item result-discover-item' : ''
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
                  <svg width={22} height={22} viewBox="0 0 16 16">
                    <path d={itemDef.icon} fill="var(--color-action)" fillOpacity="0.2" stroke="var(--color-action)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
              const typeInfo = TYPE_ICONS[interaction.type] ?? TYPE_ICONS.inspect;

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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <svg width={12} height={12} viewBox="0 0 16 16">
                        <path d={typeInfo.icon} fill={typeInfo.color} fillOpacity="0.3" stroke={typeInfo.color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="uppercase" style={{ color: typeInfo.color }}>
                        {typeInfo.label}
                      </span>
                    </div>
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
                  <div style={{ display: 'flex', gap: 10, marginTop: 4, fontSize: 11, fontWeight: 600 }}>
                    {interaction.cost.actions ? (
                      <span style={{ color: 'var(--color-action)', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <svg width={10} height={10} viewBox="0 0 16 16"><path d="M8 2l2 4h-1.5v3h-1V6H6l2-4zM5 12h6M4 14h8" fill="var(--color-action)" fillOpacity="0.2" stroke="var(--color-action)" strokeWidth="1.2" strokeLinecap="round" /></svg>
                        {interaction.cost.actions}
                      </span>
                    ) : null}
                    {interaction.cost.silver ? (
                      <span style={{ color: 'var(--color-silver)', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <svg width={10} height={10} viewBox="0 0 16 16"><circle cx="8" cy="8" r="5.5" fill="var(--color-silver)" fillOpacity="0.15" stroke="var(--color-silver)" strokeWidth="1.2" /></svg>
                        {interaction.cost.silver}
                      </span>
                    ) : null}
                    {interaction.cost.candles ? (
                      <span style={{ color: 'var(--color-candle)', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <svg width={10} height={10} viewBox="0 0 16 16"><rect x="6" y="7" width="4" height="6" rx="1" fill="var(--color-candle)" fillOpacity="0.2" stroke="var(--color-candle)" strokeWidth="1" /><path d="M8 7V4c-1-1.5 0-3 0-3s1 1.5 0 3" fill="var(--color-candle)" fillOpacity="0.3" stroke="var(--color-candle)" strokeWidth="0.6" strokeLinecap="round" /></svg>
                        {interaction.cost.candles}
                      </span>
                    ) : null}
                    {interaction.cost.keys ? (
                      <span style={{ color: 'var(--color-key)', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <svg width={10} height={10} viewBox="0 0 16 16"><circle cx="6" cy="6" r="3" fill="var(--color-key)" fillOpacity="0.15" stroke="var(--color-key)" strokeWidth="1.2" /><path d="M8.5 8.5L12 12" stroke="var(--color-key)" strokeWidth="1.2" strokeLinecap="round" /></svg>
                        {interaction.cost.keys}
                      </span>
                    ) : null}
                  </div>

                  {/* Item requirement */}
                  {hasItemDef && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <svg width={14} height={14} viewBox="0 0 16 16">
                        <path
                          d={hasItemDef.icon}
                          fill={playerHasItem ? 'var(--color-action)' : 'var(--color-danger)'}
                          fillOpacity="0.2"
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
