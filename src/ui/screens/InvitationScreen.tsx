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
    <div className="screen bg-atmospheric" style={{ justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      <div style={styles.content} className="fade-in">
        <span className="badge badge-accent">Night {nightNumber}</span>

        <h1 style={styles.title}>{objective?.title ?? 'The House Stirs'}</h1>
        <p style={styles.flavour}>{objective?.flavour}</p>

        <div className="game-card" style={styles.card}>
          <p className="uppercase" style={{ color: 'var(--text-accent)', marginBottom: 6 }}>
            The house requests
          </p>
          <p style={styles.cardText}>{objective?.description}</p>
        </div>

        {objective?.optional && (
          <div className="game-card" style={{ ...styles.card, borderColor: 'var(--border-subtle)' }}>
            <p className="uppercase" style={{ color: 'var(--text-muted)', marginBottom: 6 }}>
              Opportunity
            </p>
            <p style={styles.cardText}>{objective.optional.description}</p>
          </div>
        )}

        <div style={styles.resources}>
          <span className="badge" style={{ background: 'rgba(208, 208, 208, 0.08)', color: 'var(--color-silver)', border: '1px solid rgba(208, 208, 208, 0.15)' }}>
            {silver} Silver
          </span>
          <span className="badge" style={{ background: 'rgba(240, 184, 48, 0.08)', color: 'var(--color-candle)', border: '1px solid rgba(240, 184, 48, 0.15)' }}>
            {candles} Candle{candles !== 1 ? 's' : ''}
          </span>
          {keys > 0 && (
            <span className="badge" style={{ background: 'rgba(212, 152, 88, 0.08)', color: 'var(--color-key)', border: '1px solid rgba(212, 152, 88, 0.15)' }}>
              {keys} Key{keys !== 1 ? 's' : ''}
            </span>
          )}
          <span className="badge badge-success">
            {actions} Action{actions !== 1 ? 's' : ''}
          </span>
        </div>

        {maxTier > 1 && (
          <span className="badge badge-accent" style={{ fontSize: 11 }}>
            Tier {maxTier} rooms unlocked
          </span>
        )}

        {casebook.evidence.length > 0 && (
          <p className="text-accent" style={styles.persistInfo}>
            {casebook.evidence.length} clue{casebook.evidence.length !== 1 ? 's' : ''} carried forward
            {casebook.completedMysteries.length > 0 && (
              <span> · {casebook.completedMysteries.length} myster{casebook.completedMysteries.length !== 1 ? 'ies' : 'y'} solved</span>
            )}
          </p>
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
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20,
    maxWidth: 360,
    textAlign: 'center',
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
    padding: '14px 16px',
    textAlign: 'left',
  },
  cardText: {
    fontSize: 14,
    color: 'var(--text-primary)',
    lineHeight: 1.5,
  },
  resources: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  persistInfo: {
    fontSize: 12,
    fontWeight: 500,
  },
  btn: {
    width: '100%',
    marginTop: 8,
    fontSize: 16,
    padding: '14px 24px',
  },
};
