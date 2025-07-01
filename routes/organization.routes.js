const express = require('express');
const Organization = require('../models/Organization');
const User = require('../models/User');
const Shipment = require('../models/Shipment');
const Analytics = require('../models/Analytics');
const { authenticate, authorize, requirePermission } = require('../middleware/auth');
const { cacheResponse, invalidateCache } = require('../middleware/cache');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// @route   GET /api/organizations
// @desc    Get all organizations (super admin only)
// @access  Private (Super Admin)
router.get('/', authenticate, authorize('super_admin'), cacheResponse({ ttl: 600 }), async (req, res) => {
  try {
    const { page = 1, limit = 10, status, plan, search } = req.query;
    
    let query = {};
    
    if (status) query.status = status;
    if (plan) query['subscription.plan'] = plan;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'contact.email': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const organizations = await Organization.find(query)
      .populate('owner', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Organization.countDocuments(query);

    res.json({
      success: true,
      data: organizations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get organizations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching organizations'
    });
  }
});

// @route   GET /api/organizations/current
// @desc    Get current user's organization
// @access  Private
router.get('/current', authenticate, cacheResponse({ ttl: 300 }), async (req, res) => {
  try {
    if (!req.user.organizationId) {
      return res.status(404).json({
        success: false,
        message: 'No organization found for user'
      });
    }

    const organization = await Organization.findById(req.user.organizationId)
      .populate('owner', 'fullName email')
      .populate('admins', 'fullName email role');

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Update stats
    await organization.updateStats();

    res.json({
      success: true,
      data: organization
    });

  } catch (error) {
    console.error('Get current organization error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching organization'
    });
  }
});

// @route   POST /api/organizations
// @desc    Create new organization
// @access  Public (for registration) or Super Admin
router.post('/', [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('contact.email').isEmail().withMessage('Valid email is required'),
  body('type').isIn(['logistics', 'shipping', 'manufacturing', 'retail', 'enterprise']).withMessage('Invalid organization type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      name,
      type,
      contact,
      subscription = {},
      settings = {}
    } = req.body;

    // Check if organization with same name or email exists
    const existingOrg = await Organization.findOne({
      $or: [
        { name: { $regex: new RegExp(`^${name}$`, 'i') } },
        { 'contact.email': contact.email.toLowerCase() }
      ]
    });

    if (existingOrg) {
      return res.status(400).json({
        success: false,
        message: 'Organization with this name or email already exists'
      });
    }

    // Create organization
    const orgData = {
      name,
      type,
      contact: {
        ...contact,
        email: contact.email.toLowerCase()
      },
      subscription: {
        plan: subscription.plan || 'free',
        features: {
          maxUsers: subscription.plan === 'enterprise' ? 1000 : subscription.plan === 'professional' ? 100 : 5,
          maxShipments: subscription.plan === 'enterprise' ? 10000 : subscription.plan === 'professional' ? 1000 : 100,
          realTimeTracking: true,
          analytics: ['professional', 'enterprise'].includes(subscription.plan),
          apiAccess: ['professional', 'enterprise'].includes(subscription.plan),
          customBranding: subscription.plan === 'enterprise',
          advancedReporting: ['professional', 'enterprise'].includes(subscription.plan),
          iotIntegration: subscription.plan === 'enterprise',
          aiOptimization: subscription.plan === 'enterprise'
        }
      },
      settings: {
        ...settings,
        timezone: settings.timezone || 'UTC',
        currency: settings.currency || 'USD',
        language: settings.language || 'en'
      }
    };

    let organization;
    
    if (req.user) {
      // Admin creating organization
      organization = new Organization({
        ...orgData,
        owner: req.user._id,
        admins: [req.user._id]
      });
    } else {
      // Self-registration (owner will be set when user registers)
      organization = new Organization(orgData);
    }

    await organization.save();

    // Record analytics
    await Analytics.recordEvent({
      type: 'organization_created',
      category: 'system',
      entityId: organization._id,
      entityType: 'organization',
      userId: req.user?._id,
      data: {
        organizationId: organization._id,
        name: organization.name,
        plan: organization.subscription.plan
      },
      metadata: { source: 'api' }
    });

    res.status(201).json({
      success: true,
      data: organization,
      message: 'Organization created successfully'
    });

  } catch (error) {
    console.error('Create organization error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating organization'
    });
  }
});

// @route   PUT /api/organizations/:id
// @desc    Update organization
// @access  Private (Owner/Admin)
router.put('/:id', authenticate, [
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('contact.email').optional().isEmail()
], invalidateCache(['organizations:*']), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const organization = await Organization.findById(req.params.id);
    
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Check permissions
    const isOwner = organization.owner.toString() === req.user._id.toString();
    const isAdmin = organization.admins.includes(req.user._id);
    const isSuperAdmin = req.user.role === 'super_admin';

    if (!isOwner && !isAdmin && !isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update allowed fields
    const allowedUpdates = ['name', 'type', 'contact', 'settings'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Only super admin can update subscription
    if (isSuperAdmin && req.body.subscription) {
      updates.subscription = req.body.subscription;
    }

    Object.assign(organization, updates);
    await organization.save();

    // Record analytics
    await Analytics.recordEvent({
      type: 'organization_updated',
      category: 'system',
      entityId: organization._id,
      entityType: 'organization',
      userId: req.user._id,
      data: { organizationId: organization._id, updates: Object.keys(updates) },
      metadata: { source: 'api' }
    });

    res.json({
      success: true,
      data: organization,
      message: 'Organization updated successfully'
    });

  } catch (error) {
    console.error('Update organization error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating organization'
    });
  }
});

