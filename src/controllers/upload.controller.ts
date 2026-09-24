import { Request, Response } from "express";
import { UploadService } from "../services";
import { asyncHandler, sendSuccess, sendError } from "../utils";

export const uploadSingleFile = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.file) {
      sendError(res, "No file provided for upload", 400);
      return;
    }

    const folder = (req.query.folder as string) || "dev-portfolio";
    const result = await UploadService.uploadFile(req.file, folder);

    sendSuccess(res, result, "File uploaded successfully", 201);
  },
);

export const uploadMultipleFiles = asyncHandler(
  async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      sendError(res, "No files provided for upload", 400);
      return;
    }

    const folder = (req.query.folder as string) || "dev-portfolio/gallery";

    const uploadPromises = files.map((file) =>
      UploadService.uploadFile(file, folder),
    );
    const results = await Promise.all(uploadPromises);

    sendSuccess(res, results, "Files uploaded successfully", 201);
  },
);

export const deleteUploadedFile = asyncHandler(
  async (req: Request, res: Response) => {
    const { publicId, url } = req.body;

    if (!publicId && !url) {
      sendError(res, "publicId or url is required to delete file", 400);
      return;
    }

    if (url) {
      await UploadService.deleteByUrl(url);
      sendSuccess(res, null, "File deleted successfully", 200);
      return;
    }

    const success = await UploadService.deleteFile(publicId);
    if (!success) {
      sendError(res, "Failed to delete file from cloud storage", 500);
      return;
    }

    sendSuccess(res, null, "File deleted successfully", 200);
  },
);
