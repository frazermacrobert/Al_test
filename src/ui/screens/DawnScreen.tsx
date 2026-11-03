import { useGameStore } from '../../engine/store';
import { getClue } from '../../data/mysteries';

export function DawnScreen() {
  const nightNumber = useGameStore(s => s.nightNumber);
  const casebook = useGameStore(s => s.casebook);
  const roomStates = useGameStore(s => s.roomStates);
  const activeSynergies = useGameStore(s => s.activeSynergies);
  const startNight = useGameStore(s => s.startNight);
  const setPhase = useGameStore(s => s.setPhase);

  const visitedCount = Object.values(roomStates).filter(r => r.visited).length;
  const cluesFound = casebook.evidence.length;
  const newClues = Object.values(roomStates).flatMap(r => r.discoveredClues);

  return (
    <div className="screen" style={styles.container}>
      <div style={styles.content} className="fade-in">
        <p style={styles.nightLabel}>Dawn</p>
        <h1 style={styles.title}>Night {nightNumber} Ends</h1>
        <p style={styles.flavour}>
          The house sighs. Walls shift. Rooms dissolve and reform.
          But what you've learned remains.
        </p>

        <div style={styles.summary}>
          <SummaryRow label="Rooms explored" value={`${visitedCount}`} />
          <SummaryRow label="Evidence collected" value={`${cluesFound} total`} />
          {newClues.length > 0 && (
            <div style={styles.newClues}>
              <p style={styles.newCluesLabel}>New discoveries:</p>
              {newClues.map(clueId => {
                const clue = getClue(clueId);
                return clue ? (
                  <p key={clueId} style={styles.clueItem}>
                    {clue.title}
                  </p>
                ) : null;
              })}
            </div>
          )}
          {activeSynergies.length > 0 && (
            <SummaryRow label="Active synergies" value={`${activeSynergies.length}`} />
          )}
        </div>

        <div style={styles.persistNote}>
          <p style={styles.persistLabel}>Persists to next night:</p>
          <p style={styles.persistText}>
            All evidence, discovered synergies, and unlocked rooms.
          </p>
          <p style={styles.persistLabel}>Resets:</p>
          <p style={styles.persistText}>
            Mansion layout, resources, actions, room interactions.
          </p>
        </div>

        <div style={styles.buttons}>
          <button className="btn btn-primary" style={styles.mainBtn} onClick={startNight}>
            Begin Night {nightNumber + 1}
          </button>
          <button className="btn btn-ghost" onClick={() => setPhase('casebook')}>
            Review Casebook
          </button>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.summaryRow}>
      <span style={styles.summaryLabel}>{label}</span>
      <span style={styles.summaryValue}>{value}</span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    background: 'radial-gradient(ellipse at 50% 60%, #2a2818 0%, #1a1a12 70%)',
    padding: 24,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20,
    maxWidth: 360,
    textAlign: 'center',
  },
  nightLabel: {
    fontSize: 12,
    fontWeight: 500,
    color: 'var(--text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.15em',
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: 28,
    fontWeight: 700,
  },
  flavour: {
    fontFamily: 'var(--font-serif)',
    fontSize: 14,
    fontStyle: 'italic',
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
  },
  summary: {
    width: '100%',
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius-md)',
    padding: 16,
    textAlign: 'left',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '6px 0',
    borderBottom: '1px solid var(--border-subtle)',
  },
  summaryLabel: {
    fontSize: 13,
    color: 'var(--text-secondary)',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  newClues: {
    padding: '8px 0',
    borderBottom: '1px solid var(--border-subtle)',
  },
  newCluesLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--text-accent)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    marginBottom: 6,
  },
  clueItem: {
    fontSize: 13,
    color: 'var(--text-primary)',
    padding: '3px 0',
  },
  persistNote: {
    width: '100%',
    textAlign: 'left',
    padding: '0 4px',
  },
  persistLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    marginTop: 8,
  },
  persistText: {
    fontSize: 13,
    color: 'var(--text-secondary)',
    marginTop: 2,
  },
  buttons: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    width: '100%',
    marginTop: 8,
  },
  mainBtn: {
    width: '100%',
    fontSize: 16,
    padding: '14px 24px',
  },
};
