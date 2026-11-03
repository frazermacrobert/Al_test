import { useState } from 'react';
import { useGameStore } from '../../engine/store';
import { ResourceBar } from '../components/ResourceBar';
import { getRoomDefinition } from '../../data/rooms';
import { GRID_SIZE } from '../../engine/types';

export function ExplorationScreen() {
  const grid = useGameStore(s => s.grid);
  const roomStates = useGameStore(s => s.roomStates);
  const enterRoom = useGameStore(s => s.enterRoom);
  const endNight = useGameStore(s => s.endNight);
  const actions = useGameStore(s => s.actions);
  const setPhase = useGameStore(s => s.setPhase);

  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);

  const selectedRoomId = selectedCell ? grid[selectedCell.row][selectedCell.col] : null;
  const selectedDef = selectedRoomId ? getRoomDefinition(selectedRoomId) : null;
  const selectedState = selectedRoomId ? roomStates[selectedRoomId] : null;

  const cellSize = Math.min(52, (window.innerWidth - 48) / GRID_SIZE);

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

      {/* Map grid */}
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
              const rs = roomId ? roomStates[roomId] : null;
              const isSelected = selectedCell?.row === row && selectedCell?.col === col;
              const hasUndiscovered = roomDef && roomId ? hasUndiscoveredContent(roomDef, rs) : false;

              if (!roomDef) {
                return (
                  <div
                    key={`${row}-${col}`}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      background: 'transparent',
                    }}
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
                    fontSize: Math.max(7, cellSize * 0.15),
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
                </div>
              );
            })
          )}
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
              {selectedDef.rarity} {selectedDef.category}
            </span>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 20 }}>{selectedDef.name}</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
              {selectedState?.visited ? selectedDef.description : selectedDef.flavour}
            </p>
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
          <button className="btn btn-ghost" onClick={() => setPhase('casebook')}>
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
  bottomActions: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 16px 24px',
    flexShrink: 0,
  },
};
