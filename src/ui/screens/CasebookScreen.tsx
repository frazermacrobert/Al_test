import { useState } from 'react';
import { useGameStore } from '../../engine/store';
import { getClue, getMystery, MYSTERIES } from '../../data/mysteries';

type Tab = 'evidence' | 'mysteries';

export function CasebookScreen() {
  const casebook = useGameStore(s => s.casebook);
  const closeCasebook = useGameStore(s => s.closeCasebook);
  const [tab, setTab] = useState<Tab>('evidence');

  return (
    <div className="screen">
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={closeCasebook}>
          Back
        </button>
        <h2 style={styles.title}>Casebook</h2>
      </div>

      <div style={styles.tabs}>
        <button
          style={{ ...styles.tab, ...(tab === 'evidence' ? styles.tabActive : {}) }}
          onClick={() => setTab('evidence')}
        >
          Evidence ({casebook.evidence.length})
        </button>
        <button
          style={{ ...styles.tab, ...(tab === 'mysteries' ? styles.tabActive : {}) }}
          onClick={() => setTab('mysteries')}
        >
          Mysteries
        </button>
      </div>

      <div className="screen-scroll" style={{ padding: '16px' }}>
        {tab === 'evidence' && (
          <div style={styles.list}>
            {casebook.evidence.length === 0 ? (
              <p style={styles.empty}>
                No evidence collected yet. Search rooms to discover clues.
              </p>
            ) : (
              casebook.evidence.map(clueId => {
                const clue = getClue(clueId);
                if (!clue) return null;
                return (
                  <div key={clueId} style={styles.card} className="fade-in">
                    <p style={styles.cardSource}>From: {clue.sourceRoom.replace('_', ' ')}</p>
                    <h3 style={styles.cardTitle}>{clue.title}</h3>
                    <p style={styles.cardDesc}>{clue.description}</p>
                  </div>
                );
              })
            )}
          </div>
        )}

        {tab === 'mysteries' && (
          <div style={styles.list}>
            {MYSTERIES.map(mystery => {
              const progress = casebook.mysteryProgress[mystery.id] ?? [];
              const isComplete = casebook.completedMysteries.includes(mystery.id);
              const progressFraction = `${progress.length}/${mystery.requiredClues}`;

              return (
                <div key={mystery.id} style={styles.card} className="fade-in">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={styles.cardTitle}>{mystery.title}</h3>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: isComplete ? 'var(--color-success)' : 'var(--text-muted)',
                    }}>
                      {isComplete ? 'Solved' : progressFraction}
                    </span>
                  </div>
                  <p style={styles.cardQuestion}>{mystery.question}</p>
                  {progress.length > 0 && (
                    <div style={styles.progressClues}>
                      {progress.map(clueId => {
                        const clue = getClue(clueId);
                        return clue ? (
                          <p key={clueId} style={styles.progressClue}>
                            {clue.title}
                          </p>
                        ) : null;
                      })}
                    </div>
                  )}
                  {isComplete && (
                    <p style={styles.resolution}>{mystery.resolution}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    padding: '12px 16px',
    borderBottom: '1px solid var(--border-subtle)',
    flexShrink: 0,
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-accent)',
    fontSize: 13,
    fontWeight: 500,
    padding: '4px 0',
    marginBottom: 4,
    fontFamily: 'var(--font-sans)',
    cursor: 'pointer',
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: 22,
    fontWeight: 600,
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid var(--border-subtle)',
    flexShrink: 0,
  },
  tab: {
    flex: 1,
    padding: '10px 16px',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    color: 'var(--text-muted)',
    fontSize: 13,
    fontWeight: 500,
    fontFamily: 'var(--font-sans)',
    cursor: 'pointer',
  },
  tabActive: {
    color: 'var(--text-accent)',
    borderBottomColor: 'var(--text-accent)',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  empty: {
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: 14,
    padding: '40px 0',
    fontStyle: 'italic',
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-medium)',
    borderRadius: 'var(--radius-md)',
    padding: '12px 14px',
  },
  cardSource: {
    fontSize: 10,
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    color: 'var(--text-muted)',
    marginBottom: 4,
  },
  cardTitle: {
    fontFamily: 'var(--font-serif)',
    fontSize: 16,
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  cardDesc: {
    fontSize: 13,
    color: 'var(--text-secondary)',
    marginTop: 4,
    lineHeight: 1.5,
  },
  cardQuestion: {
    fontFamily: 'var(--font-serif)',
    fontSize: 14,
    fontStyle: 'italic',
    color: 'var(--text-secondary)',
    marginTop: 4,
  },
  progressClues: {
    marginTop: 8,
    paddingTop: 8,
    borderTop: '1px solid var(--border-subtle)',
  },
  progressClue: {
    fontSize: 12,
    color: 'var(--text-accent)',
    padding: '2px 0',
  },
  resolution: {
    marginTop: 8,
    paddingTop: 8,
    borderTop: '1px solid var(--border-subtle)',
    fontFamily: 'var(--font-serif)',
    fontSize: 13,
    color: 'var(--text-primary)',
    fontStyle: 'italic',
    lineHeight: 1.6,
  },
};
