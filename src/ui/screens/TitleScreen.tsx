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
    <div className="screen" style={{
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
      background: 'radial-gradient(ellipse at 50% 35%, rgba(228,180,76,0.1) 0%, transparent 50%), radial-gradient(ellipse at 30% 70%, rgba(120,90,40,0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(40,30,10,0.4) 0%, transparent 40%), var(--bg-deep)',
    }}>
      {/* Floating particles */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[...Array(12)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: i % 3 === 0 ? 3 : 2,
            height: i % 3 === 0 ? 3 : 2,
            borderRadius: '50%',
            background: 'var(--text-accent)',
            opacity: 0.15 + (i % 4) * 0.05,
            left: `${8 + (i * 7.5) % 84}%`,
            top: `${10 + (i * 13) % 80}%`,
            animation: `float${i % 3} ${6 + (i % 4) * 2}s ease-in-out infinite`,
            animationDelay: `${i * 0.7}s`,
            boxShadow: '0 0 6px rgba(228,180,76,0.3)',
          }} />
        ))}
        <style>{`
          @keyframes float0 { 0%,100%{transform:translateY(0) translateX(0)} 50%{transform:translateY(-20px) translateX(5px)} }
          @keyframes float1 { 0%,100%{transform:translateY(0) translateX(0)} 50%{transform:translateY(-15px) translateX(-8px)} }
          @keyframes float2 { 0%,100%{transform:translateY(0) translateX(0)} 50%{transform:translateY(-25px) translateX(3px)} }
        `}</style>
      </div>

      <div style={styles.content} className="fade-in">
        {/* Emblem */}
        <div style={styles.emblem}>
          <svg width="100" height="100" viewBox="0 0 64 64" fill="none">
            {/* Outer glow ring */}
            <circle cx="32" cy="32" r="30" stroke="var(--text-accent)" strokeWidth="0.5" strokeOpacity="0.2" />
            {/* House structure with fill */}
            <path d="M32 8L8 26v28h48V26L32 8z"
              fill="var(--text-accent)" fillOpacity="0.06"
              stroke="var(--text-accent)" strokeWidth="1.8" />
            {/* Roof accent */}
            <path d="M32 8L8 26h48L32 8z"
              fill="var(--text-accent)" fillOpacity="0.1" />
            {/* Door */}
            <path d="M25 54V38h14v16"
              fill="var(--text-accent)" fillOpacity="0.08"
              stroke="var(--text-accent)" strokeWidth="1.5" />
            {/* Door arch */}
            <path d="M25 38a7 7 0 0114 0" fill="none" stroke="var(--text-accent)" strokeWidth="1" strokeOpacity="0.5" />
            {/* Window left */}
            <rect x="13" y="30" width="8" height="8" rx="1"
              fill="var(--text-accent)" fillOpacity="0.12"
              stroke="var(--text-accent)" strokeWidth="1" />
            <line x1="17" y1="30" x2="17" y2="38" stroke="var(--text-accent)" strokeWidth="0.5" strokeOpacity="0.4" />
            <line x1="13" y1="34" x2="21" y2="34" stroke="var(--text-accent)" strokeWidth="0.5" strokeOpacity="0.4" />
            {/* Window right */}
            <rect x="43" y="30" width="8" height="8" rx="1"
              fill="var(--text-accent)" fillOpacity="0.12"
              stroke="var(--text-accent)" strokeWidth="1" />
            <line x1="47" y1="30" x2="47" y2="38" stroke="var(--text-accent)" strokeWidth="0.5" strokeOpacity="0.4" />
            <line x1="43" y1="34" x2="51" y2="34" stroke="var(--text-accent)" strokeWidth="0.5" strokeOpacity="0.4" />
            {/* Attic window */}
            <circle cx="32" cy="20" r="4"
              fill="var(--text-accent)" fillOpacity="0.15"
              stroke="var(--text-accent)" strokeWidth="1.2" />
            <line x1="32" y1="16" x2="32" y2="24" stroke="var(--text-accent)" strokeWidth="0.5" strokeOpacity="0.4" />
            <line x1="28" y1="20" x2="36" y2="20" stroke="var(--text-accent)" strokeWidth="0.5" strokeOpacity="0.4" />
            {/* Chimney */}
            <rect x="42" y="12" width="5" height="14" rx="1"
              fill="var(--bg-deep)" stroke="var(--text-accent)" strokeWidth="1" />
            {/* Smoke wisps */}
            <path d="M44.5 12c0-2 1-3 0-5M46 11c0-2-0.5-3 0.5-5" stroke="var(--text-accent)" strokeWidth="0.6" strokeOpacity="0.3" strokeLinecap="round" />
          </svg>
        </div>

        <h1 style={styles.title}>The House<br />Remembers</h1>

        <div style={styles.divider}>
          <div style={styles.dividerDot} />
          <div style={styles.dividerLine} />
          <div style={styles.dividerDot} />
        </div>

        <p className="font-serif" style={styles.tagline}>
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

        <p className="font-serif" style={styles.credit}>Ashcombe House awaits its heir.</p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 24,
    maxWidth: 360,
    textAlign: 'center',
    position: 'relative',
    zIndex: 1,
  },
  emblem: {
    filter: 'drop-shadow(0 0 30px rgba(228, 180, 76, 0.2))',
    animation: 'breathe 6s ease-in-out infinite',
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: 42,
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '0.02em',
    background: 'linear-gradient(180deg, #f0d080 0%, #e4b44c 40%, #c89830 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    filter: 'drop-shadow(0 2px 8px rgba(228, 180, 76, 0.25))',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  dividerLine: {
    width: 80,
    height: 1,
    background: 'linear-gradient(90deg, transparent, var(--text-accent), transparent)',
    opacity: 0.4,
  },
  dividerDot: {
    width: 4,
    height: 4,
    borderRadius: '50%',
    background: 'var(--text-accent)',
    opacity: 0.5,
    boxShadow: '0 0 6px rgba(228,180,76,0.4)',
  },
  tagline: {
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
    fontSize: 17,
    padding: '16px 24px',
  },
  credit: {
    fontSize: 12,
    color: 'var(--text-muted)',
    marginTop: 16,
    letterSpacing: '0.05em',
  },
};
