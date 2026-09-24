import { Router } from "express";
import authRoutes from "./auth.routes";
import profileRoutes from "./profile.routes";
import projectRoutes from "./project.routes";
import experienceRoutes from "./experience.routes";
import skillRoutes from "./skill.routes";
import postRoutes from "./post.routes";
import messageRoutes from "./message.routes";
import testimonialRoutes from "./testimonial.routes";
import dashboardRoutes from "./dashboard.routes";
import uploadRoutes from "./upload.routes";

const apiRouter = Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use("/profile", profileRoutes);
apiRouter.use("/projects", projectRoutes);
apiRouter.use("/experiences", experienceRoutes);
apiRouter.use("/skills", skillRoutes);
apiRouter.use("/posts", postRoutes);
apiRouter.use("/messages", messageRoutes);
apiRouter.use("/testimonials", testimonialRoutes);
apiRouter.use("/dashboard", dashboardRoutes);
apiRouter.use("/upload", uploadRoutes);

export { apiRouter };
