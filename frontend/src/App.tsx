import { APITester } from "./APITester";
import "./index.css";

import logo from "./logo.svg";
import reactLogo from "./react.svg";

import { useCallback, useContext, useState, type ChangeEvent } from 'react';
import { UppyContextProvider, UppyContext, Dashboard, FilesGrid, FilesList, DashboardModal, useUppyEvent } from '@uppy/react';
import Tus from '@uppy/tus';

import '@uppy/core/css/style.min.css';
import '@uppy/dashboard/css/style.min.css';
import Uppy from "@uppy/core";
import AwsS3, { type AwsS3UploadParameters } from '@uppy/aws-s3';

// ENDPOINT TO REACH AND GET A PRESIGNED URL: 
/*
curl --request POST \
  --url http://localhost:13000/presigned-url \
  --header 'content-type: application/json' \
  --data '{
  "key": "file.mp4"
}'

*/

console.log(import.meta.env)

type MaybePromise<T> = T | Promise<T>

function createUppy() {
    return new Uppy().use(AwsS3, {
        getUploadParameters: async (file, _options) => {
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
                fields: {
                    key: file.name!,
                },
                headers: {
                    'Content-Type': file.type!,
                }
            }
        },
    })
}


export function App() {
    const [uppy] = useState(createUppy());
    return (
        <UppyContextProvider uppy={uppy}>
            <div className="max-w-7xl mx-auto p-8 text-center relative z-10">
                <div className="flex justify-center items-center gap-8 mb-8">
                    <Dashboard uppy={uppy} />
                </div>
            </div>
        </UppyContextProvider>

    );
}

export default App;
