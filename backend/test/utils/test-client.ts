import type { TestClient } from 'vitest'
import { Elysia } from 'elysia'
import { createServer } from 'http'

// Create a test client for Elysia apps
export const createElysiaTestClient = (app: Elysia): TestClient => {
  const server = createServer(app.handle)
  return {
    get: (url) => request('GET', url, server),
    post: (url, body) => request('POST', url, server, body),
    put: (url, body) => request('PUT', url, server, body),
    patch: (url, body) => request('PATCH', url, server, body),
    delete: (url) => request('DELETE', url, server),
  } as TestClient
}

// Helper function to make HTTP requests
const request = (
  method: string,
  url: string,
  server: any,
  body?: any,
): Promise<{ status: number; body: any; headers: Record<string, string> }> => {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url, 'http://localhost')
    const options = {
      hostname: 'localhost',
      port: urlObj.port || 3000,
      path: urlObj.pathname + urlObj.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(body && { 'Content-Length': Buffer.byteLength(JSON.stringify(body)) }),
      },
    }

    const req = server.request(options, (res: any) => {
      let data = ''
      res.on('data', (chunk: string) => {
        data += chunk
      })
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body: data ? JSON.parse(data) : null,
          headers: res.headers,
        })
      })
    })

    req.on('error', reject)

    if (body) {
      req.write(JSON.stringify(body))
    }

    req.end()
  })
}

// Test data builders
export const buildPresignedUrlRequest = (key: string = 'test-file.txt') => ({
  key,
})

export const buildFileDownloadRequest = (filename: string = 'test-file.txt') => ({
  filename,
})

export const expectedPresignedUrlResponse = (presignedUrl: string) => ({
  presignedUrl,
})

export const expectedFileDownloadResponse = (contentType: string = 'text/plain', contentLength: number = 16) => ({
  ContentType: contentType,
  ContentLength: contentLength,
})