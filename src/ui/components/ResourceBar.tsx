import { useGameStore } from '../../engine/store';

export function ResourceBar() {
  const silver = useGameStore(s => s.silver);
  const candles = useGameStore(s => s.candles);
  const keys = useGameStore(s => s.keys);
  const actions = useGameStore(s => s.actions);
  const nightNumber = useGameStore(s => s.nightNumber);

  return (
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
        <span style={{ color: 'var(--color-action)' }}>{actions}</span>
      </div>
    </div>
  );
}
