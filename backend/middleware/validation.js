const { body, param, query, validationResult } = require('express-validator');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Shipment validation rules
const shipmentValidation = {
  create: [
    body('trackingNumber')
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage('Tracking number must be between 3 and 50 characters')
      .matches(/^[A-Z0-9-]+$/)
      .withMessage('Tracking number can only contain uppercase letters, numbers, and hyphens'),
    
    body('origin')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Origin must be between 2 and 100 characters')
      .escape(),
    
    body('destination')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Destination must be between 2 and 100 characters')
      .escape(),
    
    body('status')
      .isIn(['Pending', 'In Transit', 'Delivered', 'Cancelled'])
      .withMessage('Status must be one of: Pending, In Transit, Delivered, Cancelled'),
    
    body('estimatedDelivery')
      .isISO8601()
      .withMessage('Estimated delivery must be a valid date')
      .custom((value) => {
        const date = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date < today) {
          throw new Error('Estimated delivery cannot be in the past');
        }
        return true;
      }),
    
    body('cargo')
      .trim()
      .isLength({ min: 2, max: 200 })
      .withMessage('Cargo description must be between 2 and 200 characters')
      .escape(),
    
    body('weight')
      .trim()
      .matches(/^\d+(\.\d+)?\s*(kg|lbs|tons?)$/i)
      .withMessage('Weight must be in format: number + unit (kg, lbs, ton, tons)')
      .escape(),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters')
      .escape(),
    
    handleValidationErrors
  ],

  update: [
    param('id')
      .isMongoId()
      .withMessage('Invalid shipment ID'),
    
    body('trackingNumber')
      .optional()
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage('Tracking number must be between 3 and 50 characters')
      .matches(/^[A-Z0-9-]+$/)
      .withMessage('Tracking number can only contain uppercase letters, numbers, and hyphens'),
    
    body('origin')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Origin must be between 2 and 100 characters')
      .escape(),
    
    body('destination')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Destination must be between 2 and 100 characters')
      .escape(),
    
    body('status')
      .optional()
      .isIn(['Pending', 'In Transit', 'Delivered', 'Cancelled'])
      .withMessage('Status must be one of: Pending, In Transit, Delivered, Cancelled'),
    
    body('estimatedDelivery')
      .optional()
      .isISO8601()
      .withMessage('Estimated delivery must be a valid date'),
    
    body('cargo')
      .optional()
      .trim()
      .isLength({ min: 2, max: 200 })
      .withMessage('Cargo description must be between 2 and 200 characters')
      .escape(),
    
    body('weight')
      .optional()
      .trim()
      .matches(/^\d+(\.\d+)?\s*(kg|lbs|tons?)$/i)
      .withMessage('Weight must be in format: number + unit (kg, lbs, ton, tons)')
      .escape(),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters')
      .escape(),
    
    handleValidationErrors
  ],

  getById: [
    param('id')
      .isMongoId()
      .withMessage('Invalid shipment ID'),
    
    handleValidationErrors
  ],

  delete: [
    param('id')
      .isMongoId()
      .withMessage('Invalid shipment ID'),
    
    handleValidationErrors
  ]
};

// Query validation for filtering and pagination
const queryValidation = {
  shipmentList: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    
    query('status')
      .optional()
      .isIn(['Pending', 'In Transit', 'Delivered', 'Cancelled'])
      .withMessage('Status must be one of: Pending, In Transit, Delivered, Cancelled'),
    
    query('search')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Search term cannot exceed 100 characters')
      .escape(),
    
    query('sortBy')
      .optional()
      .isIn(['createdAt', 'updatedAt', 'estimatedDelivery', 'trackingNumber'])
      .withMessage('Invalid sort field'),
    
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Sort order must be asc or desc'),
    
    handleValidationErrors
  ]
};

// Authentication validation rules
const authValidation = {
  register: [
    body('firstName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('First name must be between 2 and 50 characters')
      .escape(),

    body('lastName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Last name must be between 2 and 50 characters')
      .escape(),

    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),

    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

    body('role')
      .optional()
      .isIn(['admin', 'manager', 'user'])
      .withMessage('Role must be admin, manager, or user'),

    body('department')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Department cannot exceed 100 characters')
      .escape(),

    body('phone')
      .optional()
      .matches(/^[\+]?[1-9][\d]{0,15}$/)
      .withMessage('Please provide a valid phone number'),

    handleValidationErrors
  ],

  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),

    body('password')
      .notEmpty()
      .withMessage('Password is required'),

    handleValidationErrors
  ],

  updateProfile: [
    body('firstName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('First name must be between 2 and 50 characters')
      .escape(),

    body('lastName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Last name must be between 2 and 50 characters')
      .escape(),

    body('department')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Department cannot exceed 100 characters')
      .escape(),

    body('phone')
      .optional()
      .matches(/^[\+]?[1-9][\d]{0,15}$/)
      .withMessage('Please provide a valid phone number'),

    handleValidationErrors
  ],

  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),

    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

    handleValidationErrors
  ]
};

// User management validation rules
const userValidation = {
  createUser: [
    body('firstName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('First name must be between 2 and 50 characters')
      .escape(),

    body('lastName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Last name must be between 2 and 50 characters')
      .escape(),

    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),

    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

    body('role')
      .isIn(['admin', 'manager', 'user'])
      .withMessage('Role must be admin, manager, or user'),

    body('department')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Department cannot exceed 100 characters')
      .escape(),

    body('phone')
      .optional()
      .matches(/^[\+]?[1-9][\d]{0,15}$/)
      .withMessage('Please provide a valid phone number'),

    handleValidationErrors
  ],

  updateUser: [
    param('id')
      .isMongoId()
      .withMessage('Invalid user ID'),

    body('firstName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('First name must be between 2 and 50 characters')
      .escape(),

    body('lastName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Last name must be between 2 and 50 characters')
      .escape(),

    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),

    body('role')
      .optional()
      .isIn(['admin', 'manager', 'user'])
      .withMessage('Role must be admin, manager, or user'),

    body('department')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Department cannot exceed 100 characters')
      .escape(),

    body('phone')
      .optional()
      .matches(/^[\+]?[1-9][\d]{0,15}$/)
      .withMessage('Please provide a valid phone number'),

    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean value'),

    handleValidationErrors
  ]
};

module.exports = {
  shipmentValidation,
  queryValidation,
  authValidation,
  userValidation,
  handleValidationErrors
};
