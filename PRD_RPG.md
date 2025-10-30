# Repository Planning Graph (RPG) Method - PRD for Backuper

## Problem Statement
Organizations and individuals struggle with implementing secure, scalable file storage in applications due to:
- Complex AWS S3 integration requiring credential management
- Inefficient file upload workflows for large files
- Lack of proper file metadata management and search capabilities
- Difficult local development environments that don't mirror production S3 behavior
- No simple solution for drag-and-drop file uploads with progress tracking

## Target Users
- **Software Developers**: Need to build file upload functionality without managing AWS credentials
- **Digital Marketing Teams**: Managing large media assets (images, videos, documents) with metadata
- **Content Creators**: Storing and organizing digital content with proper organization
- **Small Business Owners**: Simple, reliable file backup and sharing solutions
- **DevOps Engineers**: Need consistent local/production S3 environments for testing

## Success Metrics
- 95% successful upload completion rate for files up to 100MB
- < 2 second average file list retrieval with 10,000+ files
- < 5% user-reported issues with file operations
- Zero data loss incidents
- 99.9% uptime for file access operations

---

## Capability Tree

### Capability: File Storage Management
Secure, scalable storage of files with metadata tracking and retrieval

#### Feature: Presigned URL Generation
- **Description**: Generate temporary, secure URLs for direct S3 file uploads and downloads
- **Inputs**: File key/filename, upload type (upload/download), expiration time
- **Outputs**: Presigned URL with embedded authentication and expiration
- **Behavior**: Uses AWS SDK to create time-limited, authenticated URLs that bypass need for user credentials

#### Feature: File Upload Processing
- **Description**: Handle client-side file uploads through presigned URLs with metadata capture
- **Inputs**: File data, client metadata (original name, MIME type, size), user context
- **Outputs**: Successful upload confirmation with file ID and metadata persistence
- **Behavior**: Coordinate between client upload and server-side metadata storage, handle retry logic

#### Feature: File Retrieval & Download
- **Description**: Serve files from S3 storage with proper content types and streaming
- **Inputs**: File identifier or S3 key, download preferences
- **Outputs**: File stream with appropriate headers, download response
- **Behavior**: Retrieve from S3, set correct headers, handle partial downloads if supported

#### Feature: File Metadata Management
- **Description**: Store and query file information (name, size, type, timestamps, ownership)
- **Inputs**: File metadata object, search/filter criteria, pagination parameters
- **Outputs**: Structured file records, search results with pagination
- **Behavior**: CRUD operations on metadata, implement search, filtering, and pagination logic

### Capability: User Interface & Experience
Intuitive web interface for file management with modern UX patterns

#### Feature: Drag-and-Drop File Upload
- **Description**: Browser-based file upload with visual feedback and progress tracking
- **Inputs**: Files dropped by user, upload configuration
- **Outputs**: Upload progress indicators, success/error notifications
- **Behavior**: Use Uppy.js for modern upload UX, show real-time progress, handle multiple files

#### Feature: File Listing & Search
- **Description**: Display stored files with search, filtering, and pagination capabilities
- **Inputs**: Search query, filter criteria, page configuration
- **Outputs**: Paginated file list with metadata columns
- **Behavior**: React-based table with search, sort, pagination using React Query patterns

#### Feature: Responsive Dashboard
- **Description**: Mobile-friendly file management interface with accessible design
- **Inputs**: User screen size, accessibility preferences
- **Outputs**: Responsive layout optimized for device capabilities
- **Behavior**: CSS Tailwind-based responsive design, accessibility compliance

### Capability: Data Persistence & Query
Reliable storage and efficient retrieval of file metadata and relationships

#### Feature: Database Schema Management
- **Description**: PostgreSQL schema for users, files, folders with proper relationships
- **Inputs**: Database connection, schema definitions
- **Outputs**: Structured tables with foreign keys and constraints
- **Behavior**: Drizzle ORM-based schema definition, migrations, seeding

