/** A single bounding box detection returned by the AI model. */
export interface Detection {
  id: number;
  x: number; // percentage, 0-100, left edge
  y: number; // percentage, 0-100, top edge
  width: number; // percentage, 0-100
  height: number; // percentage, 0-100
  confidence: number; // 0-1
}

/** Discriminated-union result of a /api/detect call, so the UI can
 * exhaustively switch over every outcome instead of guessing from
 * loosely-typed flags. */
export type DetectionResult =
  | {
      status: "success";
      count: number;
      confidence: number;
      detections: Detection[];
      processingTimeMs: number;
    }
  | { status: "no_chickens"; processingTimeMs: number }
  | { status: "not_a_chicken"; reason: string; processingTimeMs: number }
  | { status: "image_corrupted" }
  | { status: "timeout" }
  | { status: "network_error" }
  | { status: "api_error"; message: string };

export type DetectionMode = "fast" | "accurate";
export type CountMethod = "bounding_box" | "segmentation";
export type ModelVersion = "flock-vision-v3" | "flock-vision-v2" | "flock-vision-lite";

export interface DetectionSettings {
  confidenceThreshold: number; // 0-100
  modelVersion: ModelVersion;
  mode: DetectionMode;
  countMethod: CountMethod;
}

export type HistoryStatus = "success" | "failed" | "no_chickens" | "invalid";

export interface HistoryEntry {
  id: string;
  date: string; // ISO string
  filename: string;
  count: number | null;
  confidence: number | null; // 0-1
  durationMs: number;
  status: HistoryStatus;
  thumbnailColor: string;
}
