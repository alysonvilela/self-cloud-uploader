import { vi } from 'vitest'
import dotenv from 'dotenv'

// Load test environment variables
dotenv.config({ path: '.env.test' })

// Mock console methods to reduce test noise
vi.spyOn(console, 'error').mockImplementation(() => {})
vi.spyOn(console, 'log').mockImplementation(() => {})

// Mock S3 operations
const mockPresignedUrl = 'https://test-bucket.s3.amazonaws.com/test-file?X-Amz-Signature=test'
const mockFileData = {
  Body: {
    on: vi.fn((event: string, callback: (chunk: Buffer) => void) => {
      if (event === 'data') callback(Buffer.from('file content'))
      if (event === 'end') callback(Buffer.from(''))
    }),
    pipe: vi.fn()
  },
  ContentType: 'text/plain',
  ContentLength: 12
}

// Mock the S3 operations module
vi.mock('@/utils/s3', () => ({
  generatePresignedUrlForUpload: vi.fn().mockResolvedValue(mockPresignedUrl),
  downloadFile: vi.fn().mockResolvedValue(mockFileData)
}))

// Mock the never-throw module to always return success for basic tests
vi.mock('@/lib/never-throw', () => ({
  isFail: vi.fn().mockReturnValue(false),
  tryCatch: vi.fn().mockImplementation(async (fn) => {
    try {
      const result = await fn()
      return { data: result, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }),
  isOk: vi.fn().mockReturnValue(true),
  ok: vi.fn(),
  fail: vi.fn()
}))

// Global test setup
beforeAll(async () => {
  // Set up test environment variables
  process.env.STORAGE_BUCKET_NAME = 'test-bucket'
  process.env.STORAGE_DEFAULT_REGION = 'us-east-1'
  process.env.STORAGE_ENDPOINT_URL = 'http://localhost:9000'
  process.env.STORAGE_ACCESS_KEY_ID = 'test-access-key'
  process.env.STORAGE_SECRET_ACCESS_KEY = 'test-secret-key'
})

// Global test teardown
afterAll(async () => {
  vi.restoreAllMocks()
})