#### Feature: CRUD Operations
- **Description**: Create, read, update, delete operations on file metadata and entities
- **Inputs**: Operation type, entity data, query parameters
- **Outputs**: Operation results, affected records, error handling
- **Behavior**: Type-safe database operations with error handling and validation

#### Feature: Search & Filtering Engine
- **Description**: Efficient text search and filtering across file metadata
- **Inputs**: Search query, filter criteria, sort parameters
- **Outputs**: Matched records sorted by relevance or criteria
- **Behavior**: SQL WHERE clauses with LIKE, pagination, result limiting

### Capability: Development & Deployment
Developer tooling and deployment configuration for consistent environments

#### Feature: Local Development Environment
- **Description**: Docker Compose setup with MinIO for S3-compatible local development
- **Inputs**: Development configuration, service dependencies
- **Outputs**: Running local services (MinIO, PostgreSQL, backend API)
- **Behavior**: docker-compose.dev.yml orchestrates local services with hot reload

#### Feature: Production Deployment
- **Description**: Production-ready Docker deployment with proper scaling and security
- **Inputs**: Production environment variables, deployment configuration
- **Outputs**: Deployed application with monitoring and health checks
- **Behavior**: Multi-stage Docker builds, environment variable management

#### Feature: API Integration
- **Description**: RESTful API design for third-party integrations and client applications
- **Inputs**: HTTP requests with proper content types and authentication
- **Outputs**: JSON responses with proper status codes and error handling
- **Behavior**: Elysia.js framework with typed routes, CORS configuration, error middleware

---

## Repository Structure

```
backuper/
├── backend/                    # Backend API service
│   ├── src/
│   │   ├── lib/               # Shared utilities
│   │   │   ├── never-throw.ts # Error handling patterns
│   │   │   └── s3.ts         # S3 client configuration
│   │   ├── routes/           # API endpoints
│   │   │   ├── root.ts       # Root/health endpoints
│   │   │   ├── ping.ts       # Liveness probe
│   │   │   ├── healthz.ts    # Health check
│   │   │   ├── presigned-url.ts # Upload URL generation
│   │   │   └── files.ts      # File management
│   │   ├── utils/            # Business logic
│   │   │   └── s3.ts        # S3 operations
│   │   └── app.ts           # Application setup
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── frontend/                   # React web application
│   ├── src/
│   │   ├── components/       # React components
│   │   │   └── FilesTable.tsx # File listing component
│   │   ├── db/              # Database schema/types
│   │   │   ├── drizzle.ts   # Database client
│   │   │   └── schema.ts    # Type definitions
│   │   ├── App.tsx          # Main application
│   │   ├── index.tsx        # Entry point
│   │   └── index.css        # Global styles
│   ├── package.json
│   └── Dockerfile
├── templates/                 # Documentation templates
├── docker-compose.dev.yml    # Local development
├── docker-compose.yml        # Production deployment
└── README.md
```

## Module Definitions

### Module: S3 Storage Service
- **Maps to capability**: File Storage Management
- **Responsibility**: Handle all S3 operations including presigned URL generation and file transfers
- **File structure**:
  ```
  src/lib/s3.ts           # S3 client configuration and utilities
  src/utils/s3.ts         # Business logic for S3 operations
  ```
- **Exports**:
  - `getS3Client()` - Configured S3 client instance
  - `generatePresignedUrlForUpload(key)` - Upload URL generator
  - `downloadFile(key)` - File retrieval function

### Module: File Management API
- **Maps to capability**: File Storage Management, Data Persistence
- **Responsibility**: REST endpoints for file operations and metadata management
- **File structure**:
  ```
  src/routes/presigned-url.ts  # Upload URL generation endpoint
  src/routes/files.ts         # File CRUD operations
  src/routes/healthz.ts       # Health monitoring
  ```
- **Exports**:
  - POST `/presigned-url` - Generate upload URLs
  - GET `/files` - List files with pagination/search
  - GET `/files/:filename` - Download file
  - POST `/files` - Create file metadata

