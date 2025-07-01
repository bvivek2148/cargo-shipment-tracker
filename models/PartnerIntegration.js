const mongoose = require('mongoose');

const partnerIntegrationSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  partnerId: {
    type: String,
    required: true,
    unique: true
  },
  partnerName: {
    type: String,
    required: true
  },
  partnerType: {
    type: String,
    enum: [
      'shipping_carrier',
      'logistics_provider',
      'customs_broker',
      'freight_forwarder',
      'warehouse_provider',
      'payment_processor',
      'insurance_provider',
      'tracking_service',
      'erp_system',
      'ecommerce_platform',
      'marketplace',
      'api_service',
      'iot_provider',
      'analytics_service'
    ],
    required: true
  },
  category: {
    type: String,
    enum: ['transportation', 'technology', 'financial', 'compliance', 'marketplace'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'suspended', 'testing'],
    default: 'pending'
  },
  integrationLevel: {
    type: String,
    enum: ['basic', 'standard', 'premium', 'enterprise'],
    default: 'basic'
  },
  configuration: {
    apiEndpoint: String,
    apiVersion: String,
    authentication: {
      type: {
        type: String,
        enum: ['api_key', 'oauth2', 'jwt', 'basic_auth', 'custom'],
        default: 'api_key'
      },
      credentials: {
        apiKey: String,
        clientId: String,
        clientSecret: String,
        accessToken: String,
        refreshToken: String,
        username: String,
        password: String
      },
      tokenExpiry: Date,
      scopes: [String]
    },
    webhooks: {
      enabled: { type: Boolean, default: false },
      url: String,
      secret: String,
      events: [String],
      retryPolicy: {
        maxRetries: { type: Number, default: 3 },
        retryDelay: { type: Number, default: 1000 }
      }
    },
    rateLimits: {
      requestsPerMinute: { type: Number, default: 60 },
      requestsPerHour: { type: Number, default: 1000 },
      requestsPerDay: { type: Number, default: 10000 }
    },
    timeout: { type: Number, default: 30000 }, // milliseconds
    retryConfig: {
      enabled: { type: Boolean, default: true },
      maxRetries: { type: Number, default: 3 },
      backoffStrategy: {
        type: String,
        enum: ['linear', 'exponential', 'fixed'],
        default: 'exponential'
      }
    }
  },
  capabilities: {
    tracking: { type: Boolean, default: false },
    rateQuoting: { type: Boolean, default: false },
    booking: { type: Boolean, default: false },
    documentation: { type: Boolean, default: false },
    customs: { type: Boolean, default: false },
    insurance: { type: Boolean, default: false },
    payment: { type: Boolean, default: false },
    analytics: { type: Boolean, default: false },
    realTimeUpdates: { type: Boolean, default: false },
    bulkOperations: { type: Boolean, default: false }
  },
  serviceAreas: {
    global: { type: Boolean, default: false },
    regions: [String], // ['north_america', 'europe', 'asia_pacific', etc.]
    countries: [String], // ISO country codes
    ports: [String],
    airports: [String]
  },
  pricing: {
    model: {
      type: String,
      enum: ['free', 'per_transaction', 'monthly_subscription', 'annual_subscription', 'usage_based', 'custom'],
      default: 'per_transaction'
    },
    baseCost: { type: Number, default: 0 },
    transactionFee: { type: Number, default: 0 },
    monthlyFee: { type: Number, default: 0 },
    annualFee: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    freeTransactions: { type: Number, default: 0 },
    discountTiers: [{
      minVolume: Number,
      discountPercentage: Number
    }]
  },
  dataMapping: {
    inbound: {
      shipmentStatus: String,
      trackingNumber: String,
      location: String,
      estimatedDelivery: String,
      actualDelivery: String,
      events: String
    },
    outbound: {
      shipmentData: String,
      customerData: String,
      addressData: String,
      itemData: String
    },
    transformations: [{
      field: String,
      sourceFormat: String,
      targetFormat: String,
      transformation: String // JavaScript function as string
    }]
  },
  compliance: {
    certifications: [String], // ['ISO27001', 'SOC2', 'GDPR', etc.]
    dataResidency: [String], // Countries where data can be stored
    encryptionStandards: [String],
    auditFrequency: {
      type: String,
      enum: ['monthly', 'quarterly', 'annually'],
      default: 'annually'
    },
    lastAudit: Date,
    nextAudit: Date,
    complianceScore: { type: Number, min: 0, max: 100, default: 0 }
  },
  performance: {
    availability: { type: Number, min: 0, max: 100, default: 99.9 }, // percentage
    averageResponseTime: { type: Number, default: 0 }, // milliseconds
    errorRate: { type: Number, min: 0, max: 100, default: 0 }, // percentage
    throughput: { type: Number, default: 0 }, // requests per second
    lastHealthCheck: Date,
    healthStatus: {
      type: String,
      enum: ['healthy', 'degraded', 'unhealthy', 'unknown'],
      default: 'unknown'
    }
  },
  usage: {
    totalRequests: { type: Number, default: 0 },
    successfulRequests: { type: Number, default: 0 },
    failedRequests: { type: Number, default: 0 },
    lastRequestTime: Date,
    monthlyUsage: [{
      month: String, // YYYY-MM format
      requests: Number,
      cost: Number,
      errors: Number
    }],
    quotaUsed: { type: Number, default: 0 },
    quotaLimit: { type: Number, default: 1000 }
  },
  support: {
    contactEmail: String,
    contactPhone: String,
    supportUrl: String,
    documentationUrl: String,
    statusPageUrl: String,
    supportLevel: {
      type: String,
      enum: ['basic', 'standard', 'premium', 'enterprise'],
      default: 'basic'
    },
    responseTime: {
      type: String,
      enum: ['24h', '12h', '4h', '1h', 'real_time'],
      default: '24h'
    }
  },
  testing: {
    sandboxAvailable: { type: Boolean, default: false },
    sandboxEndpoint: String,
    testCredentials: {
      apiKey: String,
      username: String,
      password: String
    },
    testScenarios: [{
      name: String,
      description: String,
      testData: mongoose.Schema.Types.Mixed,
      expectedResult: mongoose.Schema.Types.Mixed
    }]
  },
  metadata: {
    version: { type: String, default: '1.0.0' },
    lastUpdated: { type: Date, default: Date.now },
    integrationDate: { type: Date, default: Date.now },
    notes: String,
    tags: [String],
    customFields: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true,
  collection: 'partner_integrations'
});

