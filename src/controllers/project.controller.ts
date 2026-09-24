import { Request, Response } from "express";
import { Project } from "../models";
import { UploadService } from "../services";
import { asyncHandler, sendSuccess, sendError, slugify, paginate, logger } from "../utils";

export const getPublicProjects = asyncHandler(async (req: Request, res: Response) => {
  const { category, featured, search, page = 1, limit = 20 } = req.query;

  const filter: Record<string, any> = { isPublished: true };

  if (category && category !== "All") {
    filter.category = category;
  }

  if (featured === "true") {
    filter.isFeatured = true;
  }

  if (search) {
    filter.$or = [
      { title: { $regex: String(search), $options: "i" } },
      { summary: { $regex: String(search), $options: "i" } },
      { technologies: { $regex: String(search), $options: "i" } },
    ];
  }

  const result = await paginate(Project, filter, {
    page: page as string,
    limit: limit as string,
    sort: { order: 1, createdAt: -1 },
  });

  sendSuccess(
    res,
    result.docs,
    "Projects retrieved successfully",
    200,
    {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.pages,
    },
  );
});

export const getProjectBySlug = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;

  const project = await Project.findOne({ slug, isPublished: true });
  if (!project) {
    sendError(res, "Project not found", 404);
    return;
  }

  sendSuccess(res, project, "Project retrieved successfully", 200);
});

export const getProjectById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const project = await Project.findById(id);
  if (!project) {
    sendError(res, "Project not found", 404);
    return;
  }

  sendSuccess(res, project, "Project retrieved successfully", 200);
});

export const getAllProjectsAdmin = asyncHandler(async (_req: Request, res: Response) => {
  const projects = await Project.find().sort({ order: 1, createdAt: -1 });
  sendSuccess(res, projects, "All projects retrieved for admin", 200);
});

export const createProject = asyncHandler(async (req: Request, res: Response) => {
  const data = { ...req.body };

  if (req.file) {
    const uploadResult = await UploadService.uploadFile(req.file, "projects");
    data.thumbnailUrl = uploadResult.url;
    data.thumbnailPublicId = uploadResult.publicId;
  }

  if (!data.thumbnailUrl) {
    sendError(res, "Cover image file or thumbnailUrl is required", 400);
    return;
  }

  if (!data.slug) {
    let baseSlug = slugify(data.title);
    let candidateSlug = baseSlug;
    let count = 1;
    while (await Project.findOne({ slug: candidateSlug })) {
      candidateSlug = `${baseSlug}-${count++}`;
    }
    data.slug = candidateSlug;
  }

  const project = await Project.create(data);
  sendSuccess(res, project, "Project created successfully", 201);
});

export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = { ...req.body };

  const existingProject = await Project.findById(id);
  if (!existingProject) {
    sendError(res, "Project not found", 404);
    return;
  }

  // If a new image file was uploaded via multipart/form-data
  if (req.file) {
    const uploadResult = await UploadService.uploadFile(req.file, "projects");
    data.thumbnailUrl = uploadResult.url;
    data.thumbnailPublicId = uploadResult.publicId;
  }

  // If galleryImages was updated, delete any removed images from Cloudinary storage
  if (data.galleryImages && Array.isArray(data.galleryImages)) {
    const oldImages = existingProject.galleryImages || [];
    const newImages = data.galleryImages;
    const newUrls = newImages.map((img: any) =>
      typeof img === "string" ? img : img.url
    );

    const removedImages = oldImages.filter(
      (oldImg) => !newUrls.includes(oldImg.url)
    );

    for (const item of removedImages) {
      if (item.publicId) {
        UploadService.deleteFile(item.publicId).catch((err) =>
          logger.warn(
            `Failed to delete removed gallery image by publicId [${item.publicId}]:`,
            err
          )
        );
      } else if (item.url) {
        UploadService.deleteByUrl(item.url).catch((err) =>
          logger.warn(
            `Failed to delete removed gallery image by URL [${item.url}]:`,
            err
          )
        );
      }
    }
  }

  // If thumbnailUrl or thumbnailPublicId was replaced, clean up the previous thumbnail asset
  if (
    (data.thumbnailPublicId &&
      existingProject.thumbnailPublicId &&
      data.thumbnailPublicId !== existingProject.thumbnailPublicId) ||
    (data.thumbnailUrl &&
      existingProject.thumbnailUrl &&
      data.thumbnailUrl !== existingProject.thumbnailUrl)
  ) {
    if (existingProject.thumbnailPublicId) {
      UploadService.deleteFile(existingProject.thumbnailPublicId).catch((err) =>
        logger.warn(
          `Failed to delete replaced thumbnail by publicId [${existingProject.thumbnailPublicId}]:`,
          err
        )
      );
    } else if (existingProject.thumbnailUrl) {
      UploadService.deleteByUrl(existingProject.thumbnailUrl).catch((err) =>
        logger.warn(
          `Failed to delete replaced thumbnail by URL [${existingProject.thumbnailUrl}]:`,
          err
        )
      );
    }
  }

  const project = await Project.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  sendSuccess(res, project, "Project updated successfully", 200);
});

