# Backend Coding Directives - Best Practices & Patterns

## 🎯 Executive Summary

This document establishes coding standards, patterns, and directives for backend development based on successful TDD/BDD implementation. Follow these guidelines to maintain code quality, testability, and development velocity.

---

## 🔄 TDD Development Process

### RED Phase - Write Tests First
```bash
# 1. Create test file following naming convention
touch test/feature-name.bdd.test.ts

# 2. Write failing tests that describe desired behavior
# 3. Verify tests fail as expected
npm test feature-name.bdd.test.ts
```

### GREEN Phase - Write Minimal Code
```bash
# 1. Write minimal code to make tests pass
# 2. Run tests to verify green state
npm test feature-name.bdd.test.ts

# 3. Never write code without a failing test
```

### Refactor Phase - Improve Without Breaking
```bash
# 1. Improve code structure while keeping tests green
# 2. Verify tests still pass after refactoring
npm test

# 3. Commit green state
git add . && git commit -m "feat: implement feature with passing tests"
```

---

## 📝 BDD Test Structure

### Naming Conventions
```
# File: test/feature-name.bdd.test.ts
describe('Feature: Description of what the feature does', () => {
  describe('Scenario: Specific user scenario', () => {
    it('should [expected behavior] when [condition]', async () => {
      // Given - Setup
      // When - Action  
      // Then - Assertion
    })
  })
})
```

### Example BDD Structure
```typescript
describe('Feature: User Authentication', () => {
  describe('Scenario: Valid login credentials', () => {
    it('should return JWT token when valid email and password provided', async () => {
      // Given
      const credentials = { email: 'user@example.com', password: 'password123' }
      
      // When
      const response = await app.handle(
        new Request('/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials)
        })
      )
      
      // Then
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toHaveProperty('token')
      expect(data.token).toMatch(/^[A-Za-z0-9]+\.[A-Za-z0-9]+\.[A-Za-z0-9]+$/)
    })
  })
})
```

### Required Test Coverage
- **Happy Path**: Normal successful operation
- **Edge Cases**: Boundary conditions, empty values
- **Error Scenarios**: Failures, invalid inputs, network issues
- **Validation**: Input validation, required fields
- **Integration**: End-to-end workflow tests

---

## 🧪 Test Organization & Patterns

### File Structure
```
test/
├── setup.ts                           # Global configuration
├── feature-name.bdd.test.ts          # Main BDD tests
├── error-handling.test.ts            # Error pattern tests
└── utils/
    ├── mocks.ts                      # Shared mocks
    └── helpers.ts                    # Test helpers
```

### Global Setup (setup.ts)
```typescript
import { vi } from 'vitest'
import dotenv from 'dotenv'

// Load test environment
dotenv.config({ path: '.env.test' })

// Mock external dependencies
vi.mock('@/utils/s3', () => ({
  generatePresignedUrlForUpload: vi.fn().mockResolvedValue('mock-url'),
  downloadFile: vi.fn().mockResolvedValue(mockFileData)
}))

vi.mock('@/lib/never-throw', async () => {
  const actual = await vi.importActual('@/lib/never-throw')
  return {
    ...actual,
    isFail: vi.fn((result) => result.error !== null),
    isOk: vi.fn((result) => result.error === null),
    // ... other mocks
  }
})

// Global test setup
beforeAll(async () => {
  // Set test environment variables
  process.env.STORAGE_BUCKET_NAME = 'test-bucket'
  // ... other test config
})

afterAll(() => {
  vi.restoreAllMocks()
})
```

### Mocking Patterns
```typescript
// 1. Mock external services at module level
vi.mock('@/lib/external-service', () => ({
  externalFunction: vi.fn().mockResolvedValue('expected-result')
}))

// 2. Mock with implementation
vi.mock('@/utils/helper', async () => {
  const actual = await vi.importActual('@/utils/helper')
  return {
    ...actual,
    complexFunction: vi.fn().mockImplementation((input) => {
      if (input === 'valid') return 'success'
      throw new Error('Invalid input')
    })
  }
})

// 3. Reset mocks between tests
beforeEach(() => {
  vi.clearAllMocks()
})
```

### Test Data Builders
```typescript
// Create consistent test data
const buildUserRequest = (overrides = {}) => ({
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User',
  ...overrides
})

const mockPresignedUrl = 'https://bucket.s3.amazonaws.com/file?signature=abc'

const expectedSuccessResponse = (data) => ({
  status: 'success',
  data,
  timestamp: expect.any(String)
})
```

---

## 🏗️ Code Architecture Patterns

### Route Separation
```
src/routes/
├── auth.ts          # Authentication endpoints
├── files.ts         # File management endpoints
├── health.ts        # Health check endpoints
└── ping.ts          # Simple ping endpoint
```

