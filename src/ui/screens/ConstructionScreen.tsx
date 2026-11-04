import { useState, useEffect, useMemo } from 'react';
import { useGameStore } from '../../engine/store';
import { ResourceBar } from '../components/ResourceBar';
import { getRoomDefinition } from '../../data/rooms';
import { getSynergyDefinitions } from '../../data/synergies';
import { getRoomIcon } from '../roomIcons';
import { GRID_SIZE, Direction } from '../../engine/types';
import { validatePlacement, getNeighbour, isInBounds, getAdjacentPlacedRooms } from '../../engine/grid';
import { hasAnyValidPlacement } from '../../engine/grid';

const OPPOSITE: Record<Direction, Direction> = { N: 'S', S: 'N', E: 'W', W: 'E' };

export function ConstructionScreen() {
  const grid = useGameStore(s => s.grid);
  const placedRooms = useGameStore(s => s.placedRooms);
  const currentHand = useGameStore(s => s.currentHand);
  const draftsRemaining = useGameStore(s => s.draftsRemaining);
  const placeRoom = useGameStore(s => s.placeRoom);
  const skipRoom = useGameStore(s => s.skipRoom);
  const finishConstruction = useGameStore(s => s.finishConstruction);
  const activeSynergies = useGameStore(s => s.activeSynergies);

  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [synergyNotice, setSynergyNotice] = useState<string | null>(null);
  const [tappedPlacedRoom, setTappedPlacedRoom] = useState<string | null>(null);
  const [skipConfirm, setSkipConfirm] = useState(false);

  const canPlaceAny = useMemo(
    () => hasAnyValidPlacement(currentHand, grid, placedRooms),
    [currentHand, grid, placedRooms]
  );

  useEffect(() => {
    if (draftsRemaining > 0 && currentHand.length > 0 && !canPlaceAny) {
      setFeedback('No valid placements — skip to draw a new hand.');
    }
  }, [canPlaceAny, draftsRemaining, currentHand]);

  const handleSelectCard = (roomId: string) => {
    setSelectedRoom(roomId);
    setTappedPlacedRoom(null);
    setFeedback(null);
    setSkipConfirm(false);
  };

  const handleSkip = () => {
    if (!skipConfirm && canPlaceAny) {
      setSkipConfirm(true);
      setFeedback('Tap again to skip and draw new rooms.');
      return;
    }
    skipRoom();
    setSelectedRoom(null);
    setFeedback(null);
    setSkipConfirm(false);
  };

  const handleCellTap = (row: number, col: number) => {
    const existingRoom = grid[row][col];
    if (existingRoom) {
      setTappedPlacedRoom(existingRoom === tappedPlacedRoom ? null : existingRoom);
      setSkipConfirm(false);
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
      setSkipConfirm(false);
    }
  };

  const cellSize = Math.min(52, (window.innerWidth - 48) / GRID_SIZE);
  const gap = 2;
  const gridPx = GRID_SIZE * cellSize + (GRID_SIZE - 1) * gap;

  const previewRoom = selectedRoom
    ? getRoomDefinition(selectedRoom)
    : tappedPlacedRoom
      ? getRoomDefinition(tappedPlacedRoom)
      : null;

  const connections: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (const pr of placedRooms) {
    const def = getRoomDefinition(pr.roomId);
    if (!def) continue;
    for (const dir of ['E', 'S'] as Direction[]) {
      if (!def.doors[dir]) continue;
      const np = getNeighbour(pr.position, dir);
      if (!isInBounds(np)) continue;
      const neighborId = grid[np.row][np.col];
      if (!neighborId) continue;
      const neighborDef = getRoomDefinition(neighborId);
      if (!neighborDef || !neighborDef.doors[OPPOSITE[dir]]) continue;

      const x1 = pr.position.col * (cellSize + gap) + cellSize / 2;
      const y1 = pr.position.row * (cellSize + gap) + cellSize / 2;
      const x2 = np.col * (cellSize + gap) + cellSize / 2;
      const y2 = np.row * (cellSize + gap) + cellSize / 2;
      connections.push({ x1, y1, x2, y2 });
    }
  }

  return (
    <div className="screen bg-atmospheric">
      <ResourceBar />

      <div className="screen-header">
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 600 }}>
          Build the Mansion
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
          {draftsRemaining > 0
            ? `${draftsRemaining} room${draftsRemaining !== 1 ? 's' : ''} to place`
            : 'Construction complete'}
        </p>
      </div>

      {/* Grid */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px 12px',
        minHeight: 0,
      }}>
        <div className="grid-board" style={{ position: 'relative' }}>
          <svg
            width={gridPx}
            height={gridPx}
            style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 0 }}
          >
            {connections.map((c, i) => (
              <g key={i}>
                <line
                  x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2}
                  stroke="var(--text-accent)"
                  strokeWidth="6"
                  strokeOpacity="0.08"
                  strokeLinecap="round"
                />
                <line
                  x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2}
                  stroke="var(--text-accent)"
                  strokeWidth="2.5"
                  strokeOpacity="0.5"
                  strokeLinecap="round"
                />
              </g>
            ))}
          </svg>

          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID_SIZE}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, ${cellSize}px)`,
            gap,
            position: 'relative',
            zIndex: 1,
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

                const rarityClass = roomDef?.rarity ? `grid-cell-${roomDef.rarity}` : '';
                const cellClasses = [
                  'grid-cell',
                  isTappedPlaced ? 'grid-cell-selected' : rarityClass,
                  isValid && !roomDef ? 'grid-cell-valid' : '',
                ].filter(Boolean).join(' ');

                return (
                  <div
                    key={`${row}-${col}`}
                    className={roomDef || isValid ? cellClasses : 'grid-cell-empty'}
                    onClick={() => handleCellTap(row, col)}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      ...(!roomDef && !isValid ? {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      } : {}),
                      cursor: (isEmpty && selectedRoom) || roomDef ? 'pointer' : 'default',
                    }}
                  >
                    {roomDef ? (
                      <>
                        <RoomCellIcon roomId={roomId!} size={cellSize} rarity={roomDef.rarity} />
                        <DoorEdges doors={roomDef.doors} size={cellSize} />
                      </>
                    ) : isValid ? (
                      <span style={{ fontSize: 18, color: 'var(--text-accent)', fontWeight: 300 }}>+</span>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Synergy notice */}
      {synergyNotice && (
        <div className="game-card fade-in" style={{
          textAlign: 'center',
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--color-success)',
          padding: '10px 16px',
          margin: '0 16px',
          flexShrink: 0,
          borderColor: 'rgba(92, 184, 92, 0.25)',
        }}>
          <span style={{ fontSize: 14 }}>&#x2726;</span> {synergyNotice}
        </div>
      )}

      {/* Room preview panel */}
      {previewRoom && (
        <div className="info-panel slide-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <span className="badge badge-accent" style={{ color: `var(--color-${previewRoom.rarity})` }}>
                {previewRoom.rarity} · {previewRoom.category}
              </span>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 18, marginTop: 4 }}>
                {previewRoom.name}
              </h3>
            </div>
            <DoorIndicator doors={previewRoom.doors} />
          </div>
          <p style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 13,
            fontStyle: 'italic',
            color: 'var(--text-secondary)',
            marginTop: 6,
            lineHeight: 1.5,
          }}>
            {previewRoom.flavour}
          </p>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <span className="badge badge-accent">
              {previewRoom.interactions.length} interaction{previewRoom.interactions.length !== 1 ? 's' : ''}
            </span>
            {previewRoom.interactions.filter(i => i.type === 'inspect').length > 0 && (
              <span className="badge badge-success">Free inspect</span>
            )}
          </div>
        </div>
      )}

      {/* Feedback */}
      {feedback && !previewRoom && (
        <div style={{
          textAlign: 'center',
          fontSize: 13,
          fontWeight: 500,
          color: !canPlaceAny && draftsRemaining > 0
            ? 'var(--color-danger)'
            : 'var(--color-warning)',
          padding: '6px 16px',
          flexShrink: 0,
        }}>{feedback}</div>
      )}

      {/* Draft hand */}
      {draftsRemaining > 0 && currentHand.length > 0 ? (
        <div style={{
          padding: '10px 16px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
          flexShrink: 0,
        }}>
          <div style={{
            display: 'flex',
            gap: 8,
            justifyContent: 'center',
            width: '100%',
            maxWidth: 400,
          }}>
            {currentHand.map(roomId => {
              const def = getRoomDefinition(roomId);
              if (!def) return null;
              const isSelected = selectedRoom === roomId;
              const cardIconPath = getRoomIcon(roomId);
              const rarityColor = `var(--color-${def.rarity})`;
              return (
                <button
                  key={roomId}
                  className={`draft-card${isSelected ? ' draft-card-selected' : ''}`}
                  onClick={() => handleSelectCard(roomId)}
                  style={{
                    flex: '1 1 0', maxWidth: 120,
                    borderTopColor: isSelected ? rarityColor : undefined,
                  }}
                >
                  <span className="badge" style={{
                    color: rarityColor,
                    background: 'transparent',
                    padding: 0,
                    fontSize: 9,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                  }}>
                    {def.rarity}
                  </span>
                  <svg width={28} height={28} viewBox="0 0 16 16">
                    <path d={cardIconPath} fill={rarityColor} fillOpacity="0.2" stroke={rarityColor} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    textAlign: 'center',
                    lineHeight: 1.2,
                  }}>
                    {def.name}
                  </span>
                  <span style={{
                    fontSize: 9,
                    color: 'var(--text-muted)',
                    textTransform: 'capitalize',
                  }}>
                    {def.category}
                  </span>
                  <DoorIndicator doors={def.doors} size={20} />
                </button>
              );
            })}
          </div>

          <button
            onClick={handleSkip}
            className={`btn ${!canPlaceAny ? 'btn-secondary' : 'btn-ghost'}`}
            style={{
              fontSize: 12,
              padding: '8px 20px',
              minHeight: 36,
              ...((!canPlaceAny) ? {
                borderColor: 'var(--color-danger)',
                color: 'var(--color-danger)',
                animation: 'subtlePulse 2s ease-in-out infinite',
              } : {}),
            }}
          >
            {!canPlaceAny ? 'No valid spots — Skip hand' : skipConfirm ? 'Tap to confirm skip' : 'Skip hand'}
          </button>
        </div>
      ) : (
        <div style={{
          padding: '10px 16px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          flexShrink: 0,
        }}>
          <button className="btn btn-primary" style={{ width: '100%', maxWidth: 300 }} onClick={finishConstruction}>
            Explore the Mansion
          </button>
        </div>
      )}
    </div>
  );
}

function DoorEdges({ doors, size }: { doors: { N: boolean; S: boolean; E: boolean; W: boolean }; size: number }) {
  const markLen = Math.max(6, size * 0.22);
  const markThick = 3;
  const accent = 'var(--text-accent)';

  return (
    <>
      {doors.N && (
        <div style={{
          position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)',
          width: markLen, height: markThick, background: accent, borderRadius: '0 0 2px 2px',
        }} />
      )}
      {doors.S && (
        <div style={{
          position: 'absolute', bottom: -1, left: '50%', transform: 'translateX(-50%)',
          width: markLen, height: markThick, background: accent, borderRadius: '2px 2px 0 0',
        }} />
      )}
      {doors.W && (
        <div style={{
          position: 'absolute', left: -1, top: '50%', transform: 'translateY(-50%)',
          width: markThick, height: markLen, background: accent, borderRadius: '0 2px 2px 0',
        }} />
      )}
      {doors.E && (
        <div style={{
          position: 'absolute', right: -1, top: '50%', transform: 'translateY(-50%)',
          width: markThick, height: markLen, background: accent, borderRadius: '2px 0 0 2px',
        }} />
      )}
    </>
  );
}

function RoomCellIcon({ roomId, size, rarity }: { roomId: string; size: number; rarity?: string }) {
  const def = getRoomDefinition(roomId);
  if (!def) return null;
  const iconSize = Math.max(16, size * 0.55);
  const path = getRoomIcon(roomId);
  const iconColor = rarity ? `var(--color-${rarity})` : 'var(--text-secondary)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, zIndex: 1 }}>
      <svg width={iconSize} height={iconSize} viewBox="0 0 16 16">
        <path d={path} fill={iconColor} fillOpacity="0.2" stroke={iconColor} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span style={{
        fontSize: Math.max(7, size * 0.15),
        color: 'var(--text-secondary)',
        fontWeight: 500,
        lineHeight: 1,
        maxWidth: size - 6,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
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
  const g = inner * 0.33;
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ flexShrink: 0 }}>
      <rect x={offset} y={offset} width={inner} height={inner} fill="none" stroke="var(--border-subtle)" strokeWidth="1" rx="2" />
      {doors.N && <line x1={mid - g} y1={offset} x2={mid + g} y2={offset} stroke="var(--text-accent)" strokeWidth="2" />}
      {doors.S && <line x1={mid - g} y1={offset + inner} x2={mid + g} y2={offset + inner} stroke="var(--text-accent)" strokeWidth="2" />}
      {doors.W && <line x1={offset} y1={mid - g} x2={offset} y2={mid + g} stroke="var(--text-accent)" strokeWidth="2" />}
      {doors.E && <line x1={offset + inner} y1={mid - g} x2={offset + inner} y2={mid + g} stroke="var(--text-accent)" strokeWidth="2" />}
    </svg>
  );
}
