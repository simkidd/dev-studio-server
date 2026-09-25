import { Request, Response } from "express";
import { Post } from "../models";
import { asyncHandler, sendSuccess, sendError, slugify, paginate } from "../utils";

export const getPublicPosts = asyncHandler(async (req: Request, res: Response) => {
  const { tag, search, page = 1, limit = 10 } = req.query;

  const filter: Record<string, any> = { isPublished: true };

  if (tag) {
    filter.tags = tag;
  }

  if (search) {
    filter.$or = [
      { title: { $regex: String(search), $options: "i" } },
      { excerpt: { $regex: String(search), $options: "i" } },
    ];
  }

  const result = await paginate(Post, filter, {
    page: page as string,
    limit: limit as string,
    sort: { publishedAt: -1, createdAt: -1 },
  });

  sendSuccess(res, result.docs, "Posts retrieved successfully", 200, {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: result.pages,
  });
});

export const getPostBySlug = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;

  const post = await Post.findOne({ slug, isPublished: true });
  if (!post) {
    sendError(res, "Post not found", 404);
    return;
  }

  post.viewsCount = (post.viewsCount || 0) + 1;
  await post.save();

  sendSuccess(res, post, "Post retrieved successfully", 200);
});

export const likePost = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;

  const post = await Post.findOne({ slug, isPublished: true });
  if (!post) {
    sendError(res, "Post not found", 404);
    return;
  }

  post.likesCount = (post.likesCount || 0) + 1;
  await post.save();

  sendSuccess(res, { likesCount: post.likesCount }, "Post liked successfully", 200);
});

export const getAllPostsAdmin = asyncHandler(async (_req: Request, res: Response) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  sendSuccess(res, posts, "All posts retrieved for admin", 200);
});

export const getPostByIdAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const post = await Post.findById(id);
  if (!post) {
    sendError(res, "Post not found", 404);
    return;
  }
  sendSuccess(res, post, "Post retrieved successfully", 200);
});

export const createPost = asyncHandler(async (req: Request, res: Response) => {
  const data = { ...req.body };

  if (!data.slug) {
    let baseSlug = slugify(data.title);
    let candidateSlug = baseSlug;
    let count = 1;
    while (await Post.findOne({ slug: candidateSlug })) {
      candidateSlug = `${baseSlug}-${count++}`;
    }
    data.slug = candidateSlug;
  }

  const post = await Post.create(data);
  sendSuccess(res, post, "Post created successfully", 201);
});

export const updatePost = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const post = await Post.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!post) {
    sendError(res, "Post not found", 404);
    return;
  }

  sendSuccess(res, post, "Post updated successfully", 200);
});

export const deletePost = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const post = await Post.findByIdAndDelete(id);

  if (!post) {
    sendError(res, "Post not found", 404);
    return;
  }

  sendSuccess(res, null, "Post deleted successfully", 200);
});