### Route Implementation Pattern
```typescript
import { Elysia } from 'elysia'
import { businessLogic } from '@/services/business-logic'
import { isFail, tryCatch } from '@/lib/never-throw'

export default new Elysia()
  .post('/endpoint', async ({ body, set }) => {
    // 1. Validate input
    const { field } = body as { field: string }
    if (!field) {
      set.status = 400
      return { error: 'Field is required.' }
    }

    // 2. Execute business logic with error handling
    const result = await tryCatch(async () => {
      return await businessLogic(field)
    })

    // 3. Handle result
    if (isFail(result)) {
      console.error(`Error in operation: ${JSON.stringify(result.error)}`)
      set.status = 500
      return { error: 'Operation failed.' }
    }

    // 4. Return success
    return { data: result.data }
  })
```

### Business Logic Separation
```typescript
// src/services/business-logic.ts
import { neverThrowPattern } from '@/lib/never-throw'

export const businessLogic = async (input: string) => {
  // Business logic without HTTP concerns
  const processed = await externalService(input)
  return validateAndTransform(processed)
}

// src/routes/endpoint.ts
// Only handles HTTP concerns
```

### Error Handling Pattern (Never-Throw)
```typescript
// lib/never-throw.ts
type Result<S, E> =
  | { data: S; error: null }    // Success
  | { data: null; error: E }    // Error

export const ok = <S>(data: S): Result<S, never> => ({ data, error: null })
export const fail = <E>(error: E): Result<never, E> => ({ data: null, error })

export const isOk = <S, E>(result: Result<S, E>): result is { data: S; error: null } =>
  result.error === null

export const isFail = <S, E>(result: Result<S, E>): result is { data: null; error: E } =>
  result.error !== null

export const tryCatch = async <S, E = Error>(
  fn: () => Promise<S>
): Promise<Result<S, E>> => {
  try {
    return ok(await fn())
  } catch (error) {
    return fail(error as E)
  }
}

// Usage in business logic
const processFile = async (file: File): Promise<Result<FileMetadata, Error>> => {
  return tryCatch(async () => {
    const uploadResult = await uploadToS3(file)
    return createMetadata(uploadResult)
  })
}
```

---

## 🔧 Environment & Configuration

### Environment Variable Pattern
```typescript
// utils/config.ts
const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key]
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${key} is required`)
  }
  return value || defaultValue!
}

export const config = {
  bucket: getEnv('STORAGE_BUCKET_NAME'),
  region: getEnv('STORAGE_DEFAULT_REGION', 'us-east-1'),
  endpoint: getEnv('STORAGE_ENDPOINT_URL'),
  // ... other config
}
```

### Validation Pattern
```typescript
// In routes
if (!process.env.REQUIRED_VAR) {
  set.status = 500
  return { error: 'Server configuration error.' }
}
```

---

## 📊 API Testing Requirements

### Test Every Endpoint For:
1. **Success Response**
   ```typescript
   it('should return 200 with data on success', async () => {
     const response = await app.handle(validRequest)
     expect(response.status).toBe(200)
     expect(await response.json()).toHaveProperty('expectedField')
   })
   ```

2. **Validation Errors**
   ```typescript
   it('should return 400 for missing required field', async () => {
     const response = await app.handle(invalidRequest)
     expect(response.status).toBe(400)
     expect(await response.json()).toEqual({
       error: 'Field is required.'
     })
   })
   ```

3. **Server Errors**
   ```typescript
   it('should return 500 when service fails', async () => {
     mockExternalService.mockRejectedValue(new Error('Service down'))
     const response = await app.handle(validRequest)
     expect(response.status).toBe(500)
     expect(await response.json()).toEqual({
       error: 'Operation failed.'
     })
   })
   ```

4. **Edge Cases**
   ```typescript
   it('should handle empty array', async () => {
     const response = await app.handle(requestWithEmptyArray)
     expect(response.status).toBe(200)
     // ... assertions
   })
   ```

### HTTP Status Code Standards
- `200` - Success with data
- `201` - Resource created successfully
- `400` - Client error (validation, malformed request)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not found
- `500` - Server error (unexpected failures)

---

## 📋 PRD Management

### When Adding New Features
```bash
# 1. Always update PRD files when new features come
# 2. Update both PRD.md and PRD_RPG.md
# 3. Follow the existing structure and patterns
# 4. Add new capabilities, features, and scenarios
```

### PRD Update Requirements
- **Update PRD.md**: Add new features to core capabilities
- **Update PRD_RPG.md**: Add dependency chains and module definitions
- **Update Test Strategy**: Add new test scenarios
- **Update Architecture**: Add new system components
- **Update Risks**: Add new technical and scope risks

### PRD Section Updates
```markdown
# In PRD.md - Add to existing sections:
## Core Features
**New Feature Name**
- What it does: [Description]
- Why it's important: [Business value]
- How it works: [Technical implementation]

