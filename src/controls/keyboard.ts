/**
 * Keyboard control + tiny UI store, deliberately outside React.
 *
 * initKeyboard() is called from main.tsx before the React root mounts, so
 * the listener is live the moment the bundle executes: the very first
 * keypress after load is never swallowed, and no click-to-focus is
 * required (the listener is on window, not the canvas).
 *
 * Mapping mirrors the client's enumeration exactly:
 * 1 DORMANT · 2 AWAKE · 3 LISTENING · 4 THINKING · 5 SPEAKING · 6 RETURN.
 */
import { bus, conductor, machine, manualSource, syntheticSource } from "../runtime";
import type { EntityStateName } from "../state/EntityState";
import type { RequestName } from "../state/machine";

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

/* ---- UI store (diagnostics visibility, first-run hint) ---- */

export interface UiState {
  readonly diagnosticsVisible: boolean;
  readonly hintDismissed: boolean;
}

let state: UiState = { diagnosticsVisible: false, hintDismissed: false };
const listeners = new Set<() => void>();

function setState(patch: Partial<UiState>): void {
  state = { ...state, ...patch };
  for (const l of listeners) l();
}

export function subscribeUi(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getUiState(): UiState {
  return state;
}

/* ---- the listener ---- */

const MODIFIER_KEYS = new Set(["Shift", "Meta", "Alt", "Control"]);

function onKeyDown(e: KeyboardEvent): void {
  // Any real keypress dismisses the first-run hint and settles the
  // first-load ember lift; modifiers alone (cmd-tabbing back in) don't.
  if (!state.hintDismissed && !MODIFIER_KEYS.has(e.key)) {
    setState({ hintDismissed: true });
    conductor.notifyFirstInteraction();
  }

  const target = KEY_TO_STATE[e.key];
  if (target) {
    // re-entering SPEAKING restores the synthetic source
    if (target === "SPEAKING") bus.setSource(syntheticSource);
    machine.request(target, performance.now());
    return;
  }
  // match code as well as key: some environments deliver space as a key
  // name rather than the literal " "
  if (e.code === "Space" || e.key === " ") {
    e.preventDefault();
    machine.request(advanceSequence(), performance.now());
    return;
  }
  switch (e.key) {
    case "d":
    case "D":
      setState({ diagnosticsVisible: !state.diagnosticsVisible });
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
}

let initialized = false;

export function initKeyboard(): void {
  if (initialized) return;
  initialized = true;
  window.focus();
  window.addEventListener("keydown", onKeyDown);
}
