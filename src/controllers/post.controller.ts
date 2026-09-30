import { Request, Response } from "express";
import { Post, Portfolio } from "../models";
import { UploadService } from "../services";
import { AuthRequest } from "../middlewares";
import { asyncHandler, sendSuccess, sendError, slugify, paginate } from "../utils";
import { logger } from "../utils/logger";

export const getPublicPosts = asyncHandler(async (req: Request, res: Response) => {
  const { tag, search, page = 1, limit = 10, slug, userId } = req.query;

  let targetUserId: any = userId ? String(userId) : undefined;
  if (slug) {
    const portfolio = await Portfolio.findOne({ slug: String(slug) });
    if (portfolio) {
      targetUserId = portfolio.userId;
    }
  }

  const filter: Record<string, any> = { isPublished: true };
  if (targetUserId) {
    filter.userId = targetUserId;
  }


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

export const getAllPostsAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    sendError(res, "Unauthorized", 401);
    return;
  }

  const posts = await Post.find({ userId }).sort({ createdAt: -1 });
  sendSuccess(res, posts, "All posts retrieved for admin", 200);
});

export const getPostByIdAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;
  if (!userId) {
    sendError(res, "Unauthorized", 401);
    return;
  }

  const post = await Post.findOne({ _id: id, userId });
  if (!post) {
    sendError(res, "Post not found", 404);
    return;
  }
  sendSuccess(res, post, "Post retrieved successfully", 200);
});

export const createPost = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    sendError(res, "Unauthorized", 401);
    return;
  }

  const data = { ...req.body, userId };

  // Handle direct file upload via multipart/form-data
  if (req.file) {
    const uploadResult = await UploadService.uploadFile(req.file, "posts");
    data.coverImageUrl = uploadResult.url;
    data.coverImagePublicId = uploadResult.publicId;
  }

  if (data.content) {
    const text = data.content.replace(/<[^>]*>/g, " ").trim();
    const wordCount = text ? text.split(/\s+/).length : 0;
    data.readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
  }

  if (!data.slug) {
    let baseSlug = slugify(data.title);
    let candidateSlug = baseSlug;
    let count = 1;
    while (await Post.findOne({ userId, slug: candidateSlug })) {
      candidateSlug = `${baseSlug}-${count++}`;
    }
    data.slug = candidateSlug;
  }

  const post = await Post.create(data);
  sendSuccess(res, post, "Post created successfully", 201);
});

export const updatePost = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;
  if (!userId) {
    sendError(res, "Unauthorized", 401);
    return;
  }

  const data = { ...req.body };

  const existingPost = await Post.findOne({ _id: id, userId });
  if (!existingPost) {
    sendError(res, "Post not found", 404);
    return;
  }

  // Handle cover image removal
  if (data.removeCoverImage === "true" || data.removeCoverImage === true) {
    if (existingPost.coverImagePublicId) {
      UploadService.deleteFile(existingPost.coverImagePublicId).catch((err) =>
        logger.warn(
          `Failed to delete post cover image by publicId [${existingPost.coverImagePublicId}]:`,
          err
        )
      );
    } else if (existingPost.coverImageUrl) {
      UploadService.deleteByUrl(existingPost.coverImageUrl).catch((err) =>
        logger.warn(
          `Failed to delete post cover image from Cloudinary [${existingPost.coverImageUrl}]:`,
          err
        )
      );
    }
    data.coverImageUrl = "";
    data.coverImagePublicId = "";
  }

  // Handle direct file upload via multipart/form-data
  if (req.file) {
    const uploadResult = await UploadService.uploadFile(req.file, "posts");
    data.coverImageUrl = uploadResult.url;
    data.coverImagePublicId = uploadResult.publicId;
  }

  // If coverImageUrl or coverImagePublicId was replaced, delete previous image asset from Cloudinary
  if (
    (data.coverImagePublicId &&
      existingPost.coverImagePublicId &&
      data.coverImagePublicId !== existingPost.coverImagePublicId) ||
    (data.coverImageUrl &&
      existingPost.coverImageUrl &&
      data.coverImageUrl !== existingPost.coverImageUrl)
  ) {
    if (existingPost.coverImagePublicId) {
      UploadService.deleteFile(existingPost.coverImagePublicId).catch((err) =>
        logger.warn(
          `Failed to delete replaced post cover image by publicId [${existingPost.coverImagePublicId}]:`,
          err
        )
      );
    } else if (existingPost.coverImageUrl) {
      UploadService.deleteByUrl(existingPost.coverImageUrl).catch((err) =>
        logger.warn(
          `Failed to delete replaced post cover image from Cloudinary [${existingPost.coverImageUrl}]:`,
          err
        )
      );
    }
  }

  if (data.content) {
    const text = data.content.replace(/<[^>]*>/g, " ").trim();
    const wordCount = text ? text.split(/\s+/).length : 0;
    data.readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
  }

  const post = await Post.findOneAndUpdate({ _id: id, userId }, data, {
    new: true,
    runValidators: true,
  });

  sendSuccess(res, post, "Post updated successfully", 200);
});

export const deletePost = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;
  if (!userId) {
    sendError(res, "Unauthorized", 401);
    return;
  }

  const post = await Post.findOneAndDelete({ _id: id, userId });

  if (!post) {
    sendError(res, "Post not found", 404);
    return;
  }

  // Clean up post cover image from Cloudinary / storage
  if (post.coverImagePublicId) {
    UploadService.deleteFile(post.coverImagePublicId).catch((err) =>
      logger.warn(
        `Failed to delete post cover image by publicId [${post.coverImagePublicId}]:`,
        err
      )
    );
  } else if (post.coverImageUrl) {
    UploadService.deleteByUrl(post.coverImageUrl).catch((err) =>
      logger.warn(
        `Failed to delete post cover image from Cloudinary on delete [${post.coverImageUrl}]:`,
        err
      )
    );
  }

  sendSuccess(res, null, "Post deleted successfully", 200);
});

