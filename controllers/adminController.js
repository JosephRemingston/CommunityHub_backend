import Campaign from "../models/campaignModel.js";
import User from "../models/userModels.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { makeLog } from "../utils/logentries.js";
import { processCampaignRefund } from "../utils/paymentUtils.js";

// ===== Campaign Approval Functions =====

/**
 * Get all campaigns with optional filtering
 * @route GET /api/admin/campaigns
 * @access Admin
 */
export const getCampaigns = asyncHandler(async (req, res) => {
  const { status, category, page = 1, limit = 10 } = req.query;
  
  // Build query
  const query = {};
  if (status) query.status = status;
  if (category) query.category = category;
  
  // Setup pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Get campaigns
  const campaigns = await Campaign.find(query)
    .populate("creator", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));
  
  // Get total count for pagination
  const total = await Campaign.countDocuments(query);
  
  ApiResponse.success(res, "Campaigns fetched successfully", {
    campaigns,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    }
  });
});

/**
 * Get a specific campaign by ID
 * @route GET /api/admin/campaigns/:id
 * @access Admin
 */
export const getCampaignById = asyncHandler(async (req, res) => {
  const campaign = await Campaign.findById(req.params.id)
    .populate("creator", "name email")
    .populate("backers.user", "name email");
  
  if (!campaign) {
    throw ApiError.notFound("Campaign not found");
  }
  
  ApiResponse.success(res, "Campaign fetched successfully", { campaign });
});

/**
 * Approve a campaign
 * @route PUT /api/admin/campaigns/:id/approve
 * @access Admin
 */
export const approveCampaign = asyncHandler(async (req, res) => {
  const campaign = await Campaign.findById(req.params.id);
  
  if (!campaign) {
    throw ApiError.notFound("Campaign not found");
  }
  
  if (campaign.status !== "pending") {
    throw ApiError.badRequest(`Campaign is already ${campaign.status}`);
  }
  
  // Update campaign status
  campaign.status = "approved";
  campaign.approvedBy = req.user._id;
  campaign.approvalDate = Date.now();
  
  await campaign.save();
  
  // Log the action
  await makeLog(`Campaign approved: ${campaign._id} by admin ${req.user.email}`, "AdminEvent", process.env.adminLogs);
  
  // Notify the creator (implement notification system later)
  // TODO: Send notification to creator
  
  ApiResponse.success(res, "Campaign approved successfully", { campaign });
});

/**
 * Reject a campaign with reason
 * @route PUT /api/admin/campaigns/:id/reject
 * @access Admin
 */
export const rejectCampaign = asyncHandler(async (req, res) => {
  const { rejectionReason } = req.body;
  
  if (!rejectionReason) {
    throw ApiError.badRequest("Rejection reason is required");
  }
  
  const campaign = await Campaign.findById(req.params.id);
  
  if (!campaign) {
    throw ApiError.notFound("Campaign not found");
  }
  
  if (campaign.status !== "pending") {
    throw ApiError.badRequest(`Campaign is already ${campaign.status}`);
  }
  
  // Update campaign status
  campaign.status = "rejected";
  campaign.rejectionReason = rejectionReason;
  campaign.approvedBy = req.user._id;
  campaign.approvalDate = Date.now();
  
  await campaign.save();
  
  // Log the action
  await makeLog(`Campaign rejected: ${campaign._id} by admin ${req.user.email}, reason: ${rejectionReason}`, 
    "AdminEvent", process.env.adminLogs);
  
  // Notify the creator (implement notification system later)
  // TODO: Send notification to creator
  
  ApiResponse.success(res, "Campaign rejected successfully", { campaign });
});

// ===== Refund Management Functions =====

/**
 * Process refunds for a failed campaign
 * @route POST /api/admin/campaigns/:id/refund
 * @access Admin
 */
