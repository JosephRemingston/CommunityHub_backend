import mongoose from "mongoose";

// Define campaign status enumeration
const campaignStatusEnum = ["pending", "approved", "rejected", "live", "ended", "cancelled"];

const campaignSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxLength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    shortDescription: {
      type: String,
      required: true,
      trim: true,
      maxLength: 250,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    goal: {
      type: Number,
      required: true,
      min: 1,
    },
    amountRaised: {
      type: Number,
      default: 0,
    },
    backerCount: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    images: [
      {
        url: String,
        alt: String,
      },
    ],
    coverImage: {
      url: String,
      alt: String,
    },
    videoUrl: {
      type: String,
      trim: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: campaignStatusEnum,
      default: "pending",
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    rewardTiers: [
      {
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        amount: {
          type: Number,
          required: true,
          min: 1,
        },
        maxBackers: {
          type: Number,
          default: null,
        },
        currentBackers: {
          type: Number,
          default: 0,
        },
        estimatedDelivery: {
          type: Date,
        },
      },
    ],
    backers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
        amount: {
          type: Number,
          required: true,
        },
        rewardTier: {
          type: Number, // Index of the reward tier selected
        },
        pledgeDate: {
          type: Date,
          default: Date.now,
        },
        refunded: {
          type: Boolean,
          default: false,
        },
      },
    ],
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    approvalDate: {
      type: Date,
    },
    updates: [
      {
        title: {
          type: String,
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Daily stats for campaign performance tracking
    dailyStats: [
      {
        date: {
          type: Date,
        },
        viewCount: {
          type: Number,
          default: 0,
        },
        backersAdded: {
          type: Number,
          default: 0,
        },
        amountRaised: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  { timestamps: true }
);

// Virtual for calculating progress percentage
campaignSchema.virtual("progressPercentage").get(function () {
  return ((this.amountRaised / this.goal) * 100).toFixed(2);
});

// Virtual for calculating days left
campaignSchema.virtual("daysLeft").get(function () {
  const now = new Date();
  const endDate = new Date(this.endDate);
  const timeDiff = endDate.getTime() - now.getTime();
  const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
  return daysLeft > 0 ? daysLeft : 0;
});

// Method to check if campaign is successful
campaignSchema.methods.isSuccessful = function () {
  return this.amountRaised >= this.goal;
};

// Define indexes for better query performance
campaignSchema.index({ status: 1 });
campaignSchema.index({ category: 1 });
campaignSchema.index({ creator: 1 });
campaignSchema.index({ endDate: 1 });
campaignSchema.index({ "backers.user": 1 });

const Campaign = mongoose.model("campaign", campaignSchema);
export default Campaign;