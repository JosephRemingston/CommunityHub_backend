// Test file for admin functionality
import { expect, jest, test, describe, beforeEach } from '@jest/globals';

// Mock the admin controller to isolate tests
jest.mock('../controllers/adminController.js', () => ({
  getCampaigns: jest.fn((req, res) => res.status(200).json({ 
    message: "Campaigns fetched successfully",
    data: { campaigns: [] } 
  })),
  getCampaignById: jest.fn((req, res) => res.status(200).json({ 
    message: "Campaign fetched successfully",
    data: { campaign: {} } 
  })),
  approveCampaign: jest.fn((req, res) => res.status(200).json({ 
    message: "Campaign approved successfully",
    data: { campaign: {} } 
  })),
  rejectCampaign: jest.fn((req, res) => res.status(200).json({ 
    message: "Campaign rejected successfully",
    data: { campaign: {} } 
  })),
  processCampaignRefunds: jest.fn((req, res) => res.status(200).json({ 
    message: "Refunds processed successfully",
    data: { refundResults: [] } 
  })),
  processManualRefund: jest.fn((req, res) => res.status(200).json({ 
    message: "Manual refund processed successfully",
    data: { refundId: "test_refund_id" } 
  })),
  getOverviewMetrics: jest.fn((req, res) => res.status(200).json({ 
    message: "Overview metrics fetched successfully",
    data: { totalFundsRaised: 0 } 
  })),
  getTopCampaigns: jest.fn((req, res) => res.status(200).json({ 
    message: "Top campaigns fetched successfully",
    data: { campaigns: [] } 
  })),
  getDailyActivity: jest.fn((req, res) => res.status(200).json({ 
    message: "Daily activity data fetched successfully",
    data: { dailyPledges: [] } 
  })),
}));

// Mock authentication middleware
jest.mock('../middleware/authMiddleware.js', () => ({
  adminAuth: jest.fn((req, res, next) => {
    // Simulate authenticated admin user
    req.user = { _id: 'admin123', userType: 'admin', email: 'admin@test.com' };
    next();
  }),
  isAuthenticated: jest.fn((req, res, next) => next()),
  isAdmin: jest.fn((req, res, next) => next()),
}));

// Import after mocking
import request from 'supertest';
import express from 'express';
import adminRoutes from '../routes/adminRoutes.js';

// Set up Express app for testing
const app = express();
app.use(express.json());
app.use('/api/admin', adminRoutes);

describe('Admin API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Campaign management route tests
  describe('Campaign Management', () => {
    test('GET /api/admin/campaigns should return campaigns list', async () => {
      const res = await request(app).get('/api/admin/campaigns');
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Campaigns fetched successfully');
    });

    test('GET /api/admin/campaigns/:id should return a specific campaign', async () => {
      const res = await request(app).get('/api/admin/campaigns/123');
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Campaign fetched successfully');
    });

    test('PUT /api/admin/campaigns/:id/approve should approve a campaign', async () => {
      const res = await request(app).put('/api/admin/campaigns/123/approve');
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Campaign approved successfully');
    });

    test('PUT /api/admin/campaigns/:id/reject should reject a campaign', async () => {
      const res = await request(app)
        .put('/api/admin/campaigns/123/reject')
        .send({ rejectionReason: 'Content policy violation' });
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Campaign rejected successfully');
    });
  });

  // Refund management route tests
  describe('Refund Management', () => {
    test('POST /api/admin/campaigns/:id/refund should process refunds', async () => {
      const res = await request(app).post('/api/admin/campaigns/123/refund');
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Refunds processed successfully');
    });

    test('POST /api/admin/campaigns/:id/backers/:backerId/refund should process manual refund', async () => {
      const res = await request(app)
        .post('/api/admin/campaigns/123/backers/456/refund')
        .send({ reason: 'Customer request' });
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Manual refund processed successfully');
    });
  });

  // Metrics route tests
  describe('Admin Metrics', () => {
    test('GET /api/admin/metrics/overview should return platform metrics', async () => {
      const res = await request(app).get('/api/admin/metrics/overview');
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Overview metrics fetched successfully');
    });

    test('GET /api/admin/metrics/top-campaigns should return top campaigns', async () => {
      const res = await request(app).get('/api/admin/metrics/top-campaigns');
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Top campaigns fetched successfully');
    });

    test('GET /api/admin/metrics/daily-activity should return daily activity data', async () => {
      const res = await request(app).get('/api/admin/metrics/daily-activity');
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Daily activity data fetched successfully');
    });
  });
});