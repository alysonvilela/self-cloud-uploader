import { config } from 'dotenv'
import type { FastifyPluginAsync } from 'fastify'
import autoLoad from '@fastify/autoload'
import { join } from 'node:path'
import cors from '@fastify/cors'

config({ path: '.env.local', override: true })

const app: FastifyPluginAsync = async (fastify, opts): Promise<void> => {

    fastify.register(cors, {
        origin: '*',
        methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Upload-Offset', 'Upload-Length', 'Tus-Resumable', 'Upload-Metadata', 'Upload-Concat'],
        exposedHeaders: ['Upload-Offset', 'Upload-Length', 'Tus-Resumable', 'Upload-Metadata', 'Upload-Expires', 'Location'],
        credentials: false,
    })
    fastify.register(autoLoad, {
        dir: join(__dirname, 'routes'),
        options: opts,
    })
}

export default app
