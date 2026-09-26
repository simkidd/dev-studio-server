import { connectDB, disconnectDB } from "../config/db";
import { User } from "../models";
import { AuthService } from "../services";
import { logger } from "../utils/logger";

async function seedAdmin() {
  try {
    logger.info("🌱 Seeding Superadmin account...");
    await connectDB();

    const email = process.env.ADMIN_EMAIL || "admin@portfolio.dev";
    const rawPassword = process.env.ADMIN_PASSWORD || "Admin@2026!";
    const hashedPassword = await AuthService.hashPassword(rawPassword);

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      existingAdmin.password = hashedPassword;
      existingAdmin.role = "superadmin";
      await existingAdmin.save();
      logger.info(`🔄 Existing admin updated: ${email}`);
    } else {
      await User.create({
        email,
        password: hashedPassword,
        role: "superadmin",
      });
      logger.info(`✅ Superadmin created: ${email}`);
    }

    logger.info("==========================================");
    logger.info("🔑 ADMIN CREDENTIALS:");
    logger.info(`📧 Email:    ${email}`);
    logger.info(`🔒 Password: ${rawPassword}`);
    logger.info("==========================================");

    await disconnectDB();
    logger.info("✨ Admin seeding completed successfully.");
    process.exit(0);
  } catch (error) {
    logger.error("❌ Admin seeding failed:", error);
    await disconnectDB();
    process.exit(1);
  }
}

seedAdmin();
