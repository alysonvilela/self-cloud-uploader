import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'

// Import routes manually for now
import rootRoute from './routes/root'
import pingRoute from './routes/ping'
import healthzRoute from './routes/healthz'
import presignedUrlRoute from './routes/presigned-url'
import filesRoute from './routes/files'

const app = new Elysia()
    .use(cors({
        origin: '*',
        methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Upload-Offset', 'Upload-Length', 'Tus-Resumable', 'Upload-Metadata', 'Upload-Concat'],
        exposeHeaders: ['Upload-Offset', 'Upload-Length', 'Tus-Resumable', 'Upload-Metadata', 'Upload-Expires', 'Location'],
        credentials: false,
    }))
    .use(rootRoute)
    .use(pingRoute)
    .use(healthzRoute)
    .use(presignedUrlRoute)
    .use(filesRoute)
    .listen(13000)

console.log(`🦊 Elysia is running at http://localhost:13000`)

export default app