// Indexes
partnerIntegrationSchema.index({ organizationId: 1, partnerType: 1 });
partnerIntegrationSchema.index({ partnerId: 1 }, { unique: true });
partnerIntegrationSchema.index({ status: 1 });
partnerIntegrationSchema.index({ partnerType: 1, category: 1 });
partnerIntegrationSchema.index({ 'serviceAreas.countries': 1 });
partnerIntegrationSchema.index({ createdAt: -1 });

// Virtual for integration health score
partnerIntegrationSchema.virtual('healthScore').get(function() {
  let score = 100;
  
  // Availability impact
  score *= (this.performance.availability / 100);
  
  // Error rate impact
  score *= (1 - this.performance.errorRate / 100);
  
  // Response time impact (penalize if > 5 seconds)
  if (this.performance.averageResponseTime > 5000) {
    score *= 0.8;
  }
  
  // Compliance score impact
  score *= (this.compliance.complianceScore / 100);
  
  return Math.round(score);
});

// Virtual for cost efficiency
partnerIntegrationSchema.virtual('costEfficiency').get(function() {
  if (this.usage.totalRequests === 0) return 0;
  
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyData = this.usage.monthlyUsage.find(m => m.month === currentMonth);
  
  if (!monthlyData || monthlyData.requests === 0) return 0;
  
  return monthlyData.cost / monthlyData.requests;
});

