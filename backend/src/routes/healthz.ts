import { Elysia } from 'elysia'

export default new Elysia()
    .get('/healthz', async () => {
        return { status: 'ok' }
    })
