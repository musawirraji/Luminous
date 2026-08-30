import { useEffect } from "react";

import { bus, machine, manualSource, syntheticSource } from "../runtime";
import type { EntityStateName } from "../state/EntityState";
import type { RequestName } from "../state/machine";

/** 1 DORMANT · 2 AWAKE · 3 LISTENING · 4 THINKING · 5 SPEAKING · 6 RETURN —
 *  mirrors the client's enumeration exactly */
const KEY_TO_STATE: Record<string, RequestName> = {
  "1": "DORMANT",
  "2": "AWAKE",
  "3": "LISTENING",
  "4": "THINKING",
  "5": "SPEAKING",
  "6": "RETURN",
};

const SEQUENCE_NEXT: Record<EntityStateName, RequestName> = {
  DORMANT: "AWAKE",
  AWAKE: "LISTENING",
  LISTENING: "THINKING",
  THINKING: "SPEAKING",
  SPEAKING: "RETURN",
};

function advanceSequence(): RequestName {
  // mid-RETURN, space wakes it again rather than waiting out the dissolve
  if (machine.label === "RETURNING") return "AWAKE";
  return SEQUENCE_NEXT[machine.targetName];
}

export function useKeyboard(toggleDiagnostics: () => void): void {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const state = KEY_TO_STATE[e.key];
      if (state) {
        // re-entering SPEAKING restores the synthetic source
        if (state === "SPEAKING") bus.setSource(syntheticSource);
        machine.request(state, performance.now());
        return;
      }
      switch (e.key) {
        case " ":
          e.preventDefault();
          machine.request(advanceSequence(), performance.now());
          break;
        case "d":
        case "D":
          toggleDiagnostics();
          break;
        case "ArrowUp":
          e.preventDefault();
          bus.setSource(manualSource);
          manualSource.nudge(0.1);
          break;
        case "ArrowDown":
          e.preventDefault();
          bus.setSource(manualSource);
          manualSource.nudge(-0.1);
          break;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggleDiagnostics]);
}