export const processCampaignRefunds = asyncHandler(async (req, res) => {
  const campaign = await Campaign.findById(req.params.id)
    .populate("backers.user", "name email");
  
  if (!campaign) {
    throw ApiError.notFound("Campaign not found");
  }
  
  // Ensure campaign is ended and not successful
  if (campaign.status !== "ended") {
    throw ApiError.badRequest("Only ended campaigns can be refunded");
  }
  
  if (campaign.isSuccessful()) {
    throw ApiError.badRequest("Successful campaigns don't require refunds");
  }
  
  // Process refunds for each backer
  const refundResults = [];
  let failedRefunds = 0;
  
  for (const backer of campaign.backers) {
    // Skip already refunded backers
    if (backer.refunded) continue;
    
    try {
      const refundResult = await processCampaignRefund(backer, campaign._id);
      
      // Update backer refund status
      backer.refunded = true;
      refundResults.push({
        user: backer.user._id,
        name: backer.user.name,
        email: backer.user.email,
        amount: backer.amount,
        status: "success",
        refundId: refundResult.refundId
      });
      
      // Log the refund
      await makeLog(`Refund processed for backer ${backer.user.email} in campaign ${campaign._id}, amount: ${backer.amount}`, 
        "RefundEvent", process.env.paymentLogs);
        
    } catch (error) {
      failedRefunds++;
      refundResults.push({
        user: backer.user._id,
        name: backer.user.name,
        email: backer.user.email,
        amount: backer.amount,
        status: "failed",
        error: error.message
      });
      
      // Log the failed refund
      await makeLog(`Refund failed for backer ${backer.user.email} in campaign ${campaign._id}, amount: ${backer.amount}, error: ${error.message}`, 
        "RefundError", process.env.paymentLogs);
    }
  }
  
  // Save updated campaign with refund statuses
  await campaign.save();
  
  ApiResponse.success(res, `Refunds processed. ${refundResults.length - failedRefunds} successful, ${failedRefunds} failed.`, 
    { refundResults });
});

/**
 * Process a manual refund for a specific pledge
 * @route POST /api/admin/campaigns/:id/backers/:backerId/refund
 * @access Admin
 */
export const processManualRefund = asyncHandler(async (req, res) => {
  const { id, backerId } = req.params;
  const { reason } = req.body;
  
  const campaign = await Campaign.findById(id);
  
  if (!campaign) {
    throw ApiError.notFound("Campaign not found");
  }
  
  // Find the backer
  const backer = campaign.backers.id(backerId);
  
  if (!backer) {
    throw ApiError.notFound("Backer not found in this campaign");
  }
  
  // Check if already refunded
  if (backer.refunded) {
    throw ApiError.badRequest("This pledge has already been refunded");
  }
  
  try {
    // Get user details
    const user = await User.findById(backer.user);
    
    // Process the refund
    const refundResult = await processCampaignRefund(backer, campaign._id);
    
    // Update backer status
    backer.refunded = true;
    await campaign.save();
    
    // Log the manual refund
    await makeLog(`Manual refund processed for backer ${user.email} in campaign ${campaign._id}, amount: ${backer.amount}, reason: ${reason}`, 
      "ManualRefundEvent", process.env.paymentLogs);
    
    ApiResponse.success(res, "Manual refund processed successfully", {
      refundId: refundResult.refundId,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      },
      amount: backer.amount,
      pledgeDate: backer.pledgeDate
    });
    
  } catch (error) {
    // Log the error
    await makeLog(`Manual refund failed for backer ID ${backerId} in campaign ${campaign._id}, error: ${error.message}`, 
      "ManualRefundError", process.env.paymentLogs);
    
    throw new ApiError(500, `Refund processing failed: ${error.message}`);
  }
});

// ===== Admin Metrics Functions =====

/**
 * Get overall platform metrics
 * @route GET /api/admin/metrics/overview
 * @access Admin
 */
