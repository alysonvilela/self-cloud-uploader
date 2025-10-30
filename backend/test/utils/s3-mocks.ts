import { vi } from 'vitest'
import type { S3Client } from '@aws-sdk/client-s3'
import type { GetObjectCommandOutput } from '@aws-sdk/client-s3'

// Mock S3 Client
export const mockS3Client = {
  send: vi.fn(),
} as unknown as S3Client

// Mock S3 Commands
export const mockPutObjectCommand = vi.fn()
export const mockGetObjectCommand = vi.fn()
export const mockGetSignedUrl = vi.fn()

// Mock S3 responses
export const mockPresignedUrlResponse = 'https://test-bucket.s3.amazonaws.com/test-file?X-Amz-Signature=test'
export const mockGetObjectResponse: GetObjectCommandOutput = {
  Body: {
    on: vi.fn((event: string, callback: (chunk: Buffer) => void) => {
      if (event === 'data') {
        // Simulate file content
        callback(Buffer.from('test file content'))
      }
      if (event === 'end') {
        callback(Buffer.from(''))
      }
    }),
    pipe: vi.fn(),
  } as any,
  ContentType: 'text/plain',
  ContentLength: 16,
}

// Reset all mocks
export const resetS3Mocks = () => {
  mockS3Client.send.mockReset()
  mockPutObjectCommand.mockReset()
  mockGetObjectCommand.mockReset()
  mockGetSignedUrl.mockReset()
}