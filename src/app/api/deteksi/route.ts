// import { NextRequest, NextResponse } from "next/server";

// // Route ini terpisah dari /api/detect (yang lama, proxy ke chicken-counting-be).
// // Route ini memanggil Roboflow Serverless Workflow API dan memakai LANGSUNG
// // output_image bawaan Roboflow (sudah ada bounding box-nya) — tidak digambar ulang manual.

// const ROBOFLOW_WORKFLOW_URL =
//   "https://serverless.roboflow.com/lumiares-workspace/workflows/detect-count-and-visualize-2";

// // Di-hardcode sesuai permintaan (bukan environment variable).
// const ROBOFLOW_API_KEY = "C5M2Skv7atL7TgYUz0tY";

// type RoboflowPrediction = {
//   x: number;
//   y: number;
//   width: number;
//   height: number;
//   confidence: number;
//   class: string;
//   class_id: number;
//   detection_id: string;
// };

// type RoboflowWorkflowResult = {
//   count_objects: number;
//   output_image?: { type: "base64"; value: string };
//   predictions: {
//     image: { width: number; height: number };
//     predictions: RoboflowPrediction[];
//   };
// };

// export async function POST(req: NextRequest) {
//   const startedAt = Date.now();

//   let file: File | null = null;
//   try {
//     const formData = await req.formData();
//     const maybeFile = formData.get("file");
//     if (maybeFile instanceof File) file = maybeFile;
//   } catch {
//     return NextResponse.json(
//       { success: false, status: "no_file", message: "Gagal membaca form data." },
//       { status: 400 }
//     );
//   }

//   if (!file) {
//     return NextResponse.json(
//       { success: false, status: "no_file", message: "Tidak ada file yang diunggah." },
//       { status: 400 }
//     );
//   }

//   if (!file.type.startsWith("image/")) {
//     return NextResponse.json(
//       { success: false, status: "unsupported_type", message: "Jenis file ini tidak didukung." },
//       { status: 415 }
//     );
//   }

//   const MAX_SIZE = 20 * 1024 * 1024; // batas 20MB sesuai limit Roboflow Serverless API
//   if (file.size > MAX_SIZE) {
//     return NextResponse.json(
//       { success: false, status: "too_large", message: "Ukuran gambar melebihi 20MB." },
//       { status: 413 }
//     );
//   }

//   try {
//     const arrayBuffer = await file.arrayBuffer();
//     const base64Image = Buffer.from(arrayBuffer).toString("base64");

//     const rfRes = await fetch(ROBOFLOW_WORKFLOW_URL, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         api_key: ROBOFLOW_API_KEY,
//         inputs: {
//           image: { type: "base64", value: base64Image },
//         },
//       }),
//     });

//     if (!rfRes.ok) {
//       const errText = await rfRes.text().catch(() => "");
//       console.error("Roboflow workflow error:", rfRes.status, errText);
//       return NextResponse.json(
//         { success: false, status: "api_error", message: "Layanan deteksi sedang tidak tersedia." },
//         { status: 502 }
//       );
//     }

//     const rfJson = await rfRes.json();

//     // Bentuk asli response Roboflow: { "outputs": [ { count_objects, output_image, predictions } ] }
//     const outputsArray: RoboflowWorkflowResult[] | undefined = Array.isArray(rfJson?.outputs)
//       ? rfJson.outputs
//       : Array.isArray(rfJson)
//         ? rfJson
//         : undefined;

//     const result: RoboflowWorkflowResult | undefined = outputsArray?.[0] ?? rfJson;

//     if (!result) {
//       return NextResponse.json(
//         { success: false, status: "api_error", message: "Respons deteksi tidak valid." },
//         { status: 502 }
//       );
//     }

//     const countObjects = result.count_objects ?? 0;
//     const rawPredictions = result.predictions?.predictions ?? [];
//     const outputImageBase64 = result.output_image?.value;

//     if (countObjects === 0 || rawPredictions.length === 0) {
//       return NextResponse.json({
//         success: true,
//         status: "no_chickens",
//         processingTimeMs: Date.now() - startedAt,
//       });
//     }

//     const avgConfidence =
//       rawPredictions.reduce((sum, p) => sum + p.confidence, 0) / rawPredictions.length;

//     // Konversi (x, y) dari center-point Roboflow ke top-left, sesuai konvensi bounding box umum
//     const detections = rawPredictions.map((p) => ({
//       id: p.detection_id,
//       label: p.class,
//       confidence: p.confidence,
//       x: p.x - p.width / 2,
//       y: p.y - p.height / 2,
//       width: p.width,
//       height: p.height,
//     }));

//     return NextResponse.json({
//       success: true,
//       status: "success",
//       count: countObjects,
//       confidence: avgConfidence,
//       detections,
//       // Gambar bounding box LANGSUNG dari Roboflow (output_image), tidak digambar manual.
//       imageBase64: outputImageBase64 ? `data:image/jpeg;base64,${outputImageBase64}` : null,
//       processingTimeMs: Date.now() - startedAt,
//     });
//   } catch (err) {
//     console.error("Deteksi gagal:", err);
//     return NextResponse.json(
//       { success: false, status: "network_error", message: "Terjadi kesalahan saat memproses gambar." },
//       { status: 500 }
//     );
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const maxDuration = 60;

