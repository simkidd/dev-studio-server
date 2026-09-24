import { v2 as cloudinary } from "cloudinary";
import fs from "node:fs/promises";
import path from "node:path";
import { ENV } from "../config/env";
import { logger } from "../utils/logger";

const isCloudinaryConfigured = Boolean(
  ENV.CLOUDINARY_CLOUD_NAME &&
  ENV.CLOUDINARY_API_KEY &&
  ENV.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
    api_key: ENV.CLOUDINARY_API_KEY,
    api_secret: ENV.CLOUDINARY_API_SECRET,
    secure: true,
  });
  logger.info("☁️ Cloudinary configured successfully for media uploads.");
} else {
  logger.warn("⚠️ Cloudinary keys not provided. Uploads will fallback to local disk storage (/uploads).");
}

export interface UploadResult {
  url: string;
  publicId?: string;
  originalName: string;
  format: string;
  bytes: number;
}

export class UploadService {
  private static readonly LOCAL_UPLOAD_DIR = path.join(process.cwd(), "uploads");

  /**
   * Uploads a file buffer to Cloudinary or falls back to local disk
   */
  static async uploadFile(
    file: Express.Multer.File,
    folder = "dev-portfolio",
  ): Promise<UploadResult> {
    if (isCloudinaryConfigured) {
      return this.uploadToCloudinary(file, folder);
    }
    return this.uploadToLocalDisk(file);
  }

  /**
   * Upload buffer directly to Cloudinary
   */
  private static async uploadToCloudinary(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const isPdf = file.mimetype === "application/pdf";
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: isPdf ? "raw" : "image",
          format: isPdf ? undefined : "webp",
          quality: "auto",
        },
        (error, result) => {
          if (error || !result) {
            logger.error("Cloudinary upload failed:", error);
            return reject(new Error("Failed to upload image to cloud storage"));
          }

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            originalName: file.originalname,
            format: result.format || file.mimetype.split("/")[1] || "webp",
            bytes: result.bytes,
          });
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  /**
   * Fallback: Save buffer to local disk (uploads directory)
   */
  private static async uploadToLocalDisk(
    file: Express.Multer.File,
  ): Promise<UploadResult> {
    await fs.mkdir(this.LOCAL_UPLOAD_DIR, { recursive: true });

    const ext = path.extname(file.originalname) || ".webp";
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filePath = path.join(this.LOCAL_UPLOAD_DIR, filename);

    await fs.writeFile(filePath, file.buffer);

    const serverUrl = `http://localhost:${ENV.PORT}`;
    const url = `${serverUrl}/uploads/${filename}`;

    return {
      url,
      originalName: file.originalname,
      format: ext.replace(".", ""),
      bytes: file.size,
    };
  }

  /**
   * Extract Cloudinary publicId from a secure URL
   */
  static extractPublicId(url: string): string | null {
    if (!url || typeof url !== "string") return null;
    if (!url.includes("cloudinary.com")) return null;

    try {
      // Matches everything after /upload/(v<digits>/)? up to the file extension
      const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }

  /**
   * Delete asset by URL (Cloudinary or local disk)
   */
  static async deleteByUrl(url: string): Promise<boolean> {
    if (!url) return false;

    if (url.includes("cloudinary.com")) {
      const publicId = this.extractPublicId(url);
      if (publicId) {
        return this.deleteFile(publicId);
      }
    } else if (url.includes("/uploads/")) {
      try {
        const filename = path.basename(url);
        const filePath = path.join(this.LOCAL_UPLOAD_DIR, filename);
        await fs.unlink(filePath).catch(() => {});
        return true;
      } catch {
        return false;
      }
    }

    return false;
  }

  /**
   * Delete asset by public ID from Cloudinary
   */
  static async deleteFile(publicId: string): Promise<boolean> {
    if (!isCloudinaryConfigured || !publicId) return false;

    try {
      await cloudinary.uploader.destroy(publicId);
      logger.info(`🗑️ Cloudinary asset deleted: ${publicId}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting Cloudinary asset [${publicId}]:`, error);
      return false;
    }
  }
}
