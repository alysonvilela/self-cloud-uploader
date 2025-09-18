import type { FastifyPluginAsync } from 'fastify'
import { isFail, tryCatch } from '../lib/never-throw'

export default (async (fastify) => {
    fastify.get('/healthz', async (_, reply) => {
        const result = await tryCatch(async () => {
            return { status: 'ok' }
        })

        if (isFail(result)) {
            fastify.log.error(`Error handling /healthz request: ${JSON.stringify(result.error)}`)
            return reply.status(500).send({ error: 'Failed to process the request.' })
        }

        reply.status(200).send({ status: 'ok' })

    })
}) satisfies FastifyPluginAsync
