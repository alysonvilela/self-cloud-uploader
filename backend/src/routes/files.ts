import { Elysia } from 'elysia'

import { downloadFile } from '../utils/s3'
import { isFail, tryCatch } from '../lib/never-throw'

export default new Elysia()
    .get('/files/:filename', async ({ params, set }) => {
        const { filename } = params

        const result = await tryCatch(async () =>
            await downloadFile(filename)
        )

        if (isFail(result)) {
            console.error(`Error fetching file "${filename}": ${JSON.stringify(result.error)}`)
            set.status = 500
            return { error: 'Failed to retrieve the file.' }
        }

        set.headers['Content-Type'] = result.data.ContentType || 'application/octet-stream'
        set.headers['Content-Length'] = result.data.ContentLength?.toString() || '0'

        return result.data.Body
    })