const REQUEST_TIMEOUT_MS = 45_000;
const MAX_UPLOAD_BYTES = 20 * 1024 * 1024; // sama dengan batas Roboflow Serverless API
const SUPPORTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const ROBOFLOW_WORKFLOW_URL =
  "https://serverless.roboflow.com/lumiares-workspace/workflows/detect-count-and-visualize-2";

// Di-hardcode sesuai permintaan (bukan environment variable).
const ROBOFLOW_API_KEY = "C5M2Skv7atL7TgYUz0tY";

/**
 * Claude di sini HANYA dipakai untuk validasi gambar (apakah ini gambar
 * ayam, dan apakah ayam boiler) — bukan untuk menghitung/mendeteksi.
 * Penghitungan/deteksi tetap memakai algoritma Roboflow, sesuai output_image
 * bawaan Roboflow (tidak digambar ulang manual).
 */
interface ValidationJson {
  is_chicken_image: boolean;
  is_broiler: boolean;
  reason?: string;
}

type RoboflowPrediction = {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  class: string;
  class_id: number;
  detection_id: string;
};

type RoboflowWorkflowResult = {
  count_objects: number;
  output_image?: { type: "base64"; value: string };
  predictions: {
    image: { width: number; height: number };
    predictions: RoboflowPrediction[];
  };
};

function buildValidationSystemPrompt() {
  return `You are an image validation system for a broiler-chicken counting app.

Analyze the provided image and respond with ONLY a JSON object (no markdown fences, no prose) matching exactly this shape:
{
  "is_chicken_image": boolean,
  "is_broiler": boolean,       // only meaningful when is_chicken_image is true
  "reason": string             // required when is_chicken_image is false, or when is_chicken_image is true but is_broiler is false
}

Rules:
- If the image does not contain chickens at all (e.g. it shows people, other animals, vehicles, food, buildings, or text), set is_chicken_image to false, is_broiler to false, and reason to exactly "Gambar tidak bisa di identifikasi".
- If the image shows chickens/poultry but they are clearly not broiler chickens (e.g. layer hens, roosters kept for breeding, ornamental/kampung chickens, or another bird species), set is_chicken_image to true, is_broiler to false, and reason to exactly "Bukan ayam boiler".
- If the image clearly shows broiler chickens, set is_chicken_image to true, is_broiler to true, and reason can be omitted.
- Do not attempt to count the chickens. Do not produce bounding boxes. Only validate what the image contains.
- Return raw JSON only.`;
}

async function validateWithClaude(
  base64: string,
  mediaType: "image/jpeg" | "image/png" | "image/webp"
): Promise<
  | { ok: true; validation: ValidationJson }
  | { ok: false; status: "timeout" | "api_error" | "network_error"; message: string }
> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { ok: false, status: "api_error", message: "Layanan tidak tersedia!" };
  }

  const client = new Anthropic({ apiKey });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await client.messages.create(
      {
        model: "claude-sonnet-4-6",
        max_tokens: 300,
        system: buildValidationSystemPrompt(),
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: mediaType, data: base64 },
              },
              {
                type: "text",
                text: "Validate this image and return the JSON object described in the system prompt.",
              },
            ],
          },
        ],
      },
      { signal: controller.signal }
    );

    clearTimeout(timeout);

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return { ok: false, status: "api_error", message: "service is currently unavailable." };
    }

    try {
      const cleaned = textBlock.text.trim().replace(/^```json\s*|\s*```$/g, "");
      const validation: ValidationJson = JSON.parse(cleaned);
      return { ok: true, validation };
    } catch {
      return { ok: false, status: "api_error", message: "AI service returned an unreadable response." };
    }
  } catch (err: unknown) {
    clearTimeout(timeout);

    if (err instanceof Error && err.name === "AbortError") {
      return { ok: false, status: "timeout", message: "Detection is taking longer than expected." };
    }
    if (err instanceof Anthropic.APIError) {
      return { ok: false, status: "api_error", message: "Terdapat kesalahan jaringan." };
    }
    return { ok: false, status: "network_error", message: "Unable to connect to server." };
  }
}

