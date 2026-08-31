import { useEffect, useState } from "react";

/**
 * The first-run affordance: one line of Space Mono in the palette green,
 * bottom centre, telling a cold visitor the keys exist. Fades permanently
 * on the first keypress and never returns. This is the piece's only
 * concession to chrome, and it exists because the piece is delivered as a
 * cold link.
 */
export function Hint({ dismissed }: { dismissed: boolean }) {
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (!dismissed) return;
    const id = setTimeout(() => setGone(true), 1200);
    return () => clearTimeout(id);
  }, [dismissed]);

  if (gone) return null;

  return (
    <p className={dismissed ? "hint hint-dismissed" : "hint"}>
      1–6 · space · d
    </p>
  );
}
