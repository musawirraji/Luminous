import { useEffect, useState } from "react";

import { bus, diag, type DiagSnapshot } from "../runtime";

/**
 * The only type in the piece. Typographic labels and values, no icons,
 * no glyphs; polls the runtime snapshot at 4Hz while visible. Off by
 * default — `d` toggles.
 */
export function Diagnostics({ visible }: { visible: boolean }) {
  const [snap, setSnap] = useState<DiagSnapshot | null>(null);

  useEffect(() => {
    if (!visible) return;
    const update = () => setSnap({ ...diag, source: bus.sourceId });
    update();
    const id = setInterval(update, 250);
    return () => clearInterval(id);
  }, [visible]);

  if (!visible || !snap) return null;

  return (
    <dl className="diagnostics">
      <dt>state</dt>
      <dd>{snap.label}</dd>
      <dt>fps</dt>
      <dd>
        {snap.fps.toFixed(0)} / p95 {snap.p95Ms.toFixed(1)}ms
      </dd>
      <dt>amp</dt>
      <dd>
        {snap.amp.toFixed(2)} · {snap.source}
      </dd>
      <dt>tier</dt>
      <dd>
        {snap.tier} · {snap.drawCalls} calls
      </dd>
    </dl>
  );
}
