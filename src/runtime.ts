/**
 * The app's singletons. State lives here — outside React, outside three —
 * and the renderer reads it each frame (docs/02-plan.md §2d).
 */
import { AmplitudeBus } from "./amplitude/AmplitudeBus";
import { ManualSource } from "./amplitude/ManualSource";
import { SyntheticSpeechSource } from "./amplitude/SyntheticSpeechSource";
import { Conductor } from "./state/conductor";
import { StateMachine, type MachineLabel } from "./state/machine";

export const machine = new StateMachine();
export const bus = new AmplitudeBus();
export const syntheticSource = new SyntheticSpeechSource();
export const manualSource = new ManualSource();
export const conductor = new Conductor(machine, bus);

bus.setSource(syntheticSource);

/** mutable diagnostics snapshot, written by the render loop at frame rate
 *  and polled by the Diagnostics readout at 4Hz */
export interface DiagSnapshot {
  label: MachineLabel;
  fps: number;
  p95Ms: number;
  amp: number;
  source: string;
  tier: string;
  drawCalls: number;
}

export const diag: DiagSnapshot = {
  label: "DORMANT",
  fps: 0,
  p95Ms: 0,
  amp: 0,
  source: bus.sourceId,
  tier: "high",
  drawCalls: 0,
};