export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const project = await Project.findByIdAndDelete(id);

  if (!project) {
    sendError(res, "Project not found", 404);
    return;
  }

  // Delete project thumbnail and all gallery images from Cloudinary
  if (project.thumbnailPublicId) {
    UploadService.deleteFile(project.thumbnailPublicId).catch((err) =>
      logger.warn(
        `Failed to delete thumbnail by publicId [${project.thumbnailPublicId}]:`,
        err
      )
    );
  } else if (project.thumbnailUrl) {
    UploadService.deleteByUrl(project.thumbnailUrl).catch((err) =>
      logger.warn(`Failed to delete thumbnail for project [${id}]:`, err)
    );
  }

  if (project.galleryImages && project.galleryImages.length > 0) {
    for (const item of project.galleryImages) {
      if (item.publicId) {
        UploadService.deleteFile(item.publicId).catch((err) =>
          logger.warn(
            `Failed to delete gallery image by publicId [${item.publicId}]:`,
            err
          )
        );
      } else if (item.url) {
        UploadService.deleteByUrl(item.url).catch((err) =>
          logger.warn(
            `Failed to delete gallery image by URL [${item.url}]:`,
            err
          )
        );
      }
    }
  }

  sendSuccess(res, null, "Project deleted successfully", 200);
});

export const toggleFeatured = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const project = await Project.findById(id);

  if (!project) {
    sendError(res, "Project not found", 404);
    return;
  }

  project.isFeatured = !project.isFeatured;
  await project.save();

  sendSuccess(
    res,
    project,
    `Project marked as ${project.isFeatured ? "featured" : "standard"}`,
    200,
  );
});

export const togglePublished = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const project = await Project.findById(id);

  if (!project) {
    sendError(res, "Project not found", 404);
    return;
  }

  project.isPublished = !project.isPublished;
  if (project.isPublished && !project.publishedAt) {
    project.publishedAt = new Date();
  }
  await project.save();

  sendSuccess(
    res,
    project,
    `Project marked as ${project.isPublished ? "published" : "draft"}`,
    200,
  );
});

export const deleteGalleryImage = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { publicId } = req.body;

  if (!publicId) {
    sendError(res, "publicId is required to delete gallery image", 400);
    return;
  }

  const project = await Project.findById(id);
  if (!project) {
    sendError(res, "Project not found", 404);
    return;
  }

  // Remove the image from project gallery by publicId
  project.galleryImages = (project.galleryImages || []).filter(
    (img) => img.publicId !== publicId
  );

  await project.save();

  // Purge the asset from Cloudinary
  UploadService.deleteFile(publicId).catch((err) =>
    logger.warn(`Failed to delete gallery image [${publicId}]:`, err)
  );

  sendSuccess(res, project, "Gallery image removed successfully", 200);
});




export const reorderProjects = asyncHandler(async (req: Request, res: Response) => {
  const { orders } = req.body as { orders: { id: string; order: number }[] };

  if (!Array.isArray(orders)) {
    sendError(res, "Invalid reorder payload", 400);
    return;
  }

  const bulkOps = orders.map((item) => ({
    updateOne: {
      filter: { _id: item.id },
      update: { $set: { order: item.order } },
    },
  }));

  await Project.bulkWrite(bulkOps);
  sendSuccess(res, null, "Projects reordered successfully", 200);
});
