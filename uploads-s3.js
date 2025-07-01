'use strict';

const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const fs = require('fs');
const path = require('path');
const winston = require.main.require('winston');
const meta = require.main.require('./src/meta');
const user = require.main.require('./src/user');
const file = require.main.require('./src/file');
const image = require.main.require('./src/image');
const utils = require.main.require('./src/utils');
const routeHelpers = require.main.require('./src/routes/helpers');
const controllers = require('./lib/controllers');

const Uploads = {};
let s3Client;
let uploadSettings = {
    region: null,
    bucket: null,
    parentFolder: "",
    customUrl: null
}

Uploads.init = async(params) => {
    const { router } = params;

    const { region, bucketName, parentFolder, customUrl } = await meta.settings.get('uploads-s3');
    uploadSettings.region = region;
    uploadSettings.bucket = bucketName;
    uploadSettings.customUrl = customUrl;
    uploadSettings.parentFolder = parentFolder || "";
    if (!region || !bucketName) {
        winston.error(`[plugins/uploads-s3] Region and Bucket Name must be specified.`);
        throw new Error(`[[error:uploads-s3-configuration-issue]]`);
    }

    s3Client = new S3Client({ region: region });

    routeHelpers.setupAdminPageRoute(router, '/admin/plugins/uploads-s3', controllers.renderAdminPage);
}

Uploads.uploadFile = async(data) => {
    if (!s3Client) {
        winston.error(`[plugins/uploads-s3] No S3 Client available.`);
        throw new Error('[[error:invalid-storage-configuration]]');
    }

    if (!data.file) {
        winston.error(`[plugins/uploads-s3] Trying to upload an invalid file`);
        throw new Error('[[error:invalid-file]]');
    }

    await checkFileSize(data.file.size, data.uid);

    const allowed = file.allowedExtensions();
    const fileExtension = path.extname(data.file.path).toLowerCase();
    if (allowed.length > 0 && (!fileExtension || fileExtension === '.' || !allowed.includes(fileExtension))) {
        throw new Error(`[[error:invalid-file-type, ${allowed.join('&#44; ')}]]`);
    }

    const objectKey = generateObjectKey(uploadSettings.parentFolder, data.folder, data.uid, fileExtension);
    
    return await upload(data.file.path, data.file.type, objectKey);
}

Uploads.uploadImage = async(data) => {
    if (!s3Client) {
        winston.error(`[plugins/uploads-s3] No S3 Client available.`);
        throw new Error('[[error:invalid-storage-configuration]]');
    }

    if (!data.image) {
        winston.error(`[plugins/uploads-s3] Trying to upload an invalid image`);
        throw new Error('[[error:invalid-image-file]]');
    }

    const fileExtension = path.extname(data.image.path).toLowerCase();
    const objectKey = generateObjectKey(uploadSettings.parentFolder, data.folder, data.uid, fileExtension);

    // user profile upload
    if (data.folder.startsWith('profile')) {
        return await upload(data.image.path, data.image.type, objectKey);
    }

    await checkFileSize(data.image.size, data.uid);
    await image.isFileTypeAllowed(data.image.path);
    await image.checkDimensions(data.image.path);
    
    const resize = await shouldResizeImage(data.image.path, data.image.type);
    if (!resize) {
        return await upload(data.image.path, data.image.type, objectKey);
    }
    
    await image.resizeImage({
        path: data.image.path,
        width: meta.config.resizeImageWidth,
        quality: meta.config.resizeImageQuality,
    });
    
    return await upload(data.image.path, data.image.type, objectKey);
}

Uploads.addAdminNavigation = (header) => {
    header.plugins.push({
        route: '/plugins/uploads-s3',
        icon: 'fa-envelope-o',
        name: 'Uploads (AWS S3)'
    });

    return header;
}

async function shouldResizeImage(imagePath, imageType) {
    const imageData = await image.size(imagePath);

    if (imageType === 'image/svg+xml') { return false; } // svg can't be resized by Sharp
    if (meta.config.resizeImageWidth === 0 || meta.config.resizeImageWidthThreshold === 0) { return false; } // resize settings are disabled
    if (imageData.width < meta.config.resizeImageWidthThreshold || meta.config.resizeImageWidth > meta.config.resizeImageWidthThreshold) { return false; } // image is smaller than threshold or resize to specific width is set greater than threshold

    return true;
}

async function checkFileSize(fileSize, uid) {
    const isAdmin = await user.isAdministrator(uid);
    if (!isAdmin && fileSize > meta.config.maximumFileSize * 1024) {
        throw new Error(`[[Error:file-too-big, ${meta.config.maximumFileSize}]]`);
    }
}

function normalisePathPrefix(pathPrefix) {
    return pathPrefix && !pathPrefix.endsWith('/') ? `${pathPrefix}/` : pathPrefix || '';
}

function generateObjectKey(parentFolder, folder, userId, fileExt) {
    const fileName = utils.generateUUID();
    const normalisedParentFolder = normalisePathPrefix(parentFolder);
    switch (true) {
        case folder === "category":
            return `${normalisedParentFolder}category/${fileName}${fileExt}`;
        case folder === "emoji":
            return `${normalisedParentFolder}emoji/${fileName}${fileExt}`;
        case folder.startsWith("profile"):
            return `${normalisedParentFolder}profile/${userId}-${fileName}${fileExt}`;
        case folder === "sounds":
            return `${normalisedParentFolder}sounds/${fileName}${fileExt}`;
        case folder === "system":
            return `${normalisedParentFolder}system/${fileName}${fileExt}`;
        default:
            return `${normalisedParentFolder}files/${userId}/${fileName}${fileExt}`;
    }
}

async function upload(filePath, fileType, objectKey) {
    try {
        await uploadToS3(filePath, fileType, uploadSettings.bucket, objectKey);
        if (uploadSettings.customUrl) {
            return { url: `${normalisePathPrefix(uploadSettings.customUrl)}${objectKey}` }
        } else {
            return { url: `https://${uploadSettings.bucket}.s3.${uploadSettings.region}.amazonaws.com/${objectKey}` }
        }
    } catch (error) {
        winston.error(`[plugins/uploads-s3] ${JSON.stringify(error)}.`);
        throw new Error(`[[error:server-error]]`);
    }
}

async function uploadToS3(tmpPath, fileType, bucketName, objectKey) {
    try {
        const readStream = fs.createReadStream(tmpPath);
        const upload = new Upload({
            client: s3Client,
            params: {
                Bucket: bucketName,
                Key: objectKey,
                Body: readStream,
                ContentType: fileType 
            },
        });

        await upload.done();
    } catch (error) {
        winston.error(`[plugins/uploads-s3] S3 Error: ${JSON.stringify(error)}`);
        throw new Error(`Upload error ${error}`);
    }
}

module.exports = Uploads;