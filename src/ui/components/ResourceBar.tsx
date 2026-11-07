import { useGameStore } from '../../engine/store';
import { getItemDefinition } from '../../data/items';

export function ResourceBar() {
  const silver = useGameStore(s => s.silver);
  const candles = useGameStore(s => s.candles);
  const keys = useGameStore(s => s.keys);
  const actions = useGameStore(s => s.actions);
  const nightNumber = useGameStore(s => s.nightNumber);
  const inventory = useGameStore(s => s.inventory);
  const phase = useGameStore(s => s.phase);

  const showInventory = phase === 'exploration' || phase === 'room';

  return (
    <div style={{ flexShrink: 0 }}>
      <div className="resource-bar">
        <div className="resource-item" style={{ marginRight: 'auto' }}>
          <span style={{
            color: 'var(--text-accent)',
            fontSize: 12,
            fontWeight: 700,
            textShadow: '0 0 10px rgba(228, 180, 76, 0.3)',
            letterSpacing: '0.03em',
          }}>
            Night {nightNumber}
          </span>
        </div>

        <div className="resource-pill" title="Silver">
          <svg width={14} height={14} viewBox="0 0 16 16" style={{ flexShrink: 0 }}>
            <circle cx="8" cy="8" r="6" fill="none" stroke="var(--color-silver)" strokeWidth="1.5" />
            <circle cx="8" cy="8" r="3.5" fill="var(--color-silver)" fillOpacity="0.25" stroke="var(--color-silver)" strokeWidth="0.8" />
            <path d="M6.5 8.5L8 6l1.5 2.5" fill="none" stroke="var(--color-silver)" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ color: 'var(--color-silver)', fontWeight: 600, fontSize: 13 }}>{silver}</span>
        </div>

        <div className="resource-pill" title="Candles" style={{ borderColor: 'rgba(240,184,48,0.15)' }}>
          <svg width={14} height={14} viewBox="0 0 16 16" style={{ flexShrink: 0 }}>
            <rect x="6" y="7" width="4" height="6" rx="1" fill="var(--color-candle)" fillOpacity="0.2" stroke="var(--color-candle)" strokeWidth="1" />
            <path d="M8 7V5c-1-1.5 0-3 0-3s1 1.5 0 3" fill="var(--color-candle)" fillOpacity="0.5" stroke="var(--color-candle)" strokeWidth="0.6" strokeLinecap="round" />
            <ellipse cx="8" cy="4" rx="1.2" ry="1.8" fill="var(--color-candle)" fillOpacity="0.35" />
          </svg>
          <span style={{ color: 'var(--color-candle)', fontWeight: 600, fontSize: 13 }}>{candles}</span>
        </div>

        <div className="resource-pill" title="Keys" style={{ borderColor: 'rgba(212,152,88,0.12)' }}>
          <svg width={14} height={14} viewBox="0 0 16 16" style={{ flexShrink: 0 }}>
            <circle cx="6" cy="6" r="3" fill="var(--color-key)" fillOpacity="0.15" stroke="var(--color-key)" strokeWidth="1.2" />
            <circle cx="6" cy="6" r="1" fill="none" stroke="var(--color-key)" strokeWidth="0.8" />
            <path d="M8.5 8.5L12 12M10.5 12h1.5v-1.5" fill="none" stroke="var(--color-key)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ color: 'var(--color-key)', fontWeight: 600, fontSize: 13 }}>{keys}</span>
        </div>

        <div className="resource-pill" title="Actions" style={{ borderColor: 'rgba(104,200,104,0.15)', background: actions > 0 ? 'rgba(104,200,104,0.06)' : 'rgba(208,64,64,0.08)' }}>
          <svg width={14} height={14} viewBox="0 0 16 16" style={{ flexShrink: 0 }}>
            <path
              d="M8 2l2 4h-1.5v3h-1V6H6l2-4zM5 12h6M4 14h8"
              fill={actions > 0 ? 'var(--color-action)' : 'var(--color-danger)'}
              fillOpacity="0.15"
              stroke={actions > 0 ? 'var(--color-action)' : 'var(--color-danger)'}
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span style={{
            color: actions > 0 ? 'var(--color-action)' : 'var(--color-danger)',
            fontWeight: 700,
            fontSize: 13,
          }}>{actions}</span>
        </div>
      </div>

      {showInventory && inventory.length > 0 && (
        <div style={styles.inventoryBar}>
          {inventory.map(itemId => {
            const def = getItemDefinition(itemId);
            return (
              <div key={itemId} className="badge badge-accent" style={styles.inventoryPill}>
                <svg width={12} height={12} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                  <path d={def?.icon ?? 'M4 4h8v8H4z'} fill="var(--text-accent)" fillOpacity="0.15" stroke="var(--text-accent)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {def?.name ?? itemId}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  inventoryBar: {
    display: 'flex',
    gap: 6,
    padding: '5px 16px 6px',
    background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-deep) 100%)',
    borderBottom: '1px solid var(--border-subtle)',
    overflowX: 'auto',
  },
  inventoryPill: {
    flexShrink: 0,
    fontSize: 11,
  },
};
