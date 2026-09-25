import { Router } from "express";
import {
  getPublicPosts,
  getPostBySlug,
  likePost,
  getAllPostsAdmin,
  getPostByIdAdmin,
  createPost,
  updatePost,
  deletePost,
} from "../controllers";
import { authenticate, validateRequest } from "../middlewares";
import { createPostSchema, updatePostSchema } from "../validations";

const router = Router();

// Public routes
router.get("/", getPublicPosts);
router.get("/slug/:slug", getPostBySlug);
router.post("/slug/:slug/like", likePost);

// Protected admin routes
router.get("/admin/all", authenticate, getAllPostsAdmin);
router.get("/admin/:id", authenticate, getPostByIdAdmin);
router.post("/", authenticate, validateRequest(createPostSchema), createPost);
router.put("/:id", authenticate, validateRequest(updatePostSchema), updatePost);
router.delete("/:id", authenticate, deletePost);

export default router;
