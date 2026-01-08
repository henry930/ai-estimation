import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'eu-west-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});


export async function uploadToS3(key: string, body: string | Buffer, contentType: string = 'text/markdown') {
    const bucket = process.env.S3_BUCKET || 'ai-estimation-production-aiestimationsiteassetsbucket-ddmbbnxb';

    try {
        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: body,
            ContentType: contentType,
        });

        await s3Client.send(command);

        // Construct the public matching URL (assuming it's formatted for static access or CloudFront)
        // Adjust this based on your specific AWS setup
        return `https://${bucket}.s3.${process.env.AWS_REGION || 'eu-west-1'}.amazonaws.com/${key}`;

    } catch (error) {
        console.error('S3 Upload Error:', error);
        throw error;
    }
}

export async function getObjectFromS3(key: string) {
    const { GetObjectCommand } = await import("@aws-sdk/client-s3");
    const bucket = process.env.S3_BUCKET || 'ai-estimation-production-aiestimationsiteassetsbucket-ddmbbnxb';
    try {
        const command = new GetObjectCommand({ Bucket: bucket, Key: key });
        const response = await s3Client.send(command);
        return await response.Body?.transformToString();
    } catch (error) {
        console.error('S3 Get Error:', error);
        return null;
    }
}

export async function listObjectsInS3(prefix: string) {
    const { ListObjectsV2Command } = await import("@aws-sdk/client-s3");
    const bucket = process.env.S3_BUCKET || 'ai-estimation-production-aiestimationsiteassetsbucket-ddmbbnxb';
    try {
        const command = new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix });
        const response = await s3Client.send(command);
        return response.Contents?.map(obj => obj.Key).filter(Boolean) as string[] || [];
    } catch (error) {
        console.error('S3 List Error:', error);
        return [];
    }
}