### Module: Frontend File Interface
- **Maps to capability**: User Interface & Experience
- **Responsibility**: React-based web interface for file management
- **File structure**:
  ```
  src/components/FilesTable.tsx  # File listing with search/pagination
  src/App.tsx                    # Main upload interface
  ```
- **Exports**:
  - `FilesTable` - File listing component with search
  - `App` - Main application with drag-and-drop upload
  - File upload integration with Uppy.js

### Module: Database Layer
- **Maps to capability**: Data Persistence & Query
- **Responsibility**: Type-safe database operations and schema management
- **File structure**:
  ```
  src/db/schema.ts     # Drizzle schema definitions
  src/db/drizzle.ts    # Database client configuration
  ```
- **Exports**:
  - `users` - User table schema
  - `files` - File metadata table schema
  - `folders` - Folder hierarchy table schema

### Module: Error Handling & Utilities
- **Maps to capability**: Development & Deployment
- **Responsibility**: Shared utilities and error handling patterns
- **File structure**:
  ```
  src/lib/never-throw.ts  # Error handling utilities
  ```
- **Exports**:
  - `tryCatch()` - Safe async operation wrapper
  - `isFail()` - Result type checker

---

## Dependency Chain

### Foundation Layer (Phase 0)
No dependencies - these are built first.

- **Database Schema**: Defines core entities (users, files, folders) and relationships
- **Error Handling Utilities**: Provides safe async patterns and error management
- **S3 Client Configuration**: Establishes connection to S3-compatible storage service

### Infrastructure Layer (Phase 1)
- **S3 Operations Utility**: Depends on [Database Schema, Error Handling, S3 Client]
  - Implements presigned URL generation using configured S3 client
  - Provides file download functionality with error handling
- **File Management API**: Depends on [Database Schema, S3 Operations, Error Handling]
  - REST endpoints for file operations
  - Metadata persistence and retrieval

### Frontend Layer (Phase 2)
- **Frontend Components**: Depends on [File Management API]
  - React components for file listing and management
  - Integration with backend APIs for data display
  - Uppy.js integration for drag-and-drop uploads

### Integration Layer (Phase 3)
- **Full Application Integration**: Depends on [Frontend Components, File Management API]
  - End-to-end file upload workflow
  - Complete user interface with search and pagination
  - Production deployment configuration

---

## Development Phases

### Phase 0: Foundation
**Goal**: Establish core infrastructure and data models

**Entry Criteria**: Clean repository with basic structure

**Tasks**:
- [ ] Implement database schema with users, files, folders tables (depends on: none)
  - Acceptance criteria: Drizzle ORM schema compiles without errors
  - Test strategy: Schema validation with TypeScript compilation
- [ ] Create error handling utilities with never-throw pattern (depends on: none)
  - Acceptance criteria: tryCatch wrapper handles async errors safely
  - Test strategy: Unit tests for error scenarios
- [ ] Configure S3 client with MinIO compatibility (depends on: none)
  - Acceptance criteria: S3 client connects to MinIO in development
  - Test strategy: Connection test to MinIO endpoint

**Exit Criteria**: Database schema compiles, error utilities work, S3 client connects successfully

**Delivers**: Type-safe database models, robust error handling, S3 connectivity

---

### Phase 1: Backend Services
**Goal**: Implement core file storage and management functionality

**Entry Criteria**: Phase 0 foundation complete

**Tasks**:
- [ ] Build S3 operations utility with presigned URL generation (depends on: [database schema, error handling, s3 client])
  - Acceptance criteria: generatePresignedUrlForUpload() returns valid URLs
  - Test strategy: Generate URLs and validate format/expiration
- [ ] Implement presigned URL API endpoint (depends on: [s3 operations utility])
  - Acceptance criteria: POST /presigned-url returns upload URLs
  - Test strategy: API tests with various file types and sizes
- [ ] Create file metadata persistence with pagination/search (depends on: [database schema, s3 operations])
  - Acceptance criteria: File metadata stored and retrieved with search
  - Test strategy: CRUD operations on file metadata
