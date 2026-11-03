import { useGameStore } from '../../engine/store';
import { useEffect, useState } from 'react';

export function TitleScreen() {
  const startNight = useGameStore(s => s.startNight);
  const loadSavedGame = useGameStore(s => s.loadSavedGame);
  const [hasSave, setHasSave] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const found = loadSavedGame();
    if (found) {
      setHasSave(true);
      useGameStore.getState().setPhase('title');
    }
    setLoaded(true);
  }, []);

  if (!loaded) return null;

  return (
    <div className="screen" style={styles.container}>
      <div style={styles.content} className="fade-in">
        <div style={styles.emblem}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <path d="M32 4L4 24v32h56V24L32 4z" stroke="var(--text-accent)" strokeWidth="2" fill="none" />
            <path d="M24 56V38h16v18" stroke="var(--text-accent)" strokeWidth="2" fill="none" />
            <circle cx="32" cy="18" r="4" stroke="var(--text-accent)" strokeWidth="1.5" fill="none" />
            <line x1="32" y1="14" x2="32" y2="4" stroke="var(--text-accent)" strokeWidth="1" />
          </svg>
        </div>
        <h1 style={styles.title}>The House<br />Remembers</h1>
        <p style={styles.tagline}>
          Every night the house changes.<br />Every room remembers something.
        </p>

        <div style={styles.buttons}>
          <button className="btn btn-primary" style={styles.mainBtn} onClick={() => {
            useGameStore.getState().newGame();
            startNight();
          }}>
            {hasSave ? 'New Game' : 'Begin'}
          </button>
          {hasSave && (
            <button className="btn btn-secondary" style={styles.mainBtn} onClick={() => {
              loadSavedGame();
            }}>
              Continue (Night {useGameStore.getState().nightNumber})
            </button>
          )}
        </div>

        <p style={styles.credit}>Ashcombe House awaits its heir.</p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    background: 'radial-gradient(ellipse at 50% 30%, #2a2818 0%, #1a1a12 70%)',
    padding: 32,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 24,
    maxWidth: 360,
    textAlign: 'center',
  },
  emblem: {
    opacity: 0.8,
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: 36,
    fontWeight: 700,
    lineHeight: 1.15,
    color: 'var(--text-primary)',
    letterSpacing: '0.02em',
  },
  tagline: {
    fontFamily: 'var(--font-serif)',
    fontSize: 16,
    fontStyle: 'italic',
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
  },
  buttons: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    width: '100%',
    marginTop: 8,
  },
  mainBtn: {
    width: '100%',
    fontSize: 16,
    padding: '14px 24px',
  },
  credit: {
    fontSize: 12,
    color: 'var(--text-muted)',
    marginTop: 16,
  },
};
