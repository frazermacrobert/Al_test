import { useState } from 'react';
import { useGameStore } from '../../engine/store';
import { ResourceBar } from '../components/ResourceBar';
import { getRoomDefinition } from '../../data/rooms';
import { getSynergyDefinitions } from '../../data/synergies';
import { GRID_SIZE, Direction } from '../../engine/types';
import { getNeighbour, isInBounds } from '../../engine/grid';

const OPPOSITE: Record<Direction, Direction> = { N: 'S', S: 'N', E: 'W', W: 'E' };

const ROOM_ICONS: Record<string, string> = {
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

export function ExplorationScreen() {
  const grid = useGameStore(s => s.grid);
  const placedRooms = useGameStore(s => s.placedRooms);
  const roomStates = useGameStore(s => s.roomStates);
  const enterRoom = useGameStore(s => s.enterRoom);
  const endNight = useGameStore(s => s.endNight);
  const actions = useGameStore(s => s.actions);
  const openCasebook = useGameStore(s => s.openCasebook);
  const activeSynergies = useGameStore(s => s.activeSynergies);

  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [showSynergies, setShowSynergies] = useState(false);

  const selectedRoomId = selectedCell ? grid[selectedCell.row][selectedCell.col] : null;
  const selectedDef = selectedRoomId ? getRoomDefinition(selectedRoomId) : null;
  const selectedState = selectedRoomId ? roomStates[selectedRoomId] : null;

  const cellSize = Math.min(52, (window.innerWidth - 48) / GRID_SIZE);
  const gap = 2;
  const gridPx = GRID_SIZE * cellSize + (GRID_SIZE - 1) * gap;

  // Door connections for SVG overlay
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

  return (
    <div className="screen">
      <ResourceBar />

      <div style={styles.header}>
        <h2 style={styles.title}>Ashcombe House</h2>
        <p style={styles.subtitle}>
          {actions > 0
            ? `${actions} action${actions !== 1 ? 's' : ''} remaining`
            : 'No actions left — the dawn approaches'}
        </p>
      </div>

      {/* Active synergies toggle */}
      {synergyDefs.length > 0 && (
        <div style={styles.synergyBar}>
          <button
            style={styles.synergyToggle}
            onClick={() => setShowSynergies(!showSynergies)}
          >
            <span style={{ color: 'var(--color-success)' }}>&#x2726;</span>
            {' '}{synergyDefs.length} synerg{synergyDefs.length !== 1 ? 'ies' : 'y'} active
            <span style={{ fontSize: 10, marginLeft: 4 }}>{showSynergies ? '▲' : '▼'}</span>
          </button>
          {showSynergies && (
            <div style={styles.synergyList} className="fade-in">
              {synergyDefs.map(syn => syn && (
                <div key={syn.id} style={styles.synergyItem}>
                  <span style={styles.synergyName}>{syn.name}</span>
                  <span style={styles.synergyDesc}>{syn.effect.description}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Map grid */}
      <div style={styles.gridContainer}>
        <div style={{ position: 'relative', width: gridPx, height: gridPx }}>
          {/* Door connection lines */}
          <svg
            width={gridPx}
            height={gridPx}
            style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 0 }}
          >
            {connections.map((c, i) => (
              <line
                key={i}
                x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2}
                stroke="var(--text-accent)"
                strokeWidth="2"
                strokeOpacity="0.4"
                strokeDasharray="4 2"
              />
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
                const hasUndiscovered = roomDef ? hasUndiscoveredContent(roomDef, rs) : false;

                if (!roomDef) {
                  return (
                    <div
                      key={`${row}-${col}`}
                      style={{ width: cellSize, height: cellSize, background: 'transparent' }}
                      onClick={() => setSelectedCell(null)}
                    />
                  );
                }

                const iconPath = ROOM_ICONS[roomId!] ?? 'M4 4h8v8H4z';
                const iconSize = Math.max(14, cellSize * 0.5);

                return (
                  <div
                    key={`${row}-${col}`}
                    onClick={() => {
                      if (isSelected && roomId) {
                        enterRoom(roomId);
                      } else {
                        setSelectedCell({ row, col });
                      }
                    }}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      background: isSelected
                        ? 'var(--bg-card-hover)'
                        : rs?.visited
                          ? 'var(--bg-card)'
                          : 'var(--bg-surface)',
                      border: isSelected
                        ? '2px solid var(--text-accent)'
                        : '1px solid var(--border-medium)',
                      borderRadius: 4,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 1px 3px rgba(0,0,0,0.3)',
                    }}
                  >
                    {/* Room icon */}
                    <svg width={iconSize} height={iconSize} viewBox="0 0 16 16" fill="none" style={{ zIndex: 1 }}>
                      <path
                        d={iconPath}
                        stroke={rs?.visited ? 'var(--text-secondary)' : 'var(--text-primary)'}
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span style={{
                      fontSize: Math.max(7, cellSize * 0.14),
                      color: rs?.visited ? 'var(--text-muted)' : 'var(--text-secondary)',
                      lineHeight: 1,
                      zIndex: 1,
                      maxWidth: cellSize - 6,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {roomDef.name.split(' ')[0]}
                    </span>

                    {/* Door edge marks */}
                    <DoorEdges doors={roomDef.doors} size={cellSize} />

                    {/* Status indicator */}
                    {hasUndiscovered && (
                      <div className="glow-dot" style={{
                        position: 'absolute', top: 3, right: 3,
                        width: 6, height: 6, borderRadius: '50%',
                        background: 'var(--text-accent)',
                        zIndex: 2,
                      }} />
                    )}
                    {rs?.visited && !hasUndiscovered && (
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
        <div style={styles.infoPanel} className="slide-up">
          <div style={styles.infoPanelHeader}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <span style={{
                  fontSize: 10,
                  fontWeight: 600,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.1em',
                  color: `var(--color-${selectedDef.rarity})`,
                }}>
                  {selectedDef.rarity} · {selectedDef.category}
                </span>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 20 }}>{selectedDef.name}</h3>
              </div>
              <DoorIndicator doors={selectedDef.doors} />
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
              {selectedState?.visited ? selectedDef.description : selectedDef.flavour}
            </p>
            {selectedState?.visited && (
              <div style={styles.roomProgress}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {selectedState.completedInteractions.length}/{selectedDef.interactions.length} interactions
                </span>
                {selectedState.discoveredClues.length > 0 && (
                  <span style={{ fontSize: 11, color: 'var(--text-accent)' }}>
                    {selectedState.discoveredClues.length} clue{selectedState.discoveredClues.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            )}
          </div>
          <button
            className="btn btn-primary"
            style={{ width: '100%' }}
            onClick={() => enterRoom(selectedRoomId!)}
          >
            {selectedState?.visited ? 'Return to Room' : 'Enter Room'}
          </button>
        </div>
      )}

      {/* Bottom actions */}
      {!selectedDef && (
        <div style={styles.bottomActions}>
          <button className="btn btn-ghost" onClick={openCasebook}>
            Casebook
          </button>
          <button className="btn btn-secondary" onClick={endNight}>
            End the Night
          </button>
        </div>
      )}
    </div>
  );
}

/** Door marks on cell edges matching connected doorways */
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
  synergyBar: {
    padding: '0 16px',
    flexShrink: 0,
  },
  synergyToggle: {
    width: '100%',
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    fontSize: 12,
    fontWeight: 500,
    padding: '6px 0',
    textAlign: 'center',
    fontFamily: 'var(--font-sans)',
  },
  synergyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    paddingBottom: 8,
  },
  synergyItem: {
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius-sm)',
    padding: '6px 10px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  synergyName: {
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--color-success)',
  },
  synergyDesc: {
    fontSize: 11,
    color: 'var(--text-secondary)',
  },
  gridContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 16px',
    minHeight: 0,
  },
  infoPanel: {
    padding: '16px',
    background: 'var(--bg-card)',
    borderTop: '1px solid var(--border-medium)',
    flexShrink: 0,
  },
  infoPanelHeader: {
    marginBottom: 12,
  },
  roomProgress: {
    display: 'flex',
    gap: 12,
    marginTop: 6,
  },
  bottomActions: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 16px 24px',
    flexShrink: 0,
  },
};