async function detectWithRoboflow(base64Image: string, confidenceThreshold: number) {
  const rfRes = await fetch(ROBOFLOW_WORKFLOW_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: ROBOFLOW_API_KEY,
      inputs: {
        image: { type: "base64", value: base64Image },
      },
    }),
  });

  if (!rfRes.ok) {
    const errText = await rfRes.text().catch(() => "");
    console.error("Roboflow workflow error:", rfRes.status, errText);
    return {
      ok: false as const,
      response: NextResponse.json(
        { success: false, status: "api_error", message: "Layanan deteksi sedang tidak tersedia." },
        { status: 502 }
      ),
    };
  }

  const rfJson = await rfRes.json();

  // Bentuk asli response Roboflow: { "outputs": [ { count_objects, output_image, predictions } ] }
  const outputsArray: RoboflowWorkflowResult[] | undefined = Array.isArray(rfJson?.outputs)
    ? rfJson.outputs
    : Array.isArray(rfJson)
      ? rfJson
      : undefined;

  const result: RoboflowWorkflowResult | undefined = outputsArray?.[0] ?? rfJson;

  if (!result) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { success: false, status: "api_error", message: "Respons deteksi tidak valid." },
        { status: 502 }
      ),
    };
  }

  const countObjects = result.count_objects ?? 0;
  const rawPredictions = (result.predictions?.predictions ?? []).filter(
    (p) => p.confidence >= confidenceThreshold / 100
  );
  const outputImageBase64 = result.output_image?.value;

  if (countObjects === 0 || rawPredictions.length === 0) {
    return { ok: true as const, empty: true as const };
  }

  const avgConfidence =
    rawPredictions.reduce((sum, p) => sum + p.confidence, 0) / rawPredictions.length;

  // Konversi (x, y) dari center-point Roboflow ke top-left, sesuai konvensi bounding box umum
  const detections = rawPredictions.map((p) => ({
    id: p.detection_id,
    label: p.class,
    confidence: p.confidence,
    x: p.x - p.width / 2,
    y: p.y - p.height / 2,
    width: p.width,
    height: p.height,
  }));

  return {
    ok: true as const,
    empty: false as const,
    count: rawPredictions.length,
    confidence: avgConfidence,
    detections,
    // Gambar bounding box LANGSUNG dari Roboflow (output_image), tidak digambar manual.
    imageBase64: outputImageBase64 ? `data:image/jpeg;base64,${outputImageBase64}` : null,
  };
}

export async function POST(req: NextRequest) {
  const startedAt = Date.now();

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { success: false, status: "network_error", message: "Gagal saat koneksi ke server!" },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  const confidenceThreshold = Number(formData.get("confidenceThreshold") ?? 50);

  if (!(file instanceof File)) {
    return NextResponse.json(
      { success: false, status: "no_file", message: "Please upload an image first." },
      { status: 400 }
    );
  }

  if (!SUPPORTED_IMAGE_TYPES.has(file.type)) {
    // Video files (mp4) reach here too — this route analyzes a single still
    // frame; video support requires extracting a frame client-side or with
    // a media pipeline before calling this endpoint.
    return NextResponse.json(
      { success: false, status: "unsupported_type", message: "This file type is not supported." },
      { status: 415 }
    );
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { success: false, status: "too_large", message: "The uploaded image cannot be processed." },
      { status: 413 }
    );
  }

  let base64: string;
  try {
    const bytes = await file.arrayBuffer();
    if (bytes.byteLength === 0) throw new Error("empty");
    base64 = Buffer.from(bytes).toString("base64");
  } catch {
    return NextResponse.json(
      { success: false, status: "image_corrupted", message: "The uploaded image cannot be processed." },
      { status: 422 }
    );
  }

  // 1) Validasi dengan Claude — pertahankan semua aturan validasi yang sudah ada.
  const validationResult = await validateWithClaude(
    base64,
    file.type as "image/jpeg" | "image/png" | "image/webp"
  );

  if (!validationResult.ok) {
    const statusCode = validationResult.status === "timeout" ? 504 : validationResult.status === "api_error" ? 502 : 503;
    return NextResponse.json(
      { success: false, status: validationResult.status, message: validationResult.message },
      { status: statusCode }
    );
  }

  const { is_chicken_image, is_broiler, reason } = validationResult.validation;

  if (!is_chicken_image) {
    return NextResponse.json({
      success: true,
      status: "not_a_chicken",
      reason: reason || "Gambar tidak bisa di identifikasi",
      processingTimeMs: Date.now() - startedAt,
    });
  }

  if (!is_broiler) {
    return NextResponse.json({
      success: true,
      status: "not_broiler",
      reason: reason || "Bukan ayam boiler",
      processingTimeMs: Date.now() - startedAt,
    });
  }

  // 2) Validasi lolos → hitung/deteksi memakai algoritma Roboflow.
  try {
    const rf = await detectWithRoboflow(base64, confidenceThreshold);

    if (!rf.ok) {
      return rf.response;
    }

    if (rf.empty) {
      return NextResponse.json({
        success: true,
        status: "no_chickens",
        processingTimeMs: Date.now() - startedAt,
      });
    }

    return NextResponse.json({
      success: true,
      status: "success",
      count: rf.count,
      confidence: rf.confidence,
      detections: rf.detections,
      imageBase64: rf.imageBase64,
      processingTimeMs: Date.now() - startedAt,
    });
  } catch (err) {
    console.error("Deteksi gagal:", err);
    return NextResponse.json(
      { success: false, status: "network_error", message: "Terjadi kesalahan saat memproses gambar." },
      { status: 500 }
    );
  }
}