- [ ] Build file download API with proper content headers (depends on: [s3 operations utility])
  - Acceptance criteria: GET /files/:filename streams file with correct headers
  - Test strategy: Download test files and verify content integrity

**Exit Criteria**: Complete backend API with file upload/download and metadata management

**Delivers**: Working file storage API with presigned URLs and metadata persistence

---

### Phase 2: Frontend Interface
**Goal**: Create user-friendly web interface for file management

**Entry Criteria**: Phase 1 backend API complete and functional

**Tasks**:
- [ ] Build file listing component with search and pagination (depends on: [file management api])
  - Acceptance criteria: Files displayed in table with search, sort, pagination
  - Test strategy: Component rendering with mock data, search functionality
- [ ] Integrate Uppy.js for drag-and-drop file uploads (depends on: [presigned url api])
  - Acceptance criteria: Files upload via drag-and-drop with progress indicators
  - Test strategy: Upload test files of various sizes and types
- [ ] Create responsive layout with Tailwind CSS (depends on: [file listing component])
  - Acceptance criteria: Interface works on mobile and desktop
  - Test strategy: Browser testing across device sizes
- [ ] Implement error handling and user feedback (depends on: [uppy integration])
  - Acceptance criteria: Upload errors show user-friendly messages
  - Test strategy: Simulate network errors and verify handling

**Exit Criteria**: Complete web interface for file management with upload and listing

**Delivers**: Production-ready file management web application

---

### Phase 3: Production Deployment
**Goal**: Deploy complete application with proper infrastructure

**Entry Criteria**: Phase 2 frontend interface complete

**Tasks**:
- [ ] Configure production Docker deployment (depends on: [frontend interface, backend api])
  - Acceptance criteria: Application builds and runs in production containers
  - Test strategy: Full deployment test with health checks
- [ ] Set up MinIO production configuration with proper security (depends on: [docker deployment])
  - Acceptance criteria: S3 storage accessible with proper authentication
  - Test strategy: Upload/download test in production environment
- [ ] Implement health monitoring and logging (depends on: [production config])
  - Acceptance criteria: Health endpoints respond, logs capture errors
  - Test strategy: Simulate failures and verify monitoring
- [ ] Create development environment documentation (depends on: [all components])
  - Acceptance criteria: New developers can run project locally
  - Test strategy: Fresh clone and setup verification

**Exit Criteria**: Production-ready deployment with monitoring and documentation

**Delivers**: Complete, deployable file storage platform

---

## Test Pyramid

```
        /\
       /E2E\     ← 10% (End-to-end file upload/download workflows)
      /------\
     /Integration\ ← 30% (API endpoints, database operations, S3 interactions)
    /------------\
   /  Unit Tests  \ ← 60% (Individual functions, components, utilities)
  /----------------\
```

## Coverage Requirements
- Line coverage: 80% minimum
- Branch coverage: 75% minimum
- Function coverage: 90% minimum
- Statement coverage: 80% minimum

## Critical Test Scenarios

### S3 Operations
**Happy path**:
- Upload small file (< 1MB) and verify metadata storage
- Expected: Successful upload, metadata persisted, presigned URL works

**Edge cases**:
- Upload empty file (0 bytes)
- Expected: File stored with size 0, metadata reflects empty file

**Error cases**:
- S3 service unavailable during upload
- Expected: Graceful failure with retry option

**Integration points**:
- Presigned URL generation with file upload flow
- Expected: Generated URLs work for actual S3 uploads

### File Management API
**Happy path**:
- Create file metadata after successful S3 upload
- Expected: Metadata record created with correct associations

**Edge cases**:
- Search with non-existent query
- Expected: Empty results with proper pagination

**Error cases**:
- Invalid file metadata (missing required fields)
- Expected: Validation error with clear message

**Integration points**:
- API endpoints with database operations
- Expected: CRUD operations work end-to-end

### Frontend Components
**Happy path**:
- Upload multiple files via drag-and-drop
- Expected: All files upload successfully with progress tracking

**Edge cases**:
- Very large files (100MB+)
- Expected: Upload works with reasonable progress feedback

