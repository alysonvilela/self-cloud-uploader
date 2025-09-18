import type { FastifyPluginAsync } from 'fastify'
import { isFail, tryCatch } from '../lib/never-throw'

export default (async (fastify) => {
    fastify.get('/ping', async (_, reply) => {
        const result = await tryCatch(async () => {
            return { status: 'pong' }
        })

        if (isFail(result)) {
            fastify.log.error(`Error handling /ping request: ${JSON.stringify(result.error)}`)
            reply.status(500).send({ error: 'Failed to process the request.' })
        }

        reply.status(200).send('pong')
    })
}) satisfies FastifyPluginAsync
