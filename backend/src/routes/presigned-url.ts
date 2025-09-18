import type { FastifyPluginAsync } from 'fastify'

import { generatePresignedUrlForUpload } from '../utils/s3'
import { isFail, tryCatch } from '../lib/never-throw'

export default (async (fastify) => {
    fastify.post('/presigned-url', async (request, reply) => {
        const { key } = request.body as { key: string }

        if (!key) {
            return reply.status(400).send({ error: 'Key is required.' })
        }

        const result = await tryCatch(async () => {
            return await generatePresignedUrlForUpload(key)
        })

        if (isFail(result)) {
            fastify.log.error(`Error generating presigned URL for key "${key}": ${JSON.stringify(result.error)}`)
            return reply.status(500).send({ error: 'Failed to generate presigned URL.' })
        }

        reply.status(200).send({ presignedUrl: result.data })
    })
}) satisfies FastifyPluginAsync
