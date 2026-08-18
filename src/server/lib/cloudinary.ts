import { v2 as cloudinary } from "cloudinary";
import { ValidationError } from "../types/app-error";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

const isConfigured = Boolean(cloudName && apiKey && apiSecret);

if (isConfigured) {
    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
    });
}

/** Normalized result returned after a successful Cloudinary upload. */
export type CloudinaryUploadResult = {
    secureUrl: string;
    publicId: string;
    bytes: number;
    originalFilename: string;
    resourceType: "raw" | "image" | "video";
};

export function getSignedCloudinaryDownloadUrl(
    publicId: string,
    resourceType: "raw" | "image" = "raw",
) {
    if (!isConfigured) return null;

    return cloudinary.url(publicId, {
        resource_type: resourceType,
        type: "upload",
        sign_url: true,
        secure: true,
    });
}

/**
 * Uploads a buffer to Cloudinary via a signed request (using
 * `CLOUDINARY_API_KEY`/`CLOUDINARY_API_SECRET`).
 *
 * Note: When using signed authentication (API key + secret), we do NOT pass
 * an upload_preset. Upload presets are primarily for unsigned (client-side)
 * uploads. If a preset is configured as "signed" in Cloudinary, passing it
 * alongside signed credentials causes a 403 error because both try to sign
 * the request differently.
 */
function uploadBuffer(
    buffer: Buffer,
    filename: string,
    options: {
        resourceType: "raw" | "video";
        folder: string;
    },
): Promise<CloudinaryUploadResult> {
    if (!isConfigured) {
        throw new ValidationError(
            "Cloudinary is not configured on the server (missing CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET)",
        );
    }

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: options.resourceType,
                folder: options.folder,
                filename_override: filename,
                // Do NOT pass upload_preset when using signed authentication
                // (API key + secret). Presets are for unsigned uploads.
            },
            (error, result) => {
                if (error || !result) {
                    if (error?.http_code === 401 || error?.http_code === 403) {
                        reject(
                            new ValidationError(
                                `Cloudinary rejected the upload (${error.http_code}). Double-check CLOUDINARY_API_KEY/API_SECRET are correct, and that CLOUDINARY_UPLOAD_PRESET (if set) matches a preset that exists in this Cloudinary account.`,
                            ),
                        );
                        return;
                    }
                    reject(
                        new ValidationError(
                            error?.message ?? "Cloudinary upload failed",
                        ),
                    );
                    return;
                }

                resolve({
                    secureUrl: result.secure_url,
                    publicId: result.public_id,
                    bytes: result.bytes,
                    originalFilename: filename,
                    resourceType:
                        result.resource_type === "image"
                            ? "image"
                            : result.resource_type === "video"
                              ? "video"
                              : "raw",
                });
            },
        );

        uploadStream.end(buffer);
    });
}

/**
 * Uploads a PDF buffer to Cloudinary.
 *
 * @param buffer - PDF file bytes
 * @param filename - Original filename
 * @returns Upload metadata including secure URL and public id
 * @throws {ValidationError} When Cloudinary is not configured or upload is rejected
 *
 */
export function uploadPdfToCloudinary(buffer: Buffer, filename: string) {
    return uploadBuffer(buffer, filename, {
        resourceType: "raw",
        folder: "chaibook/pdfs",
    });
}

/**
 * Uploads a synthesized audio segment (mp3, from OpenAI TTS) to Cloudinary.
 * Cloudinary treats audio under its "video" resource type.
 *
 * @param buffer - MP3 bytes returned by the TTS API
 * @param filename - Descriptive filename, e.g. `${podcastId}-segment-2.mp3`
 * @returns Upload metadata including the playable secure URL
 * @throws {ValidationError} When Cloudinary is not configured or upload is rejected
 *
 */
export function uploadAudioToCloudinary(buffer: Buffer, filename: string) {
    return uploadBuffer(buffer, filename, {
        resourceType: "video",
        folder: "chaibook/podcasts",
    });
}
