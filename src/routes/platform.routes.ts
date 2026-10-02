import { Router } from "express";
import {
  getPlatformStats,
  getPlatformUsers,
  updatePlatformUserRole,
  deletePlatformUser,
  impersonateUser,
  getReservedSlugs,
  addReservedSlug,
  deleteReservedSlug,
  getPlatformTemplates,
  updatePlatformTemplate,
  getPlatformAnnouncements,
  createPlatformAnnouncement,
  updatePlatformAnnouncement,
  deletePlatformAnnouncement,
  getActivePublicAnnouncements,
  getAuditLogs,
} from "../controllers/platform.controller";
import { authenticate, requireSuperAdmin } from "../middlewares";

const router = Router();

// Public endpoint for active broadcast announcements (accessible by all clients)
router.get("/announcements/active", getActivePublicAnnouncements);

// Protected Superadmin endpoints
router.use(authenticate);
router.use(requireSuperAdmin);

// Analytics & Dashboard
router.get("/stats", getPlatformStats);

// Developer Fleet & Impersonation
router.get("/users", getPlatformUsers);
router.patch("/users/:id/role", updatePlatformUserRole);
router.delete("/users/:id", deletePlatformUser);
router.post("/users/:id/impersonate", impersonateUser);

// Reserved Slugs & Keyword Blacklist
router.get("/slugs", getReservedSlugs);
router.post("/slugs", addReservedSlug);
router.delete("/slugs/:id", deleteReservedSlug);

// Global Templates Engine
router.get("/templates", getPlatformTemplates);
router.patch("/templates/:templateId", updatePlatformTemplate);

// Announcements & Broadcasts
router.get("/announcements", getPlatformAnnouncements);
router.post("/announcements", createPlatformAnnouncement);
router.patch("/announcements/:id", updatePlatformAnnouncement);
router.delete("/announcements/:id", deletePlatformAnnouncement);

// Security & Audit Logs
router.get("/logs", getAuditLogs);

export default router;
