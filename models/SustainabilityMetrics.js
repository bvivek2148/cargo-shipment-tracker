const mongoose = require('mongoose');

const sustainabilityMetricsSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  shipmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shipment',
    required: true
  },
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
    default: 'daily'
  },
  carbonFootprint: {
    // CO2 emissions in kg
    total: { type: Number, default: 0 },
    transportation: { type: Number, default: 0 },
    packaging: { type: Number, default: 0 },
    warehousing: { type: Number, default: 0 },
    lastMile: { type: Number, default: 0 },
    scope1: { type: Number, default: 0 }, // Direct emissions
    scope2: { type: Number, default: 0 }, // Indirect emissions from energy
    scope3: { type: Number, default: 0 }  // Other indirect emissions
  },
  energyConsumption: {
    // Energy consumption in kWh
    total: { type: Number, default: 0 },
    renewable: { type: Number, default: 0 },
    nonRenewable: { type: Number, default: 0 },
    renewablePercentage: { type: Number, default: 0 },
    sources: {
      solar: { type: Number, default: 0 },
      wind: { type: Number, default: 0 },
      hydro: { type: Number, default: 0 },
      fossil: { type: Number, default: 0 },
      nuclear: { type: Number, default: 0 }
    }
  },
  fuelConsumption: {
    // Fuel consumption in liters
    total: { type: Number, default: 0 },
    diesel: { type: Number, default: 0 },
    gasoline: { type: Number, default: 0 },
    naturalGas: { type: Number, default: 0 },
    biofuel: { type: Number, default: 0 },
    electric: { type: Number, default: 0 }, // kWh for electric vehicles
    hydrogen: { type: Number, default: 0 }
  },
  wasteGeneration: {
    // Waste in kg
    total: { type: Number, default: 0 },
    recycled: { type: Number, default: 0 },
    landfill: { type: Number, default: 0 },
    incinerated: { type: Number, default: 0 },
    composted: { type: Number, default: 0 },
    recyclingRate: { type: Number, default: 0 },
    packaging: {
      plastic: { type: Number, default: 0 },
      cardboard: { type: Number, default: 0 },
      metal: { type: Number, default: 0 },
      glass: { type: Number, default: 0 },
      wood: { type: Number, default: 0 }
    }
  },
  waterUsage: {
    // Water usage in liters
    total: { type: Number, default: 0 },
    cleaning: { type: Number, default: 0 },
    cooling: { type: Number, default: 0 },
    processing: { type: Number, default: 0 },
    recycled: { type: Number, default: 0 },
    recyclingRate: { type: Number, default: 0 }
  },
  transportation: {
    distance: { type: Number, default: 0 }, // km
    mode: {
      type: String,
      enum: ['road', 'rail', 'sea', 'air', 'multimodal'],
      default: 'road'
    },
    efficiency: { type: Number, default: 0 }, // km per liter
    loadFactor: { type: Number, default: 0 }, // percentage of capacity used
    emptyMiles: { type: Number, default: 0 }, // km traveled empty
    optimizationSavings: {
      distance: { type: Number, default: 0 },
      fuel: { type: Number, default: 0 },
      emissions: { type: Number, default: 0 }
    }
  },
  packaging: {
    totalWeight: { type: Number, default: 0 }, // kg
    recyclablePercentage: { type: Number, default: 0 },
    biodegradablePercentage: { type: Number, default: 0 },
    reusablePercentage: { type: Number, default: 0 },
    materials: {
      plastic: { weight: Number, recyclable: Boolean },
      cardboard: { weight: Number, recyclable: Boolean },
      metal: { weight: Number, recyclable: Boolean },
      glass: { weight: Number, recyclable: Boolean },
      wood: { weight: Number, recyclable: Boolean },
      biodegradable: { weight: Number, compostable: Boolean }
    }
  },
  certifications: {
    iso14001: { type: Boolean, default: false }, // Environmental Management
    iso50001: { type: Boolean, default: false }, // Energy Management
    carbonNeutral: { type: Boolean, default: false },
    greenLogistics: { type: Boolean, default: false },
    sustainablePackaging: { type: Boolean, default: false },
    renewableEnergy: { type: Boolean, default: false }
  },
  esgScores: {
    environmental: { type: Number, min: 0, max: 100, default: 0 },
    social: { type: Number, min: 0, max: 100, default: 0 },
    governance: { type: Number, min: 0, max: 100, default: 0 },
    overall: { type: Number, min: 0, max: 100, default: 0 }
  },
  targets: {
    carbonReduction: {
      target: { type: Number, default: 0 }, // percentage reduction
      baseline: { type: Number, default: 0 },
      current: { type: Number, default: 0 },
      deadline: Date,
      achieved: { type: Boolean, default: false }
    },
    renewableEnergy: {
      target: { type: Number, default: 0 }, // percentage
      current: { type: Number, default: 0 },
      deadline: Date,
      achieved: { type: Boolean, default: false }
    },
    wasteReduction: {
      target: { type: Number, default: 0 }, // percentage reduction
      baseline: { type: Number, default: 0 },
      current: { type: Number, default: 0 },
      deadline: Date,
      achieved: { type: Boolean, default: false }
    },
    waterReduction: {
      target: { type: Number, default: 0 }, // percentage reduction
      baseline: { type: Number, default: 0 },
      current: { type: Number, default: 0 },
      deadline: Date,
      achieved: { type: Boolean, default: false }
    }
  },
  initiatives: [{
    name: String,
    description: String,
    category: {
      type: String,
      enum: ['carbon_reduction', 'energy_efficiency', 'waste_reduction', 'water_conservation', 'sustainable_packaging', 'green_transportation']
    },
    status: {
      type: String,
      enum: ['planned', 'in_progress', 'completed', 'cancelled'],
      default: 'planned'
    },
    startDate: Date,
    endDate: Date,
    budget: Number,
    expectedSavings: {
      carbon: Number,
      energy: Number,
      cost: Number
    },
    actualSavings: {
      carbon: Number,
      energy: Number,
      cost: Number
    },
    progress: { type: Number, min: 0, max: 100, default: 0 }
  }],
  reporting: {
    cdpScore: String, // Carbon Disclosure Project score (A, A-, B, B-, C, C-, D, D-)
    gri: { type: Boolean, default: false }, // Global Reporting Initiative
    sasb: { type: Boolean, default: false }, // Sustainability Accounting Standards Board
    tcfd: { type: Boolean, default: false }, // Task Force on Climate-related Financial Disclosures
    ungc: { type: Boolean, default: false }, // UN Global Compact
    sdgs: [{ // UN Sustainable Development Goals
      goal: { type: Number, min: 1, max: 17 },
      target: String,
      contribution: String
    }]
  },
  benchmarks: {
    industryAverage: {
      carbonIntensity: Number, // kg CO2 per km or per shipment
      energyIntensity: Number,
      wasteIntensity: Number
    },
    bestInClass: {
      carbonIntensity: Number,
      energyIntensity: Number,
      wasteIntensity: Number
    },
    performance: {
      carbonRanking: { type: String, enum: ['top_10', 'top_25', 'top_50', 'below_average'] },
      energyRanking: { type: String, enum: ['top_10', 'top_25', 'top_50', 'below_average'] },
      wasteRanking: { type: String, enum: ['top_10', 'top_25', 'top_50', 'below_average'] }
    }
  },
  calculationMethod: {
    carbonFactors: {
      diesel: { type: Number, default: 2.68 }, // kg CO2 per liter
      gasoline: { type: Number, default: 2.31 },
      electricity: { type: Number, default: 0.5 }, // kg CO2 per kWh (varies by region)
      naturalGas: { type: Number, default: 2.0 }
    },
    methodology: {
      type: String,
      enum: ['ghg_protocol', 'iso14064', 'ipcc', 'custom'],
      default: 'ghg_protocol'
    },
    lastUpdated: { type: Date, default: Date.now }
  }
}, {
  timestamps: true,
  collection: 'sustainability_metrics'
});

