import "./index.css";

import logo from "./logo.svg";
import reactLogo from "./react.svg";

import { useCallback, useContext, useEffect, useState, type ChangeEvent } from 'react';
import { UppyContextProvider, UppyContext, Dashboard, FilesGrid, FilesList, DashboardModal, useUppyEvent } from '@uppy/react';
import Tus from '@uppy/tus';

import '@uppy/core/css/style.min.css';
import '@uppy/dashboard/css/style.min.css';
import Uppy from "@uppy/core";
import AwsS3, { type AwsS3UploadParameters } from '@uppy/aws-s3'
import { FilesTable } from "./components/FilesTable";

console.log(import.meta.env)

type MaybePromise<T> = T | Promise<T>

function createUppy() {
    return (new Uppy() as any).use(AwsS3 as any, {
        getUploadParameters: async (file: any, _options: any): Promise<AwsS3UploadParameters> => {
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

            const params: AwsS3UploadParameters = {
                method: 'PUT',
                url: presignedUrl,
                headers: {
                    'Content-Type': file.type!,
                }
            };
            return params;
        },
    } as any)
}


export function App() {
    const [uppy] = useState(createUppy());
    useEffect(() => {
        const onSuccess = (file: any, response: any) => {
            // Persist metadata to our API after successful S3 upload
            const body = {
                originalName: file.name,
                s3Key: file.name,
                size: file.size,
                mimeType: file.type,
                userId: "demo",
            };
            fetch("/api/files", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            }).catch(err => console.error("Failed to store metadata", err));
        };
        uppy.on('upload-success', onSuccess);
        return () => { uppy.off('upload-success', onSuccess as any); };
    }, [uppy]);
    return (
        <UppyContextProvider uppy={uppy}>
            <div className="max-w-7xl mx-auto p-8 text-center relative z-10">
                <div className="flex justify-center items-center gap-8 mb-8">
                    <Dashboard uppy={uppy} />
                </div>
                <div className="text-left">
                    <h2 className="text-xl font-semibold mb-2">Arquivos</h2>
                    <FilesTable />
                </div>
            </div>
        </UppyContextProvider>

    );
}

export default App;
