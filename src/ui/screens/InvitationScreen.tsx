import { useGameStore } from '../../engine/store';

export function InvitationScreen() {
  const nightNumber = useGameStore(s => s.nightNumber);
  const objective = useGameStore(s => s.nightObjective);
  const silver = useGameStore(s => s.silver);
  const candles = useGameStore(s => s.candles);
  const keys = useGameStore(s => s.keys);
  const actions = useGameStore(s => s.actions);
  const casebook = useGameStore(s => s.casebook);
  const unlockedTiers = useGameStore(s => s.unlockedTiers);
  const setPhase = useGameStore(s => s.setPhase);
  const maxTier = Math.max(...unlockedTiers);

  return (
    <div className="screen" style={styles.container}>
      <div style={styles.content} className="fade-in">
        <p style={styles.nightLabel}>Night {nightNumber}</p>
        <h1 style={styles.title}>{objective?.title ?? 'The House Stirs'}</h1>
        <p style={styles.flavour}>{objective?.flavour}</p>

        <div style={styles.card}>
          <p style={styles.cardLabel}>The house requests:</p>
          <p style={styles.cardText}>{objective?.description}</p>
        </div>

        {objective?.optional && (
          <div style={{ ...styles.card, borderColor: 'var(--border-subtle)' }}>
            <p style={styles.cardLabel}>Opportunity:</p>
            <p style={styles.cardText}>{objective.optional.description}</p>
          </div>
        )}

        <div style={styles.resources}>
          <span>
            {silver} Silver, {candles} Candle{candles !== 1 ? 's' : ''}{keys > 0 ? `, ${keys} Key${keys !== 1 ? 's' : ''}` : ''}, {actions} Actions
          </span>
          {maxTier > 1 && (
            <span style={{ display: 'block', marginTop: 4, color: 'var(--text-accent)' }}>
              Tier {maxTier} rooms unlocked
            </span>
          )}
        </div>

        {casebook.evidence.length > 0 && (
          <div style={styles.persistInfo}>
            {casebook.evidence.length} clue{casebook.evidence.length !== 1 ? 's' : ''} carried forward
            {casebook.completedMysteries.length > 0 && (
              <span> · {casebook.completedMysteries.length} myster{casebook.completedMysteries.length !== 1 ? 'ies' : 'y'} solved</span>
            )}
          </div>
        )}

        <button
          className="btn btn-primary"
          style={styles.btn}
          onClick={() => setPhase('construction')}
        >
          Enter the House
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    background: 'radial-gradient(ellipse at 50% 20%, #2a2818 0%, #1a1a12 70%)',
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
    fontFamily: 'var(--font-sans)',
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
    lineHeight: 1.2,
  },
  flavour: {
    fontFamily: 'var(--font-serif)',
    fontSize: 15,
    fontStyle: 'italic',
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
  },
  card: {
    width: '100%',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-accent)',
    borderRadius: 'var(--radius-md)',
    padding: '14px 16px',
    textAlign: 'left',
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--text-accent)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    marginBottom: 6,
  },
  cardText: {
    fontSize: 14,
    color: 'var(--text-primary)',
    lineHeight: 1.5,
  },
  resources: {
    fontSize: 12,
    color: 'var(--text-muted)',
  },
  persistInfo: {
    fontSize: 12,
    color: 'var(--text-accent)',
    fontWeight: 500,
  },
  btn: {
    width: '100%',
    marginTop: 8,
    fontSize: 16,
    padding: '14px 24px',
  },
};