// Indexes
sustainabilityMetricsSchema.index({ organizationId: 1, period: 1, createdAt: -1 });
sustainabilityMetricsSchema.index({ shipmentId: 1 });
sustainabilityMetricsSchema.index({ 'carbonFootprint.total': -1 });
sustainabilityMetricsSchema.index({ 'esgScores.overall': -1 });
sustainabilityMetricsSchema.index({ createdAt: -1 });

// Virtual for carbon intensity
sustainabilityMetricsSchema.virtual('carbonIntensity').get(function() {
  if (this.transportation.distance > 0) {
    return this.carbonFootprint.total / this.transportation.distance;
  }
  return 0;
});

// Virtual for energy efficiency
sustainabilityMetricsSchema.virtual('energyEfficiency').get(function() {
  if (this.transportation.distance > 0) {
    return this.energyConsumption.total / this.transportation.distance;
  }
  return 0;
});

// Methods
sustainabilityMetricsSchema.methods.calculateCarbonFootprint = function() {
  const factors = this.calculationMethod.carbonFactors;
  
  // Transportation emissions
  this.carbonFootprint.transportation = 
    (this.fuelConsumption.diesel * factors.diesel) +
    (this.fuelConsumption.gasoline * factors.gasoline) +
    (this.fuelConsumption.naturalGas * factors.naturalGas) +
    (this.fuelConsumption.electric * factors.electricity);
  
  // Packaging emissions (estimated)
  this.carbonFootprint.packaging = this.packaging.totalWeight * 0.5; // kg CO2 per kg packaging
  
  // Warehousing emissions (estimated)
  this.carbonFootprint.warehousing = this.energyConsumption.total * factors.electricity * 0.1;
  
  // Total emissions
  this.carbonFootprint.total = 
    this.carbonFootprint.transportation +
    this.carbonFootprint.packaging +
    this.carbonFootprint.warehousing +
    this.carbonFootprint.lastMile;
  
  return this.carbonFootprint.total;
};

