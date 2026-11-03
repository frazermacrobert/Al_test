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
  const [tappedPlacedRoom, setTappedPlacedRoom] = useState<string | null>(null);

  const handleSelectCard = (roomId: string) => {
    setSelectedRoom(roomId);
    setTappedPlacedRoom(null);
    setFeedback(null);
  };

  const handleCellTap = (row: number, col: number) => {
    const existingRoom = grid[row][col];
    if (existingRoom) {
      setTappedPlacedRoom(existingRoom === tappedPlacedRoom ? null : existingRoom);
      return;
    }
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
        setTimeout(() => setSynergyNotice(null), 4000);
      }
      setSelectedRoom(null);
      setTappedPlacedRoom(null);
      setFeedback(null);
    }
  };

  const cellSize = Math.min(52, (window.innerWidth - 48) / GRID_SIZE);

  const previewRoom = selectedRoom
    ? getRoomDefinition(selectedRoom)
    : tappedPlacedRoom
      ? getRoomDefinition(tappedPlacedRoom)
      : null;

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
              const isTappedPlaced = roomId === tappedPlacedRoom;

              return (
                <div
                  key={`${row}-${col}`}
                  onClick={() => handleCellTap(row, col)}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    background: isTappedPlaced
                      ? 'var(--bg-card-hover)'
                      : roomDef
                        ? 'var(--bg-card)'
                        : isValid
                          ? 'rgba(139, 115, 64, 0.15)'
                          : 'var(--bg-surface)',
                    border: isTappedPlaced
                      ? '2px solid var(--text-accent)'
                      : roomDef
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
                    cursor: (isEmpty && selectedRoom) || roomDef ? 'pointer' : 'default',
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
          <span style={styles.synergyIcon}>&#x2726;</span> {synergyNotice}
        </div>
      )}

      {/* Room preview panel */}
      {previewRoom && (
        <div style={styles.previewPanel} className="slide-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <span style={{
                fontSize: 10,
                fontWeight: 600,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.1em',
                color: `var(--color-${previewRoom.rarity})`,
              }}>
                {previewRoom.rarity} · {previewRoom.category}
              </span>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 18, marginTop: 2 }}>
                {previewRoom.name}
              </h3>
            </div>
            <DoorIndicator doors={previewRoom.doors} />
          </div>
          <p style={styles.previewFlavour}>{previewRoom.flavour}</p>
          <div style={styles.previewMeta}>
            <span>{previewRoom.interactions.length} interaction{previewRoom.interactions.length !== 1 ? 's' : ''}</span>
            <span style={{ color: 'var(--text-muted)' }}>
              {previewRoom.interactions.filter(i => i.type === 'inspect').length > 0 && 'Free inspect'}
              {previewRoom.interactions.filter(i => i.type === 'search').length > 0 && ' + Searchable'}
            </span>
          </div>
        </div>
      )}

      {/* Feedback */}
      {feedback && !previewRoom && (
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
                  <DoorIndicator doors={def.doors} size={20} />
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
    conservatory: 'M3 4h10v8H3V4zM3 4l5-2 5 2M5 8v4M8 6v6M11 8v4',
    wine_cellar: 'M4 6a4 3 0 018 0v4a4 3 0 01-8 0V6zM6 10h4',
    music_room: 'M4 10c0-4 8-4 8 0v3H4v-3zM6 7V4M10 7V4',
    servants_quarters: 'M3 3h10v10H3V3zM3 8h10M8 3v10',
    ballroom: 'M2 12h12M4 12V6l4-3 4 3v6M7 12V9h2v3',
    observatory: 'M5 14V8l3-6 3 6v6M4 14h8M8 2v2',
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

function DoorIndicator({ doors, size = 24 }: { doors: { N: boolean; S: boolean; E: boolean; W: boolean }; size?: number }) {
  const s = size;
  const inner = s * 0.5;
  const offset = (s - inner) / 2;
  const mid = s / 2;
  const gap = inner * 0.33;
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ flexShrink: 0 }}>
      <rect x={offset} y={offset} width={inner} height={inner} fill="none" stroke="var(--border-subtle)" strokeWidth="1" rx="2" />
      {doors.N && <line x1={mid - gap} y1={offset} x2={mid + gap} y2={offset} stroke="var(--text-accent)" strokeWidth="2" />}
      {doors.S && <line x1={mid - gap} y1={offset + inner} x2={mid + gap} y2={offset + inner} stroke="var(--text-accent)" strokeWidth="2" />}
      {doors.W && <line x1={offset} y1={mid - gap} x2={offset} y2={mid + gap} stroke="var(--text-accent)" strokeWidth="2" />}
      {doors.E && <line x1={offset + inner} y1={mid - gap} x2={offset + inner} y2={mid + gap} stroke="var(--text-accent)" strokeWidth="2" />}
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
    fontWeight: 500,
    color: 'var(--color-success)',
    padding: '8px 16px',
    background: 'rgba(110, 168, 110, 0.1)',
    border: '1px solid rgba(110, 168, 110, 0.2)',
    borderRadius: 'var(--radius-sm)',
    margin: '0 16px',
    flexShrink: 0,
  },
  synergyIcon: {
    fontSize: 14,
  },
  previewPanel: {
    padding: '12px 16px',
    background: 'var(--bg-card)',
    borderTop: '1px solid var(--border-medium)',
    flexShrink: 0,
  },
  previewFlavour: {
    fontFamily: 'var(--font-serif)',
    fontSize: 13,
    fontStyle: 'italic',
    color: 'var(--text-secondary)',
    marginTop: 4,
    lineHeight: 1.5,
  },
  previewMeta: {
    display: 'flex',
    gap: 8,
    marginTop: 6,
    fontSize: 11,
    color: 'var(--text-accent)',
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
