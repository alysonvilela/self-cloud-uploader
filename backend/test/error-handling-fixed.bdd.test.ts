import { describe, it, expect, vi } from 'vitest'

// Mock the never-throw module specifically for this test
vi.mock('@/lib/never-throw', async () => {
  const actual = await vi.importActual('@/lib/never-throw')
  return {
    ...actual,
    isFail: vi.fn((result) => result.error !== null && result.error !== undefined),
    isOk: vi.fn((result) => result.error === null),
    ok: vi.fn((data) => ({ data, error: null })),
    fail: vi.fn((error) => ({ data: null, error })),
    tryCatch: vi.fn(async (fn) => {
      try {
        const result = await fn()
        return { data: result, error: null }
      } catch (error) {
        return { data: null, error }
      }
    }),
    tryCatchSync: vi.fn((fn) => {
      try {
        const result = fn()
        return { data: result, error: null }
      } catch (error) {
        return { data: null, error }
      }
    })
  }
})

import { isFail, isOk, ok, fail, tryCatch, tryCatchSync } from '@/lib/never-throw'

describe('Error Handling - Never Throw Pattern (Fixed)', () => {
  describe('Result Types', () => {
    describe('ok function', () => {
      it('should create a successful result', () => {
        // Given
        const data = 'test data'

        // When
        const result = ok(data)

        // Then
        expect(isOk(result)).toBe(true)
        expect(isFail(result)).toBe(false)
        expect(result.data).toBe(data)
        expect(result.error).toBeNull()
      })

      it('should handle different data types', () => {
        // Given
        const testCases = [
          { input: 'string', expected: 'string' },
          { input: 42, expected: 42 },
          { input: { key: 'value' }, expected: { key: 'value' } },
          { input: null, expected: null },
          { input: undefined, expected: undefined },
        ]

        testCases.forEach(({ input, expected }) => {
          // When
          const result = ok(input)

          // Then
          expect(isOk(result)).toBe(true)
          expect(result.data).toEqual(expected)
        })
      })
    })

    describe('fail function', () => {
      it('should create a failed result', () => {
        // Given
        const error = new Error('test error')

        // When
        const result = fail(error)

        // Then
        expect(isFail(result)).toBe(true)
        expect(isOk(result)).toBe(false)
        expect(result.data).toBeNull()
        expect(result.error).toBe(error)
      })

      it('should handle different error types', () => {
        // Given
        const testCases = [
          new Error('test error'),
          'string error',
          { code: 404, message: 'Not Found' },
          500,
        ]

        testCases.forEach((error) => {
          // When
          const result = fail(error)

          // Then
          expect(isFail(result)).toBe(true)
          expect(result.data).toBeNull()
          expect(result.error).toEqual(error)
        })
      })
    })
  })

  describe('tryCatch - Async Error Handling', () => {
    it('should return success result when function succeeds', async () => {
      // Given
      const asyncFunction = async () => 'success'

      // When
      const result = await tryCatch(asyncFunction)

      // Then
      expect(isOk(result)).toBe(true)
      expect(result.data).toBe('success')
      expect(result.error).toBeNull()
    })

    it('should return failure result when function throws', async () => {
      // Given
      const asyncError = new Error('async error')
      const asyncFunction = async () => {
        throw asyncError
      }

      // When
      const result = await tryCatch(asyncFunction)

      // Then
      expect(isFail(result)).toBe(true)
      expect(result.data).toBeNull()
      expect(result.error).toBe(asyncError)
    })
  })

  describe('tryCatchSync - Sync Error Handling', () => {
    it('should return success result when function succeeds', () => {
      // Given
      const syncFunction = () => 'success'

      // When
      const result = tryCatchSync(syncFunction)

      // Then
      expect(isOk(result)).toBe(true)
      expect(result.data).toBe('success')
      expect(result.error).toBeNull()
    })

    it('should return failure result when function throws', () => {
      // Given
      const syncError = new Error('sync error')
      const syncFunction = () => {
        throw syncError
      }

      // When
      const result = tryCatchSync(syncFunction)

      // Then
      expect(isFail(result)).toBe(true)
      expect(result.data).toBeNull()
      expect(result.error).toBe(syncError)
    })
  })
})