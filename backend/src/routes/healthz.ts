import { Elysia } from 'elysia'
import { isFail, tryCatch } from '../lib/never-throw'

export default new Elysia()
    .get('/healthz', async ({ set }) => {
        const result = await tryCatch(async () => {
            return { status: 'ok' }
        })

        if (isFail(result)) {
            console.error(`Error handling /healthz request: ${JSON.stringify(result.error)}`)
            set.status = 500
            return { error: 'Failed to process the request.' }
        }

        return { status: 'ok' }
    })
