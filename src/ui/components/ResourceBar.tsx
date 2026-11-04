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
            fontWeight: 600,
            textShadow: '0 0 8px rgba(228, 180, 76, 0.2)',
          }}>
            Night {nightNumber}
          </span>
        </div>
        <div className="resource-item" title="Silver">
          <span className="resource-icon resource-silver" />
          <span style={{ color: 'var(--color-silver)', fontWeight: 500 }}>{silver}</span>
        </div>
        <div className="resource-item" title="Candles">
          <span className="resource-icon resource-candle" />
          <span style={{ color: 'var(--color-candle)', fontWeight: 500 }}>{candles}</span>
        </div>
        <div className="resource-item" title="Keys">
          <span className="resource-icon resource-key" />
          <span style={{ color: 'var(--color-key)', fontWeight: 500 }}>{keys}</span>
        </div>
        <div className="resource-item" title="Actions">
          <span className="resource-icon resource-action" />
          <span style={{ color: 'var(--color-action)', fontWeight: 700 }}>{actions}</span>
        </div>
      </div>
      {showInventory && inventory.length > 0 && (
        <div style={styles.inventoryBar}>
          {inventory.map(itemId => {
            const def = getItemDefinition(itemId);
            return (
              <div key={itemId} className="badge badge-accent" style={styles.inventoryPill}>
                <svg width={12} height={12} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                  <path d={def?.icon ?? 'M4 4h8v8H4z'} stroke="var(--text-accent)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
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
