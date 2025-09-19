import "./index.css";

import logo from "./logo.svg";
import reactLogo from "./react.svg";

import { useState } from 'react';
import { UppyContextProvider, Dashboard } from '@uppy/react';
import Tus from '@uppy/tus';

import '@uppy/core/css/style.min.css';
import '@uppy/dashboard/css/style.min.css';
import Uppy from "@uppy/core";
import AwsS3 from '@uppy/aws-s3'
import { FilesTable } from "./components/FilesTable";
import { UserProvider, useUser } from "./user/UserContext";

console.log(import.meta.env)

type MaybePromise<T> = T | Promise<T>

function createUppy() {
    const instance: any = new (Uppy as any)();
    return instance.use(AwsS3 as any, {
        getUploadParameters: async (file: any) => {
            const response = await fetch(`${process.env.BUN_PUBLIC_UPLOAD_SERVICE_URL}/presigned-url`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    key: file.name,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get presigned URL');
            }

            const { presignedUrl } = await response.json() as { presignedUrl: string };

            return {
                method: 'PUT',
                url: presignedUrl,
                headers: {
                    'Content-Type': file.type!,
                },
            } as any
        },
    } as any)
}


function AppInner() {
    const user = useUser();
    const [uppy] = useState(createUppy());
    uppy.on('upload-success', async (file: any) => {
        if (!file) return;
        try {
            await fetch('/api/files', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    originalName: file.name,
                    s3Key: file.name,
                    userId: user.id,
                    userName: user.name,
                }),
            });
        } catch (e) {
            console.error('Failed to persist metadata', e);
        }
    });
    return (
        <UppyContextProvider uppy={uppy}>
            <div className="max-w-7xl mx-auto p-8 relative z-10">
                <div className="flex justify-center items-center gap-8 mb-8">
                    <Dashboard uppy={uppy} />
                </div>
                <FilesTable />
            </div>
        </UppyContextProvider>
    );
}

export function App() {
    return (
        <UserProvider>
            <AppInner />
        </UserProvider>
    );
}

export default App;
