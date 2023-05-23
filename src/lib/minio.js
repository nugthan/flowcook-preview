import * as minio from 'minio'

const minioClient = new minio.Client({
    endPoint: 's3.amazonaws.com',
    accessKey: process.env.AWS_ACCESS_KEY_ID,
    secretKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'eu-west-2'
})


export default minioClient
