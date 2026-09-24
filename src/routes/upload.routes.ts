import { Router } from "express";
import {
  uploadSingleFile,
  uploadMultipleFiles,
  deleteUploadedFile,
} from "../controllers";
import { authenticate, upload } from "../middlewares";

const router = Router();

// Protected admin routes
router.post("/single", authenticate, upload.single("file"), uploadSingleFile);
router.post(
  "/multiple",
  authenticate,
  upload.array("files", 10),
  uploadMultipleFiles,
);
router.delete("/", authenticate, deleteUploadedFile);

export default router;
