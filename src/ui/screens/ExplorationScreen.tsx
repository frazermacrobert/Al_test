import { useState } from 'react';
import { useGameStore } from '../../engine/store';
import { ResourceBar } from '../components/ResourceBar';
import { getRoomDefinition } from '../../data/rooms';
import { getSynergyDefinitions } from '../../data/synergies';
import { GRID_SIZE, Direction } from '../../engine/types';
import { getNeighbour, isInBounds } from '../../engine/grid';

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
                stroke="var(--border-accent)"
                strokeWidth="2"
                strokeOpacity="0.5"
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
                      padding: 2,
                    }}
                  >
                    <span style={{
                      fontSize: Math.max(7, cellSize * 0.16),
                      color: rs?.visited ? 'var(--text-secondary)' : 'var(--text-primary)',
                      textAlign: 'center',
                      lineHeight: 1.1,
                      fontWeight: rs?.visited ? 400 : 500,
                    }}>
                      {roomDef.name.split(' ').map(w => w[0]).join('')}
                    </span>
                    {hasUndiscovered && (
                      <div style={{
                        position: 'absolute',
                        top: 3,
                        right: 3,
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: 'var(--text-accent)',
                      }} />
                    )}
                    {rs?.visited && !hasUndiscovered && (
                      <div style={{
                        position: 'absolute',
                        top: 3,
                        right: 3,
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: 'var(--color-success)',
                        opacity: 0.6,
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
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
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