**Error cases**:
- Network interruption during upload
- Expected: Retry mechanism and user notification

**Integration points**:
- Frontend-backend communication
- Expected: API calls work with proper error handling

## Test Generation Guidelines
- Focus on file upload/download workflows as primary user paths
- Test S3 presigned URL generation and usage patterns
- Verify database operations with realistic file metadata scenarios
- Include accessibility testing for file management interface
- Test responsive design across mobile and desktop breakpoints
- Verify CORS and security headers in API responses

---

## System Components

### Backend API Service (Elysia.js)
- **Responsibility**: REST API serving file operations, presigned URL generation, metadata management
- **Technology**: Node.js with TypeScript, Elysia.js framework
- **Key Features**: Type-safe routes, middleware for CORS and error handling, integration with S3

### Frontend Web Application (React)
- **Responsibility**: User interface for file management, drag-and-drop uploads, file listing
- **Technology**: React with TypeScript, Tailwind CSS, Uppy.js for uploads
- **Key Features**: Responsive design, real-time progress tracking, search and pagination

### S3-Compatible Storage (MinIO/AWS S3)
- **Responsibility**: Actual file storage and retrieval
- **Technology**: MinIO for development, AWS S3 for production
- **Key Features**: Presigned URL support, multipart uploads, consistent API

### PostgreSQL Database
- **Responsibility**: File metadata storage and relationships
- **Technology**: PostgreSQL with Drizzle ORM
- **Key Features**: Type-safe queries, schema migrations, relationships between entities

## Data Models

### Users
- **Purpose**: Track file ownership and access control
- **Fields**: id (primary key), name, created_at
- **Relationships**: Many files per user

### Files
- **Purpose**: Store file metadata and S3 references
- **Fields**: id, original_name, s3_key, mime_type, size, user_id, folder_id, created_at
- **Relationships**: Belongs to user, optionally belongs to folder

### Folders
- **Purpose**: Organize files in hierarchical structure
- **Fields**: id, name, parent_id, created_at
- **Relationships**: Can contain files and other folders (hierarchical)

## Technology Stack

**Backend Framework: Elysia.js**
- **Rationale**: Fast, modern Node.js framework with excellent TypeScript support and built-in plugins
- **Trade-offs**: Less mature ecosystem compared to Express.js, but superior performance and developer experience
- **Alternatives considered**: Express.js, Fastify

**Frontend Framework: React**
- **Rationale**: Industry standard with extensive ecosystem and library support
- **Trade-offs**: Larger bundle size than alternatives, but superior developer tools and community
- **Alternatives considered**: Vue.js, Svelte

**Database ORM: Drizzle**
- **Rationale**: Type-safe, SQL-first approach with excellent TypeScript support
- **Trade-offs**: Less magic than ORMs like Prisma, but better performance and explicit control
- **Alternatives considered**: Prisma, TypeORM

**File Upload Library: Uppy.js**
- **Rationale**: Modern, extensible upload library with excellent React integration
- **Trade-offs**: Additional dependency but provides robust upload functionality
- **Alternatives considered**: React Dropzone, native file inputs

**Storage: S3-Compatible (MinIO/AWS S3)**
- **Rationale**: Industry-standard object storage with excellent scalability and reliability
- **Trade-offs**: Vendor lock-in but provides enterprise-grade features
- **Alternatives considered**: Local filesystem, other cloud storage providers

---

## Technical Risks

**Risk**: S3 presigned URL generation failures in production
- **Impact**: High - core upload functionality broken
- **Likelihood**: Medium - authentication or configuration issues
- **Mitigation**: Comprehensive testing of presigned URL generation, fallback error handling
- **Fallback**: Direct upload to backend with proxy to S3

**Risk**: Large file uploads causing memory issues
- **Impact**: Medium - affects user experience for large files
- **Likelihood**: High - common issue with large file handling
- **Mitigation**: Streaming uploads, chunked upload support with Uppy.js
- **Fallback**: File size limits with clear user messaging

