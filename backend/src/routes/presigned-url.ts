import { Elysia } from 'elysia'

import { generatePresignedUrlForUpload } from '../utils/s3'
import { isFail, tryCatch } from '../lib/never-throw'

export default new Elysia()
    .post('/presigned-url', async ({ body, set }) => {
        const { key } = body as { key: string }

        if (!key) {
            set.status = 400
            return { error: 'Key is required.' }
        }

        const result = await tryCatch(async () => {
            return await generatePresignedUrlForUpload(key)
        })

        if (isFail(result)) {
            console.error(`Error generating presigned URL for key "${key}": ${JSON.stringify(result.error)}`)
            set.status = 500
            return { error: 'Failed to generate presigned URL.' }
        }

        return { presignedUrl: result.data }
    })
