import { useState, useMemo } from 'react';
import { useGameStore } from '../../engine/store';
import { ResourceBar } from '../components/ResourceBar';
import { getRoomDefinition } from '../../data/rooms';
import { getSynergyDefinitions } from '../../data/synergies';
import { getItemDefinition } from '../../data/items';
import { GRID_SIZE, Direction, MAX_INVENTORY } from '../../engine/types';
import { getNeighbour, isInBounds, getReachabilityMap } from '../../engine/grid';
import { getRoomIcon } from '../roomIcons';

const OPPOSITE: Record<Direction, Direction> = { N: 'S', S: 'N', E: 'W', W: 'E' };

export function ExplorationScreen() {
  const grid = useGameStore(s => s.grid);
  const placedRooms = useGameStore(s => s.placedRooms);
  const roomStates = useGameStore(s => s.roomStates);
  const enterRoom = useGameStore(s => s.enterRoom);
  const endNight = useGameStore(s => s.endNight);
  const actions = useGameStore(s => s.actions);
  const openCasebook = useGameStore(s => s.openCasebook);
  const activeSynergies = useGameStore(s => s.activeSynergies);
  const currentRoom = useGameStore(s => s.currentRoom);
  const inventory = useGameStore(s => s.inventory);

  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [showSynergies, setShowSynergies] = useState(false);

  const reachability = useMemo(() => {
    if (!currentRoom) return new Map<string, number>();
    return getReachabilityMap(currentRoom, grid, placedRooms);
  }, [currentRoom, grid, placedRooms]);

  const selectedRoomId = selectedCell ? grid[selectedCell.row][selectedCell.col] : null;
  const selectedDef = selectedRoomId ? getRoomDefinition(selectedRoomId) : null;
  const selectedState = selectedRoomId ? roomStates[selectedRoomId] : null;

  const cellSize = Math.min(52, (window.innerWidth - 48) / GRID_SIZE);
  const gap = 2;
  const gridPx = GRID_SIZE * cellSize + (GRID_SIZE - 1) * gap;

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

  const synergyDefs = activeSynergies
    .map(id => getSynergyDefinitions().find(s => s.id === id))
    .filter(Boolean);

  const handleCellTap = (row: number, col: number) => {
    const roomId = grid[row][col];
    if (!roomId) {
      setSelectedCell(null);
      return;
    }
    const alreadySelected = selectedCell?.row === row && selectedCell?.col === col;
    if (alreadySelected && roomId) {
      if (roomId === currentRoom) {
        enterRoom(roomId);
      } else {
        const cost = reachability.get(roomId);
        if (cost !== undefined && cost <= actions) {
          enterRoom(roomId);
        }
      }
    } else {
      setSelectedCell({ row, col });
    }
  };

  let selectedMoveCost: number | null = null;
  let selectedMoveStatus: 'current' | 'reachable' | 'tooExpensive' | 'unreachable' = 'unreachable';
  if (selectedRoomId) {
    if (selectedRoomId === currentRoom) {
      selectedMoveStatus = 'current';
      selectedMoveCost = 0;
    } else {
      const cost = reachability.get(selectedRoomId);
      if (cost !== undefined) {
        selectedMoveCost = cost;
        selectedMoveStatus = cost <= actions ? 'reachable' : 'tooExpensive';
      }
    }
  }

  return (
    <div className="screen bg-atmospheric">
      <ResourceBar />

      <div className="screen-header">
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 600 }}>
          Ashcombe House
        </h2>
        <p style={{ fontSize: 13, color: actions > 0 ? 'var(--text-secondary)' : 'var(--color-warning)', marginTop: 4 }}>
          {actions > 0
            ? `${actions} action${actions !== 1 ? 's' : ''} remaining`
            : 'No actions left — the dawn approaches'}
        </p>
      </div>

      {/* Active synergies toggle */}
      {synergyDefs.length > 0 && (
        <div style={{ padding: '0 16px', flexShrink: 0 }}>
          <button
            onClick={() => setShowSynergies(!showSynergies)}
            style={{
              width: '100%',
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: 12,
              fontWeight: 500,
              padding: '6px 0',
              textAlign: 'center',
              fontFamily: 'var(--font-sans)',
              cursor: 'pointer',
            }}
          >
            <span style={{ color: 'var(--color-success)' }}>&#x2726;</span>
            {' '}{synergyDefs.length} synerg{synergyDefs.length !== 1 ? 'ies' : 'y'} active
            <span style={{ fontSize: 10, marginLeft: 4 }}>{showSynergies ? '▲' : '▼'}</span>
          </button>
          {showSynergies && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingBottom: 8 }} className="fade-in">
              {synergyDefs.map(syn => syn && (
                <div key={syn.id} className="game-card" style={{ padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-success)' }}>{syn.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{syn.effect.description}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Map grid */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px 12px',
        minHeight: 0,
      }}>
        <div className="grid-board" style={{ position: 'relative' }}>
          {/* Door connection lines */}
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

          {/* Grid cells */}
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
                const rs = roomId ? roomStates[roomId] : null;
                const isSelected = selectedCell?.row === row && selectedCell?.col === col;
                const isCurrent = roomId === currentRoom;
                const hasUndiscovered = roomDef ? hasUndiscoveredContent(roomDef, rs) : false;

                const moveCost = roomId ? reachability.get(roomId) : undefined;
                const isReachable = moveCost !== undefined;
                const canAffordMove = isReachable && moveCost <= actions;
                const dimmed = roomDef && !isCurrent && !canAffordMove;

                if (!roomDef) {
                  return (
                    <div
                      key={`${row}-${col}`}
                      className="grid-cell-empty"
                      style={{ width: cellSize, height: cellSize }}
                      onClick={() => setSelectedCell(null)}
                    />
                  );
                }

                const iconPath = getRoomIcon(roomId!);
                const iconSize = Math.max(16, cellSize * 0.55);

                const rarityClass = roomDef.rarity ? `grid-cell-${roomDef.rarity}` : '';
                const cellClasses = [
                  'grid-cell',
                  isCurrent ? 'grid-cell-current' : rarityClass,
                  isSelected && !isCurrent ? 'grid-cell-selected' : '',
                  dimmed ? 'grid-cell-dimmed' : '',
                ].filter(Boolean).join(' ');

                const iconColor = isCurrent
                  ? 'var(--text-accent)'
                  : `var(--color-${roomDef.rarity})`;

                return (
                  <div
                    key={`${row}-${col}`}
                    className={cellClasses}
                    onClick={() => handleCellTap(row, col)}
                    style={{
                      width: cellSize,
                      height: cellSize,
                    }}
                  >
                    <svg width={iconSize} height={iconSize} viewBox="0 0 16 16" style={{ zIndex: 1 }}>
                      <path
                        d={iconPath}
                        fill={iconColor}
                        fillOpacity="0.2"
                        stroke={iconColor}
                        strokeWidth="1.3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span style={{
                      fontSize: Math.max(7, cellSize * 0.14),
                      color: isCurrent ? 'var(--text-accent)' : rs?.visited ? 'var(--text-muted)' : 'var(--text-secondary)',
                      lineHeight: 1,
                      zIndex: 1,
                      maxWidth: cellSize - 6,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {roomDef.name.split(' ')[0]}
                    </span>

                    <DoorEdges doors={roomDef.doors} size={cellSize} />

                    {/* Move cost badge */}
                    {!isCurrent && isReachable && moveCost > 0 && (
                      <div style={{
                        position: 'absolute', bottom: 2, right: 2,
                        background: canAffordMove ? 'var(--color-action)' : 'var(--color-danger)',
                        color: '#12110c',
                        fontSize: 8,
                        fontWeight: 700,
                        borderRadius: 3,
                        padding: '0 3px',
                        lineHeight: '13px',
                        zIndex: 2,
                      }}>
                        {moveCost}
                      </div>
                    )}

                    {/* Current room marker */}
                    {isCurrent && (
                      <div style={{
                        position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)',
                        width: 5, height: 5, borderRadius: '50%',
                        background: 'var(--text-accent)',
                        boxShadow: '0 0 6px var(--text-accent)',
                        zIndex: 2,
                      }} />
                    )}

                    {/* Undiscovered indicator */}
                    {!isCurrent && hasUndiscovered && (
                      <div className="glow-dot" style={{
                        position: 'absolute', top: 3, right: 3,
                        width: 6, height: 6, borderRadius: '50%',
                        background: 'var(--text-accent)',
                        zIndex: 2,
                      }} />
                    )}
                    {/* Fully explored indicator */}
                    {!isCurrent && rs?.visited && !hasUndiscovered && (
                      <div style={{
                        position: 'absolute', top: 3, right: 3,
                        width: 6, height: 6, borderRadius: '50%',
                        background: 'var(--color-success)', opacity: 0.6,
                        zIndex: 2,
                      }} />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Room info panel */}
      {selectedDef && (
        <div className="info-panel slide-up">
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <span className="badge badge-accent" style={{ color: `var(--color-${selectedDef.rarity})` }}>
                  {selectedDef.rarity} · {selectedDef.category}
                </span>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, marginTop: 4 }}>{selectedDef.name}</h3>
              </div>
              <DoorIndicator doors={selectedDef.doors} />
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6, fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
              {selectedState?.visited ? selectedDef.description : selectedDef.flavour}
            </p>
            {selectedState?.visited && (
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <span className="badge badge-accent">
                  {selectedState.completedInteractions.length}/{selectedDef.interactions.length} interactions
                </span>
                {selectedState.discoveredClues.length > 0 && (
                  <span className="badge badge-success">
                    {selectedState.discoveredClues.length} clue{selectedState.discoveredClues.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            )}
            {selectedMoveCost !== null && selectedMoveStatus !== 'current' && (
              <p style={{
                marginTop: 8,
                fontSize: 12,
                fontWeight: 600,
                color: selectedMoveStatus === 'reachable'
                  ? 'var(--color-action)'
                  : selectedMoveStatus === 'tooExpensive'
                    ? 'var(--color-danger)'
                    : 'var(--text-muted)',
              }}>
                {selectedMoveStatus === 'reachable' && `${selectedMoveCost} action${selectedMoveCost !== 1 ? 's' : ''} to move`}
                {selectedMoveStatus === 'tooExpensive' && `Need ${selectedMoveCost} actions (have ${actions})`}
                {selectedMoveStatus === 'unreachable' && 'No path to this room'}
              </p>
            )}
          </div>
          <button
            className={`btn ${selectedMoveStatus === 'current' || selectedMoveStatus === 'reachable' ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              width: '100%',
              opacity: selectedMoveStatus === 'tooExpensive' || selectedMoveStatus === 'unreachable' ? 0.5 : 1,
            }}
            disabled={selectedMoveStatus === 'tooExpensive' || selectedMoveStatus === 'unreachable'}
            onClick={() => {
              if (selectedRoomId && (selectedMoveStatus === 'current' || selectedMoveStatus === 'reachable')) {
                enterRoom(selectedRoomId);
              }
            }}
          >
            {selectedMoveStatus === 'current'
              ? 'Enter Room'
              : selectedMoveStatus === 'reachable'
                ? `Move Here (${selectedMoveCost} action${selectedMoveCost !== 1 ? 's' : ''})`
                : selectedMoveStatus === 'tooExpensive'
                  ? 'Not Enough Actions'
                  : 'Unreachable'}
          </button>
        </div>
      )}

      {/* Inventory + bottom actions */}
      {!selectedDef && (
        <div style={{ flexShrink: 0, borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 10,
            padding: '10px 16px 4px',
          }}>
            {Array.from({ length: MAX_INVENTORY }, (_, i) => {
              const itemId = inventory[i];
              const itemDef = itemId ? getItemDefinition(itemId) : null;

              return (
                <div
                  key={i}
                  style={{
                    width: 64,
                    height: 48,
                    borderRadius: 'var(--radius-sm)',
                    border: itemDef ? '1px solid var(--border-accent)' : '1px dashed var(--border-subtle)',
                    background: itemDef
                      ? 'linear-gradient(180deg, var(--bg-card) 0%, var(--bg-surface) 100%)'
                      : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: itemDef ? 'var(--shadow-card)' : 'none',
                  }}
                  title={itemDef?.name}
                >
                  {itemDef ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <svg width={20} height={20} viewBox="0 0 16 16">
                        <path
                          d={itemDef.icon}
                          fill="var(--text-accent)"
                          fillOpacity="0.15"
                          stroke="var(--text-accent)"
                          strokeWidth="1.3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span style={{
                        fontSize: 8,
                        color: 'var(--text-secondary)',
                        fontWeight: 600,
                        lineHeight: 1,
                        maxWidth: 56,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        textAlign: 'center',
                      }}>
                        {itemDef.name.split(' ')[0]}
                      </span>
                    </div>
                  ) : (
                    <svg width={16} height={16} viewBox="0 0 16 16" style={{ opacity: 0.2 }}>
                      <rect x="3" y="3" width="10" height="10" rx="2" stroke="var(--text-muted)" strokeWidth="1" strokeDasharray="2 2" fill="none" />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '8px 16px 24px',
          }}>
            <button className="btn btn-ghost" onClick={openCasebook} style={{ gap: 6 }}>
              <svg width={16} height={16} viewBox="0 0 16 16">
                <path d="M3 2h10v12H3V2zM5 4h6M5 6h6M5 8h4" fill="var(--text-accent)" fillOpacity="0.1" stroke="var(--text-accent)" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              Casebook
            </button>
            <button className="btn btn-secondary" onClick={endNight} style={{ gap: 6 }}>
              <svg width={16} height={16} viewBox="0 0 16 16">
                <path d="M8 2a6 6 0 016 6 6 6 0 01-6 6 6 6 0 01-6-6 6 6 0 016-6zM8 5v3l2 2" fill="none" stroke="var(--text-secondary)" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              End Night
            </button>
          </div>
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

function hasUndiscoveredContent(
  roomDef: ReturnType<typeof getRoomDefinition>,
  state: { completedInteractions: string[] } | null | undefined
): boolean {
  if (!roomDef) return false;
  const completed = state?.completedInteractions ?? [];
  return roomDef.interactions.some(i => !completed.includes(i.id));
}
