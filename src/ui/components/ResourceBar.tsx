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
          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Night {nightNumber}</span>
        </div>
        <div className="resource-item" title="Silver">
          <span className="resource-icon resource-silver" />
          <span style={{ color: 'var(--color-silver)' }}>{silver}</span>
        </div>
        <div className="resource-item" title="Candles">
          <span className="resource-icon resource-candle" />
          <span style={{ color: 'var(--color-candle)' }}>{candles}</span>
        </div>
        <div className="resource-item" title="Keys">
          <span className="resource-icon resource-key" />
          <span style={{ color: 'var(--color-key)' }}>{keys}</span>
        </div>
        <div className="resource-item" title="Actions">
          <span className="resource-icon resource-action" />
          <span style={{ color: 'var(--color-action)', fontWeight: 600 }}>{actions}</span>
        </div>
      </div>
      {showInventory && inventory.length > 0 && (
        <div style={styles.inventoryBar}>
          {inventory.map(itemId => {
            const def = getItemDefinition(itemId);
            return (
              <div key={itemId} style={styles.inventoryPill}>
                <svg width={14} height={14} viewBox="0 0 16 16" fill="none">
                  <path d={def?.icon ?? 'M4 4h8v8H4z'} stroke="var(--text-accent)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={styles.inventoryName}>{def?.name ?? itemId}</span>
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
    padding: '4px 16px 6px',
    background: 'var(--bg-surface)',
    borderBottom: '1px solid var(--border-subtle)',
    overflowX: 'auto',
  },
  inventoryPill: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '3px 8px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-accent)',
    borderRadius: 12,
    flexShrink: 0,
  },
  inventoryName: {
    fontSize: 10,
    fontWeight: 500,
    color: 'var(--text-accent)',
    whiteSpace: 'nowrap' as const,
  },
};
