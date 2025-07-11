# Contributing to Cargo Shipment Tracker

Thank you for your interest in contributing to the Cargo Shipment Tracker! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Documentation](#documentation)

## Code of Conduct

This project adheres to a code of conduct that we expect all contributors to follow. Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- MongoDB 6.0 or higher
- Redis 7.0 or higher
- Git

### Setup Development Environment

1. **Fork the repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/cargo-shipment-tracker.git
   cd cargo-shipment-tracker
   ```

2. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/username/cargo-shipment-tracker.git
   ```

3. **Install dependencies**
   ```bash
   # Frontend
   cd frontend && npm install
   
   # Backend
   cd ../backend && npm install
   ```

4. **Setup environment**
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

5. **Start development servers**
   ```bash
   # Use the quick start script
   ./scripts/quick-start.sh
   
   # Or manually
   # Terminal 1: cd backend && npm run dev
   # Terminal 2: cd frontend && npm run dev
   ```

## Development Workflow

### Branch Naming Convention

- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `hotfix/description` - Critical fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test improvements

### Commit Message Convention

We use [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(tracking): add real-time GPS tracking
fix(auth): resolve JWT token expiration issue
docs(readme): update installation instructions
test(api): add integration tests for shipment endpoints
```

### Development Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write code following our coding standards
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**
   ```bash
   # Run all tests
   npm run test:all
   
   # Run specific test suites
   cd frontend && npm run test
   cd backend && npm run test
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat(component): add new feature"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**

## Coding Standards

### JavaScript/React Standards

- **ESLint**: Follow the configured ESLint rules
- **Prettier**: Use Prettier for code formatting
- **File Naming**: Use kebab-case for files and folders
- **Component Naming**: Use PascalCase for React components
- **Function Naming**: Use camelCase for functions and variables

### Code Style Guidelines

#### React Components
```jsx
// Good
import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

function ShipmentCard({ shipment, onUpdate }) {
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    // Effect logic
  }, [shipment.id])
  
  const handleUpdate = async () => {
    setLoading(true)
    try {
      await onUpdate(shipment.id)
    } catch (error) {
      console.error('Update failed:', error)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="shipment-card">
      {/* Component JSX */}
    </div>
  )
}

ShipmentCard.propTypes = {
  shipment: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired
}

export default ShipmentCard
```

#### API Endpoints
```javascript
// Good
const express = require('express')
const { validateShipment } = require('../middleware/validation')
const { authenticate, authorize } = require('../middleware/auth')
const shipmentController = require('../controllers/shipmentController')

const router = express.Router()

router.get('/', 
  authenticate, 
  authorize(['admin', 'manager']), 
  shipmentController.getShipments
)

router.post('/', 
  authenticate, 
  validateShipment, 
  shipmentController.createShipment
)

module.exports = router
```

### CSS Standards

- Use CSS custom properties (variables)
- Follow BEM methodology for class naming
- Use semantic HTML elements
- Ensure accessibility compliance

```css
/* Good */
.shipment-card {
  --card-padding: 1rem;
  --card-border-radius: 0.5rem;
  
  padding: var(--card-padding);
  border-radius: var(--card-border-radius);
  background: var(--color-surface-primary);
}

.shipment-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.shipment-card__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}
```

## Testing Guidelines

### Test Structure

```javascript
// Good test structure
describe('ShipmentService', () => {
  beforeEach(() => {
    // Setup
  })
  
  afterEach(() => {
    // Cleanup
  })
  
  describe('createShipment', () => {
    it('should create a new shipment with valid data', async () => {
      // Arrange
      const shipmentData = {
        origin: 'New York',
        destination: 'London',
        cargo: 'Electronics'
      }
      
      // Act
      const result = await shipmentService.createShipment(shipmentData)
      
      // Assert
      expect(result).toBeDefined()
      expect(result.id).toBeTruthy()
      expect(result.status).toBe('pending')
    })
    
    it('should throw error with invalid data', async () => {
      // Arrange
      const invalidData = {}
      
      // Act & Assert
      await expect(shipmentService.createShipment(invalidData))
        .rejects.toThrow('Invalid shipment data')
    })
  })
})
```

### Test Coverage Requirements

- **Unit Tests**: 90%+ coverage for business logic
- **Integration Tests**: 80%+ coverage for API endpoints
- **E2E Tests**: Cover critical user journeys

### Running Tests

```bash
# All tests
npm run test:all

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# E2E tests only
npm run test:e2e

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## Pull Request Process

### Before Submitting

1. **Sync with upstream**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run tests**
   ```bash
   npm run test:all
   npm run lint
   npm run format:check
   ```

3. **Update documentation**
   - Update README if needed
   - Add/update API documentation
   - Update CHANGELOG.md

### PR Requirements

- [ ] Tests pass
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] No merge conflicts
- [ ] Descriptive title and description
- [ ] Linked to relevant issues

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
```

## Issue Reporting

### Bug Reports

Use the bug report template:

```markdown
**Describe the bug**
A clear description of the bug

**To Reproduce**
Steps to reproduce the behavior

**Expected behavior**
What you expected to happen

**Screenshots**
If applicable, add screenshots

**Environment:**
- OS: [e.g. iOS]
- Browser: [e.g. chrome, safari]
- Version: [e.g. 22]
```

### Feature Requests

Use the feature request template:

```markdown
**Is your feature request related to a problem?**
A clear description of the problem

**Describe the solution you'd like**
A clear description of what you want to happen

**Describe alternatives you've considered**
Alternative solutions or features

**Additional context**
Any other context or screenshots
```

## Documentation

### Code Documentation

- Use JSDoc for JavaScript functions
- Add inline comments for complex logic
- Update README for new features
- Maintain API documentation

### API Documentation

- Use OpenAPI/Swagger specifications
- Include request/response examples
- Document error codes and messages
- Keep documentation in sync with code

## Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project documentation

Thank you for contributing to Cargo Shipment Tracker! 🚢
