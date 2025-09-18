import { promisify } from 'node:util'
import { pipeline } from 'node:stream'
import type { FastifyPluginAsync } from 'fastify'

import { downloadFile } from '../utils/s3'
import { isFail, tryCatch } from '../lib/never-throw'

const pipelinePromise = promisify(pipeline)

export default (async (fastify) => {
    fastify.get('/files/:filename', async (request, reply) => {
        const { filename } = request.params as { filename: string }

        const result = await tryCatch(async () =>
            await downloadFile(filename)
        )

        if (isFail(result)) {
            fastify.log.error(`Error fetching file "${filename}": ${JSON.stringify(result.error)}`)
            return reply.status(500).send({ error: 'Failed to retrieve the file.' })
        }

        reply.header(
            'Content-Type',
            result.data.ContentType || 'application/octet-stream',
        )
        reply.header('Content-Length', result.data.ContentLength)

        return pipelinePromise(result.data.Body as NodeJS.ReadableStream, reply.raw)
    })
}) satisfies FastifyPluginAsync