export const getOverviewMetrics = asyncHandler(async (req, res) => {
  // Total funds raised across all campaigns
  const totalFundsAggregation = await Campaign.aggregate([
    { $match: { status: { $in: ["live", "ended"] } } },
    { $group: { _id: null, total: { $sum: "$amountRaised" } } }
  ]);
  
  const totalFundsRaised = totalFundsAggregation.length > 0 ? totalFundsAggregation[0].total : 0;
  
  // Total backers (unique users)
  const backerCountAggregation = await Campaign.aggregate([
    { $match: { status: { $in: ["live", "ended"] } } },
    { $group: { _id: null, total: { $sum: "$backerCount" } } }
  ]);
  
  const totalBackers = backerCountAggregation.length > 0 ? backerCountAggregation[0].total : 0;
  
  // Campaign counts by status
  const campaignsByStatus = await Campaign.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
    { $project: { status: "$_id", count: 1, _id: 0 } }
  ]);
  
  // User counts by type
  const usersByType = await User.aggregate([
    { $group: { _id: "$userType", count: { $sum: 1 } } },
    { $project: { type: "$_id", count: 1, _id: 0 } }
  ]);
  
  ApiResponse.success(res, "Overview metrics fetched successfully", {
    totalFundsRaised,
    totalBackers,
    campaignsByStatus,
    usersByType,
    timestamp: new Date()
  });
});

/**
 * Get top performing campaigns
 * @route GET /api/admin/metrics/top-campaigns
 * @access Admin
 */
export const getTopCampaigns = asyncHandler(async (req, res) => {
  const { metric = "amountRaised", limit = 10 } = req.query;
  
  const validMetrics = ["amountRaised", "backerCount", "progressPercentage"];
  
  if (!validMetrics.includes(metric)) {
    throw ApiError.badRequest("Invalid metric specified. Use amountRaised, backerCount, or progressPercentage");
  }
  
  let sortCriteria = {};
  sortCriteria[metric] = -1; // Descending order
  
  const campaigns = await Campaign.find({
    status: { $in: ["live", "ended"] }
  })
  .sort(sortCriteria)
  .limit(parseInt(limit))
  .populate("creator", "name email")
  .select("title shortDescription amountRaised goal backerCount category coverImage startDate endDate");
  
  ApiResponse.success(res, `Top campaigns by ${metric} fetched successfully`, { campaigns });
});

/**
 * Get daily activity data for charts
 * @route GET /api/admin/metrics/daily-activity
 * @access Admin
 */
export const getDailyActivity = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  
  // Calculate start date (X days ago)
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));
  startDate.setHours(0, 0, 0, 0);
  
  // Aggregate daily pledges
  const dailyPledges = await Campaign.aggregate([
    { 
      $unwind: "$backers" 
    },
    {
      $match: {
        "backers.pledgeDate": { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$backers.pledgeDate" }
        },
        totalAmount: { $sum: "$backers.amount" },
        count: { $sum: 1 }
      }
    },
    { 
      $sort: { _id: 1 } 
    },
    {
      $project: {
        date: "$_id",
        totalAmount: 1,
        count: 1,
        _id: 0
      }
    }
  ]);
  
  // Aggregate new campaigns
  const newCampaigns = await Campaign.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
        },
        count: { $sum: 1 }
      }
    },
    { 
      $sort: { _id: 1 } 
    },
    {
      $project: {
        date: "$_id",
        count: 1,
        _id: 0
      }
    }
  ]);
  
  // Aggregate new user signups
  const newUsers = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
        },
        count: { $sum: 1 }
      }
    },
    { 
      $sort: { _id: 1 } 
    },
    {
      $project: {
        date: "$_id",
        count: 1,
        _id: 0
      }
    }
  ]);
  
  // Fill in missing dates with zero values for all three datasets
  const activityData = {
    dailyPledges: fillMissingDates(dailyPledges, days),
    newCampaigns: fillMissingDates(newCampaigns, days),
    newUsers: fillMissingDates(newUsers, days),
    timeRange: {
      startDate,
      endDate: new Date(),
      days: parseInt(days)
    }
  };
  
  ApiResponse.success(res, "Daily activity data fetched successfully", activityData);
});

// Helper function to fill in missing dates with zero values
function fillMissingDates(data, daysCount) {
  const result = [...data];
  const dateMap = {};
  
  // Create map of existing dates
  data.forEach(item => {
    dateMap[item.date] = true;
  });
  
  // Fill missing dates
  for (let i = 0; i < daysCount; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    
    if (!dateMap[dateString]) {
      result.push({
        date: dateString,
        count: 0,
        totalAmount: 0
      });
    }
  }
  
  // Sort by date
  return result.sort((a, b) => {
    return new Date(a.date) - new Date(b.date);
  });
}