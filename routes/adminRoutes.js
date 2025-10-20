import express from "express";
import { 
  getCampaigns,
  getCampaignById,
  approveCampaign,
  rejectCampaign,
  processCampaignRefunds,
  processManualRefund,
  getOverviewMetrics,
  getTopCampaigns,
  getDailyActivity
} from "../controllers/adminController.js";

import { adminAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply admin authentication middleware to all routes
router.use(adminAuth);

// Campaign management routes
router.get("/campaigns", getCampaigns);
router.get("/campaigns/:id", getCampaignById);
router.put("/campaigns/:id/approve", approveCampaign);
router.put("/campaigns/:id/reject", rejectCampaign);

// Refund management routes
router.post("/campaigns/:id/refund", processCampaignRefunds);
router.post("/campaigns/:id/backers/:backerId/refund", processManualRefund);

// Metrics routes
router.get("/metrics/overview", getOverviewMetrics);
router.get("/metrics/top-campaigns", getTopCampaigns);
router.get("/metrics/daily-activity", getDailyActivity);

export default router;