**Risk**: Database performance issues with large file collections
- **Impact**: Medium - slow file listing and search
- **Likelihood**: Medium - scales with data volume
- **Mitigation**: Proper indexing, pagination optimization, database query optimization
- **Fallback**: Search functionality limitation or caching layer

## Dependency Risks

**Risk**: MinIO compatibility issues in production S3 migration
- **Impact**: Medium - differences between MinIO and AWS S3 APIs
- **Likelihood**: Low - well-established compatibility
- **Mitigation**: Extensive testing with AWS S3 in staging environment
- **Fallback**: Separate development and production S3 configurations

**Risk**: React and dependency updates breaking compatibility
- **Impact**: Low - manageable with proper versioning
- **Likelihood**: Medium - typical for frontend projects
- **Mitigation**: Lock file management, staged dependency updates, comprehensive testing
- **Fallback**: Pin dependency versions with scheduled update cycles

## Scope Risks

**Risk**: Feature creep beyond core file storage functionality
- **Impact**: Medium - delivery timeline and complexity increase
- **Likelihood**: Medium - common in file management projects
- **Mitigation**: Strict adherence to PRD scope, feature request prioritization process
- **Fallback**: Version-based feature releases, clear MVP boundaries

**Risk**: Underestimating complexity of search and pagination
- **Impact**: Low - non-critical features but affects user experience
- **Likelihood**: Medium - database query optimization required
- **Mitigation**: Prototype search functionality early, test with realistic data volumes
- **Fallback**: Basic search with client-side filtering for small datasets

---

## References
- [Elysia.js Documentation](https://elysiajs.com/) - Backend framework documentation
- [Uppy.js Documentation](https://uppy.io/) - File upload library guide
- [AWS S3 Presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html) - Official AWS documentation
- [Drizzle ORM Documentation](https://orm.drizzle.team/) - Database ORM guide
- [MinIO Documentation](https://min.io/docs/) - S3-compatible storage

## Glossary
- **Presigned URL**: Temporary, authenticated URL that allows direct S3 operations without user credentials
- **Metadata**: Information about files (name, size, type, timestamps) stored in database
- **S3 Key**: Unique identifier for objects in S3 storage
- **Upload Progress**: Real-time tracking of file upload completion percentage
- **Drag-and-Drop**: User interaction pattern for selecting and uploading files

## Open Questions
1. What are the expected concurrent user requirements for production deployment?
2. Should the system support user authentication and multi-tenancy?
3. What file size limits should be enforced for uploads?
4. Should backup and recovery procedures be implemented?
5. What monitoring and alerting systems will be used in production?

---

# How Task Master Uses This PRD

When you run `task-master parse-prd PRD_RPG.md`, the parser:

1. **Extracts capabilities** → Main tasks
   - Each `### Capability:` becomes a top-level task

2. **Extracts features** → Subtasks
   - Each `#### Feature:` becomes a subtask under its capability

3. **Parses dependencies** → Task dependencies
   - `Depends on: [X, Y]` sets task.dependencies = ["X", "Y"]

4. **Orders by phases** → Task priorities
   - Phase 0 tasks = highest priority
   - Phase N tasks = lower priority, properly sequenced

5. **Uses test strategy** → Test generation context
   - Feeds test scenarios to Surgical Test Generator during implementation

**Result**: A dependency-aware task graph that can be executed in topological order.

## Why RPG Structure Matters

Traditional flat PRDs lead to:
- ❌ Unclear task dependencies
- ❌ Arbitrary task ordering
- ❌ Circular dependencies discovered late
- ❌ Poorly scoped tasks

RPG-structured PRDs provide:
- ✅ Explicit dependency chains
- ✅ Topological execution order
- ✅ Clear module boundaries
- ✅ Validated task graph before implementation

## Tips for Best Results

1. **Spend time on dependency graph** - This is the most valuable section for Task Master
2. **Keep features atomic** - Each feature should be independently testable
3. **Progressive refinement** - Start broad, use `task-master expand` to break down complex tasks
4. **Use research mode** - `task-master parse-prd --research` leverages AI for better task generation