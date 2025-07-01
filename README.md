# nodebb-plugin-uploads-s3
Plugin for NodeBB (http://nodebb.org) to utilise AWS S3 for storing user uploads rather than the local server.

Uses NodeBB native functions where possible to reduce additional dependencies, and uses the latest version (v3) of the AWS-SDK.

The plugin hasn't been tested on NodeBB < 4.4.2

### Setup
- Install the plugin to your NodeBB instance.
- Activate the plugin then rebuild & restart NodeBB.
- Enter your S3 settings in the `Uploads (AWS S3)` page of the ACP
    - `Region`, **required**, the region your S3 bucket was created in.
    - `S3 Bucket Name`, **required**, the name of the bucket you want to store files in.
    - `Parent Folder`, the folder name to use as the root for storage, if left blank, files are uploaded to the root of the bucket.
    - `Custom Url`, if you are using an alternative URL to access the files in S3, e.g. CloudFront, enter that here.
- Click `Save` and restart NodeBB.
