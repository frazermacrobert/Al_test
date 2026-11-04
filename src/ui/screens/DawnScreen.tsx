import { useGameStore } from '../../engine/store';
import { getClue, getMystery, MYSTERIES } from '../../data/mysteries';

export function DawnScreen() {
  const nightNumber = useGameStore(s => s.nightNumber);
  const casebook = useGameStore(s => s.casebook);
  const roomStates = useGameStore(s => s.roomStates);
  const activeSynergies = useGameStore(s => s.activeSynergies);
  const unlockedTiers = useGameStore(s => s.unlockedTiers);
  const startNight = useGameStore(s => s.startNight);
  const openCasebook = useGameStore(s => s.openCasebook);

  const visitedCount = Object.values(roomStates).filter(r => r.visited).length;
  const cluesFound = casebook.evidence.length;
  const newClues = Object.values(roomStates).flatMap(r => r.discoveredClues);
  const completedMysteries = casebook.completedMysteries;
  const totalMysteries = MYSTERIES.length;
  const maxTier = Math.max(...unlockedTiers);

  return (
    <div className="screen bg-dawn">
      <div className="screen-scroll" style={styles.scrollContent}>
        <div style={styles.content} className="fade-in">
          <span className="badge badge-accent">Dawn</span>
          <h1 style={styles.title}>Night {nightNumber} Ends</h1>
          <p className="font-serif" style={styles.flavour}>
            The house sighs. Walls shift. Rooms dissolve and reform.
            But what you've learned remains.
          </p>

          <div className="game-card" style={styles.summary}>
            <SummaryRow label="Rooms explored" value={`${visitedCount}`} />
            <SummaryRow label="Evidence collected" value={`${cluesFound} total`} />
            {maxTier > 1 && (
              <SummaryRow label="Rooms unlocked" value={`Tier ${maxTier}`} accent />
            )}
            {activeSynergies.length > 0 && (
              <SummaryRow label="Active synergies" value={`${activeSynergies.length}`} />
            )}
          </div>

          {newClues.length > 0 && (
            <div className="game-card" style={styles.newCluesCard}>
              <p className="uppercase" style={{ color: 'var(--text-accent)', marginBottom: 8 }}>
                New discoveries
              </p>
              {newClues.map(clueId => {
                const clue = getClue(clueId);
                return clue ? (
                  <div key={clueId} style={styles.clueRow}>
                    <span style={styles.clueDot} />
                    <span style={styles.clueItem}>{clue.title}</span>
                  </div>
                ) : null;
              })}
            </div>
          )}

          {completedMysteries.length > 0 && (
            <div className="mystery-card" style={styles.mysteryProgress}>
              <p className="uppercase" style={{ color: 'var(--text-accent)', marginBottom: 8 }}>
                Mysteries solved: {completedMysteries.length}/{totalMysteries}
              </p>
              {completedMysteries.map(mId => {
                const m = getMystery(mId);
                return m ? (
                  <p key={mId} style={styles.mysteryItem}>{m.title}</p>
                ) : null;
              })}
            </div>
          )}

          <div className="game-card" style={styles.persistNote}>
            <div style={styles.persistSection}>
              <p className="uppercase" style={{ color: 'var(--color-success)', marginBottom: 4 }}>
                Persists
              </p>
              <p style={styles.persistText}>
                Evidence, solved mysteries, synergies, and unlocked room tiers.
              </p>
            </div>
            <div style={styles.persistDivider} />
            <div style={styles.persistSection}>
              <p className="uppercase" style={{ color: 'var(--color-danger)', marginBottom: 4 }}>
                Resets
              </p>
              <p style={styles.persistText}>
                Layout, resources, actions, items, room interactions.
              </p>
            </div>
          </div>

          <div style={styles.buttons}>
            <button className="btn btn-primary" style={styles.mainBtn} onClick={startNight}>
              Begin Night {nightNumber + 1}
            </button>
            <button className="btn btn-ghost" onClick={openCasebook}>
              Review Casebook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={styles.summaryRow}>
      <span style={styles.summaryLabel}>{label}</span>
      <span style={{
        ...styles.summaryValue,
        color: accent ? 'var(--text-accent)' : 'var(--text-primary)',
      }}>{value}</span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  scrollContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20,
    maxWidth: 360,
    textAlign: 'center',
    margin: '0 auto',
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: 28,
    fontWeight: 700,
  },
  flavour: {
    fontSize: 14,
    fontStyle: 'italic',
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
  },
  summary: {
    width: '100%',
    padding: 16,
    textAlign: 'left',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
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
  newCluesCard: {
    width: '100%',
    padding: 16,
    textAlign: 'left',
    borderColor: 'var(--border-accent)',
  },
  clueRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '4px 0',
  },
  clueDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: 'var(--text-accent)',
    boxShadow: '0 0 6px rgba(228, 180, 76, 0.4)',
    flexShrink: 0,
  },
  clueItem: {
    fontSize: 13,
    color: 'var(--text-primary)',
  },
  mysteryProgress: {
    width: '100%',
    textAlign: 'left',
  },
  mysteryItem: {
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-success)',
    padding: '3px 0',
  },
  persistNote: {
    width: '100%',
    padding: 16,
    textAlign: 'left',
  },
  persistSection: {
    padding: '4px 0',
  },
  persistDivider: {
    height: 1,
    background: 'var(--border-subtle)',
    margin: '8px 0',
  },
  persistText: {
    fontSize: 13,
    color: 'var(--text-secondary)',
    lineHeight: 1.5,
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
