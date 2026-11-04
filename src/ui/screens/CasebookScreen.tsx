import { useState } from 'react';
import { useGameStore } from '../../engine/store';
import { getClue, getMystery, MYSTERIES } from '../../data/mysteries';
import { getItemDefinition } from '../../data/items';
import { MAX_INVENTORY } from '../../engine/types';

type Tab = 'evidence' | 'mysteries' | 'inventory';

export function CasebookScreen() {
  const casebook = useGameStore(s => s.casebook);
  const inventory = useGameStore(s => s.inventory);
  const phase = useGameStore(s => s.previousPhase);
  const closeCasebook = useGameStore(s => s.closeCasebook);
  const [tab, setTab] = useState<Tab>('evidence');

  const showInventory = phase === 'exploration' || phase === 'room';

  return (
    <div className="screen">
      {/* Fixed header */}
      <div className="back-bar">
        <button className="back-btn" onClick={closeCasebook}>
          ← Back
        </button>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 600 }}>Casebook</h2>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0,
        background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-deep) 100%)',
      }}>
        <TabButton active={tab === 'evidence'} onClick={() => setTab('evidence')}>
          Evidence ({casebook.evidence.length})
        </TabButton>
        <TabButton active={tab === 'mysteries'} onClick={() => setTab('mysteries')}>
          Mysteries
        </TabButton>
        {showInventory && (
          <TabButton active={tab === 'inventory'} onClick={() => setTab('inventory')}>
            Items ({inventory.length}/{MAX_INVENTORY})
          </TabButton>
        )}
      </div>

      <div className="screen-scroll" style={{ padding: 16 }}>
        {tab === 'evidence' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {casebook.evidence.length === 0 ? (
              <p style={{
                textAlign: 'center', color: 'var(--text-muted)', fontSize: 14,
                padding: '40px 0', fontStyle: 'italic',
                fontFamily: 'var(--font-serif)',
              }}>
                No evidence collected yet. Search rooms to discover clues.
              </p>
            ) : (
              casebook.evidence.map(clueId => {
                const clue = getClue(clueId);
                if (!clue) return null;
                return (
                  <div key={clueId} className="game-card fade-in" style={{ padding: '12px 14px' }}>
                    <p className="uppercase" style={{ color: 'var(--text-muted)', marginBottom: 4 }}>
                      From: {clue.sourceRoom.replace(/_/g, ' ')}
                    </p>
                    <h3 style={{
                      fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 600,
                    }}>{clue.title}</h3>
                    <p style={{
                      fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.5,
                    }}>{clue.description}</p>
                  </div>
                );
              })
            )}
          </div>
        )}

        {tab === 'mysteries' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {MYSTERIES.map(mystery => {
              const progress = casebook.mysteryProgress[mystery.id] ?? [];
              const isComplete = casebook.completedMysteries.includes(mystery.id);
              const progressFraction = `${progress.length}/${mystery.requiredClues}`;

              return (
                <div
                  key={mystery.id}
                  className={`fade-in ${isComplete ? 'mystery-card' : 'game-card'}`}
                  style={{ padding: isComplete ? 20 : '12px 14px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{
                      fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 600,
                    }}>{mystery.title}</h3>
                    {isComplete ? (
                      <span className="badge badge-success">Solved</span>
                    ) : (
                      <span className="badge badge-accent">{progressFraction}</span>
                    )}
                  </div>
                  <p style={{
                    fontFamily: 'var(--font-serif)', fontSize: 14, fontStyle: 'italic',
                    color: 'var(--text-secondary)', marginTop: 4,
                  }}>{mystery.question}</p>
                  {progress.length > 0 && (
                    <div style={{
                      marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border-subtle)',
                    }}>
                      {progress.map(clueId => {
                        const clue = getClue(clueId);
                        return clue ? (
                          <p key={clueId} style={{
                            fontSize: 12, color: 'var(--text-accent)', padding: '2px 0',
                          }}>
                            {clue.title}
                          </p>
                        ) : null;
                      })}
                    </div>
                  )}
                  {isComplete && (
                    <p style={{
                      marginTop: 8, paddingTop: 8,
                      borderTop: '1px solid rgba(228, 180, 76, 0.2)',
                      fontFamily: 'var(--font-serif)', fontSize: 13,
                      color: 'var(--text-primary)', fontStyle: 'italic', lineHeight: 1.6,
                    }}>{mystery.resolution}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {tab === 'inventory' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {inventory.length === 0 ? (
              <p style={{
                textAlign: 'center', color: 'var(--text-muted)', fontSize: 14,
                padding: '40px 0', fontStyle: 'italic',
                fontFamily: 'var(--font-serif)',
              }}>
                No items in your possession. Search rooms to find useful objects.
              </p>
            ) : (
              inventory.map(itemId => {
                const def = getItemDefinition(itemId);
                if (!def) return null;
                return (
                  <div key={itemId} className="game-card game-card-selected fade-in" style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <svg width={24} height={24} viewBox="0 0 16 16" fill="none">
                        <path d={def.icon} stroke="var(--text-accent)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <h3 style={{
                        fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 600,
                      }}>{def.name}</h3>
                    </div>
                    <p style={{
                      fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5,
                    }}>{def.description}</p>
                  </div>
                );
              })
            )}
            <p style={{
              textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', padding: '8px 0',
            }}>
              {MAX_INVENTORY - inventory.length} empty slot{MAX_INVENTORY - inventory.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '10px 16px',
        background: 'none',
        border: 'none',
        borderBottom: `2px solid ${active ? 'var(--text-accent)' : 'transparent'}`,
        color: active ? 'var(--text-accent)' : 'var(--text-muted)',
        fontSize: 13,
        fontWeight: active ? 600 : 500,
        fontFamily: 'var(--font-sans)',
        cursor: 'pointer',
        transition: 'color 0.2s, border-color 0.2s',
      }}
    >
      {children}
    </button>
  );
}
