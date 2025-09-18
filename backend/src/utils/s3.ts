import {
    PutObjectCommand,
    getSignedUrl,
    s3Client,
    type GetObjectCommandOutput,
    GetObjectCommand,
} from '../lib/s3'


export const generatePresignedUrlForUpload = async (
    key: string,
    acl: 'public-read' | 'private' | 'authenticated-read' = 'public-read',
    expiresIn = 600,
): Promise<string> => {
    const bucketName = process.env.STORAGE_BUCKET_NAME

    if (!bucketName) {
        throw new Error('Environment variable STORAGE_BUCKET_NAME is missing.')
    }

    const command = new PutObjectCommand({
        ACL: acl,
        Bucket: bucketName,
        Key: key,
    })

    return getSignedUrl(s3Client, command, { expiresIn })
}

export const downloadFile = (key: string): Promise<GetObjectCommandOutput> => {
    const bucketName = process.env.STORAGE_BUCKET_NAME

    if (!bucketName) {
        throw new Error('Environment variable STORAGE_BUCKET_NAME is missing.')
    }

    const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
    })

    return s3Client.send(command)
}