# In PRD_RPG.md - Add to capability tree:
### Capability: New Capability
**Feature: New Feature**
- **Description**: [What it does]
- **Inputs**: [Required inputs]
- **Outputs**: [Expected outputs]
- **Behavior**: [How it works]
```

---

## 🚀 Development Workflow

### Starting New Features
1. **Update PRD files first**
   ```bash
   # Add new features to PRD.md and PRD_RPG.md
   # Document new capabilities, dependencies, and test scenarios
   ```

2. **Write BDD test first**
   ```bash
   # Create test file
   touch test/new-feature.bdd.test.ts
   
   # Write failing tests describing desired behavior
   # Run tests to verify they fail
   npm test new-feature.bdd.test.ts
   ```

3. **Implement minimal code**
   ```bash
   # Write just enough code to pass tests
   # Focus on the test requirements only
   ```

4. **Refactor and improve**
   ```bash
   # Keep tests green while improving code
   npm test  # Should always be green before commit
   ```

5. **Update PRD with implementation details**
   ```bash
   # Add technical implementation notes to PRD
   # Update test strategy with actual test coverage
   # Document any new dependencies or risks discovered
   ```

### Before Commit Checklist
```bash
# 1. All tests pass
npm test

# 2. Linting passes
npm run lint

# 3. Format code
npm run format

# 4. Coverage is acceptable
npm run test:coverage

# 5. No console.log in production code
# 6. Environment variables are validated
# 7. Error handling is comprehensive
```

---

## 🔍 Test Coverage Goals

### Coverage Requirements
- **Line Coverage**: 85% minimum
- **Branch Coverage**: 80% minimum
- **Function Coverage**: 95% minimum
- **Statement Coverage**: 85% minimum

### Critical Test Scenarios
```typescript
// Always test these patterns:

// 1. Happy path
describe('Happy Path', () => {
  it('should work with valid input', () => {
    // Test normal operation
  })
})

// 2. Error handling
describe('Error Handling', () => {
  it('should return proper error for invalid input', () => {
    // Test error scenarios
  })
})

// 3. Edge cases
describe('Edge Cases', () => {
  it('should handle empty input', () => {
    // Test boundary conditions
  })
})

// 4. Integration
describe('Integration', () => {
  it('should work with external services', () => {
    // Test end-to-end workflows
  })
})
```

---

## 📝 Code Review Checklist

### Code Quality
- [ ] Tests written first (TDD)
- [ ] BDD scenarios describe business behavior
- [ ] Error handling with never-throw pattern
- [ ] Environment variables validated
- [ ] No console.log in production code
- [ ] Consistent error response format
- [ ] Proper HTTP status codes

### Test Quality
- [ ] Tests cover success, error, and edge cases
- [ ] Mocks are isolated and reset properly
- [ ] Test names describe behavior, not implementation
- [ ] Tests are independent and can run in any order
- [ ] All tests pass (green state)

### Architecture
- [ ] Business logic separated from HTTP handling
- [ ] Routes organized by functionality
- [ ] External dependencies properly mocked
- [ ] Configuration managed through environment variables

---

## 🎯 Summary of Best Practices

### PRD Management
1. **Always update PRD files** - Keep documentation synchronized with features
2. **Follow existing structure** - Maintain consistency across PRD updates
3. **Document dependencies** - Add new capability chains and module definitions
4. **Update test strategy** - Include new test scenarios and coverage requirements

### TDD/BDD
1. **Always write tests first** - Let them fail, then make them pass
2. **Use BDD language** - Tests describe behavior, not implementation
3. **Keep tests green** - Never commit on red tests
4. **Test boundaries** - Success, error, and edge cases

### Code Architecture
1. **Separate concerns** - HTTP handling vs business logic
2. **Use never-throw pattern** - Safe error handling with Result types
3. **Validate environment** - Fail fast on missing configuration
4. **Consistent error format** - Standardized error responses

### Testing
1. **Mock external dependencies** - Isolate unit under test
2. **Reset mocks between tests** - Prevent test pollution
3. **Build test data builders** - Create consistent test data
4. **Test real scenarios** - Include integration tests

### Development Process
1. **Red-Green-Refactor** - Follow TDD cycle strictly
2. **Run tests frequently** - Fail fast, fix fast
3. **Review code quality** - Use checklists and standards
4. **Document patterns** - Share knowledge through examples

---

## 📚 Quick Reference Commands

```bash
# Run all tests
npm test

# Run specific test file
npm test feature-name.bdd.test.ts

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm run test:coverage

# Run with UI
npm run test:ui

# Run linting
npm run lint

# Format code
npm run format
```

---

**Remember**: Code is written once, but read and maintained many times. Write tests that serve as documentation and specifications for future developers.