import { useState } from 'react';
import { useGameStore } from '../../engine/store';
import { ResourceBar } from '../components/ResourceBar';
import { getRoomDefinition } from '../../data/rooms';
import { getSynergyDefinitions } from '../../data/synergies';
import { GRID_SIZE } from '../../engine/types';
import { validatePlacement } from '../../engine/grid';

export function ConstructionScreen() {
  const grid = useGameStore(s => s.grid);
  const placedRooms = useGameStore(s => s.placedRooms);
  const currentHand = useGameStore(s => s.currentHand);
  const draftsRemaining = useGameStore(s => s.draftsRemaining);
  const placeRoom = useGameStore(s => s.placeRoom);
  const finishConstruction = useGameStore(s => s.finishConstruction);
  const activeSynergies = useGameStore(s => s.activeSynergies);

  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [synergyNotice, setSynergyNotice] = useState<string | null>(null);

  const handleSelectCard = (roomId: string) => {
    setSelectedRoom(roomId);
    setFeedback(null);
  };

  const handleCellTap = (row: number, col: number) => {
    if (!selectedRoom) {
      setFeedback('Select a room card first.');
      return;
    }
    const prevSynergies = [...activeSynergies];
    const error = placeRoom(selectedRoom, { row, col });
    if (error) {
      setFeedback(error);
    } else {
      const newSynergies = useGameStore.getState().activeSynergies;
      const fresh = newSynergies.filter(s => !prevSynergies.includes(s));
      if (fresh.length > 0) {
          const syn = getSynergyDefinitions().find(s => s.id === fresh[0]);
        if (syn) setSynergyNotice(`${syn.name}: ${syn.effect.description}`);
        setTimeout(() => setSynergyNotice(null), 3000);
      }
      setSelectedRoom(null);
      setFeedback(null);
    }
  };

  const cellSize = Math.min(52, (window.innerWidth - 48) / GRID_SIZE);

  return (
    <div className="screen">
      <ResourceBar />

      <div style={styles.header}>
        <h2 style={styles.title}>Build the Mansion</h2>
        <p style={styles.subtitle}>
          {draftsRemaining > 0
            ? `${draftsRemaining} room${draftsRemaining !== 1 ? 's' : ''} to place`
            : 'Construction complete'}
        </p>
      </div>

      {/* Grid */}
      <div style={styles.gridContainer}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_SIZE}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, ${cellSize}px)`,
          gap: 2,
        }}>
          {Array.from({ length: GRID_SIZE }, (_, row) =>
            Array.from({ length: GRID_SIZE }, (_, col) => {
              const roomId = grid[row][col];
              const roomDef = roomId ? getRoomDefinition(roomId) : null;
              const isValid = selectedRoom
                ? validatePlacement(selectedRoom, { row, col }, grid, placedRooms).valid
                : false;
              const isEmpty = !roomId;

              return (
                <div
                  key={`${row}-${col}`}
                  onClick={() => isEmpty && handleCellTap(row, col)}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    background: roomDef
                      ? 'var(--bg-card)'
                      : isValid
                        ? 'rgba(139, 115, 64, 0.15)'
                        : 'var(--bg-surface)',
                    border: roomDef
                      ? '1px solid var(--border-medium)'
                      : isValid
                        ? '1px dashed var(--border-accent)'
                        : '1px solid var(--border-subtle)',
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 8,
                    color: roomDef ? 'var(--text-secondary)' : 'var(--text-muted)',
                    textAlign: 'center',
                    cursor: isEmpty && selectedRoom ? 'pointer' : 'default',
                    transition: 'background 0.15s, border-color 0.15s',
                    padding: 2,
                    lineHeight: 1.1,
                    overflow: 'hidden',
                  }}
                >
                  {roomDef ? (
                    <RoomCellIcon roomId={roomId!} size={cellSize} />
                  ) : isValid ? (
                    <span style={{ fontSize: 16, color: 'var(--border-accent)' }}>+</span>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Synergy notice */}
      {synergyNotice && (
        <div style={styles.synergyNotice} className="fade-in">
          {synergyNotice}
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <div style={styles.feedback}>{feedback}</div>
      )}

      {/* Draft hand */}
      {draftsRemaining > 0 && currentHand.length > 0 ? (
        <div style={styles.handContainer}>
          <div style={styles.hand}>
            {currentHand.map(roomId => {
              const def = getRoomDefinition(roomId);
              if (!def) return null;
              const isSelected = selectedRoom === roomId;
              return (
                <button
                  key={roomId}
                  onClick={() => handleSelectCard(roomId)}
                  style={{
                    ...styles.card,
                    borderColor: isSelected ? 'var(--text-accent)' : 'var(--border-medium)',
                    background: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                    transform: isSelected ? 'translateY(-4px)' : 'none',
                  }}
                >
                  <span style={{
                    ...styles.cardRarity,
                    color: `var(--color-${def.rarity})`,
                  }}>
                    {def.rarity}
                  </span>
                  <span style={styles.cardName}>{def.name}</span>
                  <span style={styles.cardCategory}>{def.category}</span>
                  <DoorIndicator doors={def.doors} />
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div style={styles.handContainer}>
          <button className="btn btn-primary" style={{ width: '100%', maxWidth: 300 }} onClick={finishConstruction}>
            Explore the Mansion
          </button>
        </div>
      )}
    </div>
  );
}

function RoomCellIcon({ roomId, size }: { roomId: string; size: number }) {
  const def = getRoomDefinition(roomId);
  if (!def) return null;
  const iconSize = Math.max(10, size * 0.5);

  const icons: Record<string, string> = {
    entrance_hall: 'M8 2L2 6v8h12V6L8 2zM6 14v-4h4v4',
    library: 'M3 2h10v12H3V2zM5 4h6M5 6h6M5 8h4',
    study: 'M2 4h12v8H2V4zM5 12v2h6v-2M8 4V2',
    kitchen: 'M3 6h10v6H3V6zM6 6V4M10 6V4M3 9h10',
    portrait_gallery: 'M4 3h8v10H4V3zM6 6h4v3H6V6',
    nursery: 'M4 8a4 4 0 018 0M8 4V2M6 12h4M3 14h10',
  };

  const path = icons[roomId] ?? 'M4 4h8v8H4z';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
      <svg width={iconSize} height={iconSize} viewBox="0 0 16 16" fill="none">
        <path d={path} stroke="var(--text-secondary)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span style={{ fontSize: Math.max(7, size * 0.14), color: 'var(--text-muted)', lineHeight: 1 }}>
        {def.name.split(' ')[0]}
      </span>
    </div>
  );
}

function DoorIndicator({ doors }: { doors: { N: boolean; S: boolean; E: boolean; W: boolean } }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" style={{ marginTop: 4 }}>
      <rect x="6" y="6" width="12" height="12" fill="none" stroke="var(--border-subtle)" strokeWidth="1" rx="2" />
      {doors.N && <line x1="10" y1="6" x2="14" y2="6" stroke="var(--text-accent)" strokeWidth="2" />}
      {doors.S && <line x1="10" y1="18" x2="14" y2="18" stroke="var(--text-accent)" strokeWidth="2" />}
      {doors.W && <line x1="6" y1="10" x2="6" y2="14" stroke="var(--text-accent)" strokeWidth="2" />}
      {doors.E && <line x1="18" y1="10" x2="18" y2="14" stroke="var(--text-accent)" strokeWidth="2" />}
    </svg>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    padding: '12px 16px 8px',
    textAlign: 'center',
    flexShrink: 0,
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: 22,
    fontWeight: 600,
  },
  subtitle: {
    fontSize: 13,
    color: 'var(--text-secondary)',
    marginTop: 4,
  },
  gridContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 16px',
    minHeight: 0,
  },
  feedback: {
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-warning)',
    padding: '4px 16px',
    flexShrink: 0,
  },
  synergyNotice: {
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-success)',
    padding: '6px 16px',
    background: 'rgba(110, 168, 110, 0.1)',
    borderTop: '1px solid rgba(110, 168, 110, 0.2)',
    borderBottom: '1px solid rgba(110, 168, 110, 0.2)',
    flexShrink: 0,
  },
  handContainer: {
    padding: '12px 16px 24px',
    display: 'flex',
    justifyContent: 'center',
    flexShrink: 0,
  },
  hand: {
    display: 'flex',
    gap: 8,
    justifyContent: 'center',
    width: '100%',
    maxWidth: 400,
  },
  card: {
    flex: '1 1 0',
    maxWidth: 120,
    background: 'var(--bg-card)',
    border: '1px solid var(--border-medium)',
    borderRadius: 'var(--radius-md)',
    padding: '10px 8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    transition: 'transform 0.15s, border-color 0.15s, background 0.15s',
    cursor: 'pointer',
  },
  cardRarity: {
    fontSize: 9,
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
  },
  cardName: {
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--text-primary)',
    textAlign: 'center',
    lineHeight: 1.2,
  },
  cardCategory: {
    fontSize: 9,
    color: 'var(--text-muted)',
    textTransform: 'capitalize' as const,
  },
};