sustainabilityMetricsSchema.methods.calculateESGScore = function() {
  // Environmental score (40% weight)
  const envScore = this.calculateEnvironmentalScore();
  
  // Social score (30% weight) - placeholder
  const socialScore = 75; // Would be calculated based on social metrics
  
  // Governance score (30% weight) - placeholder
  const governanceScore = 80; // Would be calculated based on governance metrics
  
  this.esgScores.environmental = envScore;
  this.esgScores.social = socialScore;
  this.esgScores.governance = governanceScore;
  this.esgScores.overall = (envScore * 0.4) + (socialScore * 0.3) + (governanceScore * 0.3);
  
  return this.esgScores.overall;
};

sustainabilityMetricsSchema.methods.calculateEnvironmentalScore = function() {
  let score = 100;
  
  // Carbon intensity penalty
  if (this.carbonIntensity > 0.5) score -= 20;
  else if (this.carbonIntensity > 0.3) score -= 10;
  
  // Renewable energy bonus
  score += this.energyConsumption.renewablePercentage * 0.2;
  
  // Recycling rate bonus
  score += this.wasteGeneration.recyclingRate * 0.15;
  
  // Certification bonuses
  if (this.certifications.iso14001) score += 5;
  if (this.certifications.carbonNeutral) score += 10;
  if (this.certifications.renewableEnergy) score += 5;
  
  return Math.min(100, Math.max(0, score));
};

sustainabilityMetricsSchema.methods.updateTargetProgress = function() {
  // Carbon reduction progress
  if (this.targets.carbonReduction.baseline > 0) {
    const reduction = ((this.targets.carbonReduction.baseline - this.carbonFootprint.total) / this.targets.carbonReduction.baseline) * 100;
    this.targets.carbonReduction.current = Math.max(0, reduction);
    this.targets.carbonReduction.achieved = reduction >= this.targets.carbonReduction.target;
  }
  
  // Renewable energy progress
  this.targets.renewableEnergy.current = this.energyConsumption.renewablePercentage;
  this.targets.renewableEnergy.achieved = this.energyConsumption.renewablePercentage >= this.targets.renewableEnergy.target;
  
  // Waste reduction progress
  if (this.targets.wasteReduction.baseline > 0) {
    const reduction = ((this.targets.wasteReduction.baseline - this.wasteGeneration.total) / this.targets.wasteReduction.baseline) * 100;
    this.targets.wasteReduction.current = Math.max(0, reduction);
    this.targets.wasteReduction.achieved = reduction >= this.targets.wasteReduction.target;
  }
};

// Static methods
sustainabilityMetricsSchema.statics.getOrganizationSummary = async function(organizationId, period = 'monthly') {
  const pipeline = [
    { $match: { organizationId: new mongoose.Types.ObjectId(organizationId), period } },
    {
      $group: {
        _id: null,
        totalCarbon: { $sum: '$carbonFootprint.total' },
        totalEnergy: { $sum: '$energyConsumption.total' },
        totalWaste: { $sum: '$wasteGeneration.total' },
        avgESGScore: { $avg: '$esgScores.overall' },
        renewablePercentage: { $avg: '$energyConsumption.renewablePercentage' },
        recyclingRate: { $avg: '$wasteGeneration.recyclingRate' },
        shipmentCount: { $sum: 1 }
      }
    }
  ];
  
  const result = await this.aggregate(pipeline);
  return result[0] || {};
};

sustainabilityMetricsSchema.statics.getBenchmarkData = async function(organizationId) {
  // Get industry benchmarks
  const industryData = await this.aggregate([
    { $match: { organizationId: { $ne: new mongoose.Types.ObjectId(organizationId) } } },
    {
      $group: {
        _id: null,
        avgCarbonIntensity: { $avg: { $divide: ['$carbonFootprint.total', '$transportation.distance'] } },
        avgEnergyIntensity: { $avg: { $divide: ['$energyConsumption.total', '$transportation.distance'] } },
        avgWasteIntensity: { $avg: { $divide: ['$wasteGeneration.total', '$transportation.distance'] } }
      }
    }
  ]);
  
  return industryData[0] || {};
};

module.exports = mongoose.model('SustainabilityMetrics', sustainabilityMetricsSchema);
