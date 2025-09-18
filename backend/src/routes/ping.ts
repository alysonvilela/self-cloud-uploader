import { Elysia } from 'elysia'
import { isFail, tryCatch } from '../lib/never-throw'

export default new Elysia()
    .get('/ping', async ({ set }) => {
        const result = await tryCatch(async () => {
            return { status: 'pong' }
        })

        if (isFail(result)) {
            console.error(`Error handling /ping request: ${JSON.stringify(result.error)}`)
            set.status = 500
            return { error: 'Failed to process the request.' }
        }

        return 'pong'
    })