// @route   GET /api/organizations/:id/stats
// @desc    Get organization statistics
// @access  Private (Owner/Admin)
router.get('/:id/stats', authenticate, cacheResponse({ ttl: 300 }), async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);
    
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Check permissions
    const hasAccess = organization.owner.toString() === req.user._id.toString() ||
                     organization.admins.includes(req.user._id) ||
                     req.user.role === 'super_admin';

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get detailed statistics
    const stats = {
      ...organization.stats,
      shipmentsByStatus: await Shipment.aggregate([
        { $match: { organizationId: organization._id } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      usersByRole: await User.aggregate([
        { $match: { organizationId: organization._id } },
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]),
      monthlyShipments: await Shipment.aggregate([
        { 
          $match: { 
            organizationId: organization._id,
            createdAt: { $gte: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ])
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get organization stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching organization statistics'
    });
  }
});

// @route   POST /api/organizations/:id/users
// @desc    Add user to organization
// @access  Private (Owner/Admin)
router.post('/:id/users', authenticate, [
  body('email').isEmail().withMessage('Valid email is required'),
  body('role').isIn(['admin', 'operator', 'viewer']).withMessage('Invalid role')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const organization = await Organization.findById(req.params.id);
    
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Check permissions
    const isOwner = organization.owner.toString() === req.user._id.toString();
    const isAdmin = organization.admins.includes(req.user._id);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if organization can add more users
    if (!organization.canAddUser()) {
      return res.status(400).json({
        success: false,
        message: 'User limit reached for current subscription plan'
      });
    }

    const { email, role } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() });
    
    if (user) {
      if (user.organizationId) {
        return res.status(400).json({
          success: false,
          message: 'User already belongs to an organization'
        });
      }
      
      // Add existing user to organization
      user.organizationId = organization._id;
      user.role = role;
      await user.save();
    } else {
      // Create invitation (user will be created when they accept)
      // This would typically send an email invitation
      return res.status(200).json({
        success: true,
        message: 'Invitation sent to user',
        data: { email, role, status: 'invited' }
      });
    }

    // Update organization stats
    await organization.updateStats();

    res.json({
      success: true,
      data: user,
      message: 'User added to organization successfully'
    });

  } catch (error) {
    console.error('Add user to organization error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding user to organization'
    });
  }
});

// @route   DELETE /api/organizations/:id/users/:userId
// @desc    Remove user from organization
// @access  Private (Owner/Admin)
router.delete('/:id/users/:userId', authenticate, async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);
    
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Check permissions
    const isOwner = organization.owner.toString() === req.user._id.toString();
    const isAdmin = organization.admins.includes(req.user._id);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Cannot remove owner
    if (organization.owner.toString() === req.params.userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove organization owner'
      });
    }

    const user = await User.findById(req.params.userId);
    
    if (!user || user.organizationId?.toString() !== organization._id.toString()) {
      return res.status(404).json({
        success: false,
        message: 'User not found in organization'
      });
    }

    // Remove user from organization
    user.organizationId = null;
    user.role = 'viewer';
    await user.save();

    // Remove from admins if present
    organization.admins = organization.admins.filter(
      adminId => adminId.toString() !== req.params.userId
    );
    await organization.save();

    // Update organization stats
    await organization.updateStats();

    res.json({
      success: true,
      message: 'User removed from organization successfully'
    });

  } catch (error) {
    console.error('Remove user from organization error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing user from organization'
    });
  }
});

// @route   PUT /api/organizations/:id/subscription
// @desc    Update organization subscription
// @access  Private (Super Admin or Owner with payment)
router.put('/:id/subscription', authenticate, async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);
    
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Check permissions
    const isOwner = organization.owner.toString() === req.user._id.toString();
    const isSuperAdmin = req.user.role === 'super_admin';

    if (!isOwner && !isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { plan, billing } = req.body;

    // Update subscription
    if (plan) {
      organization.subscription.plan = plan;
      
      // Update features based on plan
      const features = {
        free: { maxUsers: 5, maxShipments: 100, analytics: false, apiAccess: false },
        basic: { maxUsers: 20, maxShipments: 500, analytics: true, apiAccess: false },
        professional: { maxUsers: 100, maxShipments: 1000, analytics: true, apiAccess: true },
        enterprise: { maxUsers: 1000, maxShipments: 10000, analytics: true, apiAccess: true, customBranding: true, iotIntegration: true, aiOptimization: true }
      };
      
      Object.assign(organization.subscription.features, features[plan]);
    }

    if (billing) {
      Object.assign(organization.subscription.billing, billing);
    }

    await organization.save();

    res.json({
      success: true,
      data: organization,
      message: 'Subscription updated successfully'
    });

  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating subscription'
    });
  }
});

module.exports = router;
