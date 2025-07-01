const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['logistics', 'shipping', 'manufacturing', 'retail', 'enterprise'],
    default: 'logistics'
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'trial', 'expired'],
    default: 'trial'
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'professional', 'enterprise'],
      default: 'free'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: Date,
    features: {
      maxUsers: { type: Number, default: 5 },
      maxShipments: { type: Number, default: 100 },
      realTimeTracking: { type: Boolean, default: true },
      analytics: { type: Boolean, default: false },
      apiAccess: { type: Boolean, default: false },
      customBranding: { type: Boolean, default: false },
      advancedReporting: { type: Boolean, default: false },
      iotIntegration: { type: Boolean, default: false },
      aiOptimization: { type: Boolean, default: false }
    },
    billing: {
      interval: {
        type: String,
        enum: ['monthly', 'yearly'],
        default: 'monthly'
      },
      amount: { type: Number, default: 0 },
      currency: { type: String, default: 'USD' },
      nextBillingDate: Date,
      paymentMethod: String,
      billingAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
      }
    }
  },
  contact: {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    phone: String,
    website: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    }
  },
  settings: {
    timezone: {
      type: String,
      default: 'UTC'
    },
    dateFormat: {
      type: String,
      default: 'MM/DD/YYYY'
    },
    currency: {
      type: String,
      default: 'USD'
    },
    language: {
      type: String,
      default: 'en'
    },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    branding: {
      logo: String,
      primaryColor: { type: String, default: '#1976d2' },
      secondaryColor: { type: String, default: '#dc004e' },
      customDomain: String
    },
    security: {
      twoFactorRequired: { type: Boolean, default: false },
      passwordPolicy: {
        minLength: { type: Number, default: 8 },
        requireUppercase: { type: Boolean, default: true },
        requireNumbers: { type: Boolean, default: true },
        requireSymbols: { type: Boolean, default: false }
      },
      sessionTimeout: { type: Number, default: 3600 }, // seconds
      ipWhitelist: [String],
      allowedDomains: [String]
    },
    integrations: {
      googleMaps: {
        enabled: { type: Boolean, default: false },
        apiKey: String
      },
      email: {
        provider: String,
        settings: mongoose.Schema.Types.Mixed
      },
      sms: {
        provider: String,
        settings: mongoose.Schema.Types.Mixed
      },
      webhooks: [{
        name: String,
        url: String,
        events: [String],
        secret: String,
        active: { type: Boolean, default: true }
      }]
    }
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  stats: {
    totalUsers: { type: Number, default: 0 },
    activeUsers: { type: Number, default: 0 },
    totalShipments: { type: Number, default: 0 },
    activeShipments: { type: Number, default: 0 },
    storageUsed: { type: Number, default: 0 }, // in bytes
    apiCallsThisMonth: { type: Number, default: 0 },
    lastActivity: Date
  },
  limits: {
    users: { type: Number, default: 5 },
    shipments: { type: Number, default: 100 },
    storage: { type: Number, default: 1073741824 }, // 1GB in bytes
    apiCalls: { type: Number, default: 1000 }, // per month
    webhooks: { type: Number, default: 5 }
  },
  metadata: {
    industry: String,
    companySize: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-1000', '1000+']
    },
    source: String, // how they found us
    notes: String,
    tags: [String]
  }
}, {
  timestamps: true,
  collection: 'organizations'
});

// Indexes
organizationSchema.index({ slug: 1 }, { unique: true });
organizationSchema.index({ 'contact.email': 1 });
organizationSchema.index({ status: 1 });
organizationSchema.index({ 'subscription.plan': 1 });
organizationSchema.index({ owner: 1 });
organizationSchema.index({ createdAt: -1 });

// Virtual for full address
organizationSchema.virtual('fullAddress').get(function() {
  const addr = this.contact.address;
  if (!addr) return '';
  
  return [addr.street, addr.city, addr.state, addr.zipCode, addr.country]
    .filter(Boolean)
    .join(', ');
});

// Virtual for subscription status
organizationSchema.virtual('subscriptionStatus').get(function() {
  if (this.subscription.endDate && this.subscription.endDate < new Date()) {
    return 'expired';
  }
  return this.status;
});

// Methods
organizationSchema.methods.isFeatureEnabled = function(feature) {
  return this.subscription.features[feature] === true;
};

organizationSchema.methods.canAddUser = function() {
  return this.stats.totalUsers < this.limits.users;
};

organizationSchema.methods.canAddShipment = function() {
  return this.stats.totalShipments < this.limits.shipments;
};

organizationSchema.methods.hasStorageSpace = function(sizeInBytes) {
  return (this.stats.storageUsed + sizeInBytes) <= this.limits.storage;
};

organizationSchema.methods.canMakeApiCall = function() {
  return this.stats.apiCallsThisMonth < this.limits.apiCalls;
};

organizationSchema.methods.incrementApiCalls = async function() {
  this.stats.apiCallsThisMonth += 1;
  this.stats.lastActivity = new Date();
  return await this.save();
};

organizationSchema.methods.updateStats = async function() {
  const User = mongoose.model('User');
  const Shipment = mongoose.model('Shipment');
  
  // Update user counts
  this.stats.totalUsers = await User.countDocuments({ organizationId: this._id });
  this.stats.activeUsers = await User.countDocuments({ 
    organizationId: this._id, 
    isActive: true,
    lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // 30 days
  });
  
  // Update shipment counts
  this.stats.totalShipments = await Shipment.countDocuments({ organizationId: this._id });
  this.stats.activeShipments = await Shipment.countDocuments({ 
    organizationId: this._id,
    status: { $in: ['pending', 'in-transit'] }
  });
  
  this.stats.lastActivity = new Date();
  return await this.save();
};

// Static methods
organizationSchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug: slug.toLowerCase() });
};

organizationSchema.statics.createWithOwner = async function(orgData, ownerId) {
  const org = new this({
    ...orgData,
    owner: ownerId,
    admins: [ownerId]
  });
  
  await org.save();
  
  // Update the owner's organization
  const User = mongoose.model('User');
  await User.findByIdAndUpdate(ownerId, { organizationId: org._id });
  
  return org;
};

// Pre-save middleware
organizationSchema.pre('save', function(next) {
  // Generate slug from name if not provided
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  
  // Set subscription end date based on plan
  if (this.isModified('subscription.plan') || this.isModified('subscription.startDate')) {
    const startDate = this.subscription.startDate || new Date();
    const interval = this.subscription.billing.interval;
    
    if (interval === 'yearly') {
      this.subscription.endDate = new Date(startDate.getFullYear() + 1, startDate.getMonth(), startDate.getDate());
    } else {
      this.subscription.endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate());
    }
  }
  
  next();
});

// Post-save middleware
organizationSchema.post('save', function(doc) {
  // Reset API calls counter monthly
  const now = new Date();
  const lastReset = doc.metadata.lastApiReset || new Date(0);
  
  if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
    doc.stats.apiCallsThisMonth = 0;
    doc.metadata.lastApiReset = now;
    doc.save();
  }
});

module.exports = mongoose.model('Organization', organizationSchema);