// Methods
partnerIntegrationSchema.methods.updateUsageStats = function(success, responseTime, cost = 0) {
  this.usage.totalRequests += 1;
  this.usage.lastRequestTime = new Date();
  
  if (success) {
    this.usage.successfulRequests += 1;
  } else {
    this.usage.failedRequests += 1;
  }
  
  // Update performance metrics
  this.performance.errorRate = (this.usage.failedRequests / this.usage.totalRequests) * 100;
  this.performance.averageResponseTime = 
    (this.performance.averageResponseTime + responseTime) / 2;
  
  // Update monthly usage
  const currentMonth = new Date().toISOString().slice(0, 7);
  let monthlyData = this.usage.monthlyUsage.find(m => m.month === currentMonth);
  
  if (!monthlyData) {
    monthlyData = { month: currentMonth, requests: 0, cost: 0, errors: 0 };
    this.usage.monthlyUsage.push(monthlyData);
  }
  
  monthlyData.requests += 1;
  monthlyData.cost += cost;
  if (!success) monthlyData.errors += 1;
  
  return this.save();
};

partnerIntegrationSchema.methods.checkQuotaLimit = function() {
  return this.usage.quotaUsed < this.usage.quotaLimit;
};

partnerIntegrationSchema.methods.incrementQuota = function(amount = 1) {
  this.usage.quotaUsed += amount;
  return this.usage.quotaUsed <= this.usage.quotaLimit;
};

partnerIntegrationSchema.methods.resetMonthlyQuota = function() {
  this.usage.quotaUsed = 0;
  return this.save();
};

partnerIntegrationSchema.methods.updateHealthStatus = function(status, responseTime) {
  this.performance.healthStatus = status;
  this.performance.lastHealthCheck = new Date();
  
  if (responseTime) {
    this.performance.averageResponseTime = responseTime;
  }
  
  return this.save();
};

partnerIntegrationSchema.methods.isRateLimited = function() {
  const now = Date.now();
  const oneMinute = 60 * 1000;
  const oneHour = 60 * oneMinute;
  const oneDay = 24 * oneHour;
  
  // Check requests in last minute/hour/day
  // This would need to be implemented with a proper rate limiting store
  return false; // Placeholder
};

// Static methods
partnerIntegrationSchema.statics.findByType = function(partnerType, organizationId = null) {
  const query = { partnerType, status: 'active' };
  if (organizationId) {
    query.organizationId = organizationId;
  }
  return this.find(query);
};

partnerIntegrationSchema.statics.findByServiceArea = function(country, region = null) {
  const query = {
    status: 'active',
    $or: [
      { 'serviceAreas.global': true },
      { 'serviceAreas.countries': country }
    ]
  };
  
  if (region) {
    query.$or.push({ 'serviceAreas.regions': region });
  }
  
  return this.find(query);
};

partnerIntegrationSchema.statics.getHealthSummary = async function(organizationId) {
  const integrations = await this.find({ organizationId });
  
  const summary = {
    total: integrations.length,
    healthy: 0,
    degraded: 0,
    unhealthy: 0,
    averageHealth: 0,
    totalRequests: 0,
    totalCost: 0
  };
  
  let totalHealthScore = 0;
  
  integrations.forEach(integration => {
    const health = integration.performance.healthStatus;
    summary[health] = (summary[health] || 0) + 1;
    
    totalHealthScore += integration.healthScore;
    summary.totalRequests += integration.usage.totalRequests;
    
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyData = integration.usage.monthlyUsage.find(m => m.month === currentMonth);
    if (monthlyData) {
      summary.totalCost += monthlyData.cost;
    }
  });
  
  summary.averageHealth = integrations.length > 0 ? totalHealthScore / integrations.length : 0;
  
  return summary;
};

partnerIntegrationSchema.statics.findRecommendations = async function(organizationId, requirements) {
  const query = {
    status: 'active',
    organizationId: { $ne: organizationId } // Exclude current org's integrations
  };
  
  // Add capability filters
  if (requirements.capabilities) {
    Object.keys(requirements.capabilities).forEach(capability => {
      if (requirements.capabilities[capability]) {
        query[`capabilities.${capability}`] = true;
      }
    });
  }
  
  // Add service area filters
  if (requirements.serviceArea) {
    query.$or = [
      { 'serviceAreas.global': true },
      { 'serviceAreas.countries': requirements.serviceArea.country },
      { 'serviceAreas.regions': requirements.serviceArea.region }
    ];
  }
  
  const recommendations = await this.find(query)
    .sort({ 'performance.availability': -1, 'compliance.complianceScore': -1 })
    .limit(10);
  
  return recommendations;
};

module.exports = mongoose.model('PartnerIntegration', partnerIntegrationSchema);
