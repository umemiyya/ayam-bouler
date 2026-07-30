import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const maxDuration = 60;

const REQUEST_TIMEOUT_MS = 45_000;
const MAX_UPLOAD_BYTES = 20 * 1024 * 1024; // Claude vision inputs are capped well under this
const SUPPORTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

/**
 * Shape the model is instructed to return. Video frames are not
 * analyzed directly by the vision model in this route — only the
 * first extracted frame/thumbnail should be sent as an image; video
 * files are rejected here with a clear message so the client can
 * fall back to server-side frame extraction if that's added later.
 */
interface ModelJson {
  is_chicken_image: boolean;
  reason?: string;
  chicken_count: number;
  confidence: number; // 0-1
  detections: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    confidence: number;
  }>;
}

function buildSystemPrompt(confidenceThreshold: number, countMethod: string) {
  return `You are a computer vision system specialized in counting broiler chickens in farm imagery.

Analyze the provided image and respond with ONLY a JSON object (no markdown fences, no prose) matching exactly this shape:
{
  "is_chicken_image": boolean,
  "reason": string,            // required when is_chicken_image is false — briefly say what the image contains instead
  "chicken_count": number,     // total chickens confidently identified, excluding any below ${confidenceThreshold}% confidence
  "confidence": number,        // overall confidence for the count, 0 to 1
  "detections": [
    { "x": number, "y": number, "width": number, "height": number, "confidence": number }
  ]
}

Rules:
- x, y, width, height are percentages of the image (0-100), describing a ${countMethod === "segmentation" ? "tight segmentation-style" : "bounding box"} region per bird.
- Only include a detection in "detections" and count it toward "chicken_count" if its confidence is 92% (0.92) or higher. Any detection below 92% confidence must be discarded entirely — do not include it in the array and do not count it.
- If the image does not contain chickens at all (e.g. it shows people, other animals, vehicles, food, buildings, or text), set is_chicken_image to false, chicken_count to 0, detections to [], and set reason to exactly "Gambar tidak bisa di identifikasi".
- If the image shows chickens/poultry but they are clearly not broiler chickens (e.g. layer hens, roosters kept for breeding, ornamental/kampung chickens, or another bird species), set is_chicken_image to false, chicken_count to 0, detections to [], and set reason to exactly "Bukan ayam boiler".
- If it is a broiler chicken image but no chickens are clearly identifiable at ≥92% confidence (e.g. birds too obscured, wrong angle), set is_chicken_image to true, chicken_count to 0, detections to [], and reason can briefly explain why (e.g. "Ayam boiler tidak dapat diidentifikasi dengan jelas").
- Never invent detections you are not reasonably confident about.
- Return raw JSON only.`;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { success: false, status: "api_error", message: "Layanan tidak tersedia!" },
      { status: 500 }
    );
  }

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
  const countMethod = String(formData.get("countMethod") ?? "bounding_box");
  const modelVersion = String(formData.get("modelVersion") ?? "flock-vision-v3");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { success: false, status: "no_file", message: "Please upload an image first." },
      { status: 400 }
    );
  }

  if (!SUPPORTED_IMAGE_TYPES.has(file.type)) {
    // Video files (mp4) reach here too — this API route analyzes a single
    // still frame; video support requires extracting a frame client-side
    // or with a media pipeline before calling this endpoint.
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

  const client = new Anthropic({ apiKey });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const startedAt = Date.now();

  // Map the dashboard's model picker onto real Claude vision models.
  const modelId =
    modelVersion === "flock-vision-lite"
      ? "claude-haiku-4-5-20251001"
      : "claude-sonnet-4-6";

  try {
    const response = await client.messages.create(
      {
        model: modelId,
        max_tokens: 2048,
        system: buildSystemPrompt(confidenceThreshold, countMethod),
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: file.type as "image/jpeg" | "image/png" | "image/webp",
                  data: base64,
                },
              },
              {
                type: "text",
                text: "Count the broiler chickens in this image and return the JSON object described in the system prompt.",
              },
            ],
          },
        ],
      },
      { signal: controller.signal }
    );

    clearTimeout(timeout);
    const processingTimeMs = Date.now() - startedAt;

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { success: false, status: "api_error", message: "service is currently unavailable." },
        { status: 502 }
      );
    }

    let parsed: ModelJson;
    try {
      const cleaned = textBlock.text.trim().replace(/^```json\s*|\s*```$/g, "");
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { success: false, status: "api_error", message: "AI service returned an unreadable response." },
        { status: 502 }
      );
    }

    if (!parsed.is_chicken_image) {
      return NextResponse.json({
        success: true,
        status: "not_a_chicken",
        reason: parsed.reason || "This image does not contain broiler chickens.",
        processingTimeMs,
      });
    }

    if (!parsed.chicken_count || parsed.chicken_count <= 0) {
      return NextResponse.json({
        success: true,
        status: "no_chickens",
        processingTimeMs,
      });
    }

    const detections = (parsed.detections || [])
      .filter((d) => d.confidence >= confidenceThreshold / 100)
      .map((d, i) => ({ id: i + 1, ...d }));

    return NextResponse.json({
      success: true,
      status: "success",
      count: parsed.chicken_count,
      confidence: parsed.confidence,
      detections,
      processingTimeMs,
    });
  } catch (err: unknown) {
    clearTimeout(timeout);

    if (err instanceof Error && err.name === "AbortError") {
      return NextResponse.json(
        { success: false, status: "timeout", message: "Detection is taking longer than expected." },
        { status: 504 }
      );
    }

    if (err instanceof Anthropic.APIError) {
      return NextResponse.json(
        { success: false, status: "api_error", message: "Terdapat kesalahan jaringan." },
        { status: 502 }
      );
    }

    // Anything else (DNS failure, fetch rejection, etc.) is treated as a
    // network-level failure rather than surfacing raw error internals.
    return NextResponse.json(
      { success: false, status: "network_error", message: "Unable to connect to server." },
      { status: 503 }
    );
  }
}
