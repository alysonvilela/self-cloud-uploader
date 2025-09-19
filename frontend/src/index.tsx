import { serve } from "bun";
import index from "./index.html";
import { bootstrapDatabase } from "./db/bootstrap";
import { createFile, getFiles } from "./routes/files";

await bootstrapDatabase();

const server = serve({
    routes: {
        // Serve index.html for all unmatched routes.
        "/*": index,

        "/api/hello": {
            async GET(req) {
                return Response.json({
                    message: "Hello, world!",
                    method: "GET",
                });
            },
            async PUT(req) {
                return Response.json({
                    message: "Hello, world!",
                    method: "PUT",
                });
            },
        },

        "/api/files": {
            async GET(req) {
                return getFiles(req);
            },
            async POST(req) {
                return createFile(req);
            },
        },

        "/api/hello/:name": async req => {
            const name = req.params.name;
            return Response.json({
                message: `Hello, ${name}!`,
            });
        },
    },

    development: process.env.NODE_ENV !== "production" && {
        // Enable browser hot reloading in development
        hmr: true,

        // Echo console logs from the browser to the server
        console: true,
    },
});

console.log(`🚀 Server running at ${server.url}`);
