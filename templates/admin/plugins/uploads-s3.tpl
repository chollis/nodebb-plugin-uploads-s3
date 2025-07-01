<h1><i class="fa fa-envelope-o"></i> Uploads (AWS S3)</h1>

<div class="row">
    <div class="col-lg-12">
        <blockquote>
            <p>You will need:</p>
            <ol>
                <li>An AWS account</li>
                <li>An S3 bucket in the region nearest your server, configured with relevant access permissions</li>
                <li>Optional: A CloudFront distribution to serve the content in your S3 bucket.</li>
            </ol>
            <p>This plugin uses the default credential provider chain from AWS SDK for JavaScript V3. For information on how to setup your credentials so the plugin can use them, check the following AWS documention: <a href="https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials-node.html">https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials-node.html</a></p>
        </blockquote>
    </div>
</div>
<hr />
<form role="form" class="uploads-settings">
    <fieldset>
        <div class="row">
            <div class="col-sm-12">
                <div class="mb-3">
                    <label class="form-label" for="region">Region</label>
                    <select class="form-control" id="region" name="region" title="AWS Region">
                        <option value="">...</option>
                        <option value="us-east-2">US-East (Ohio)</option>
                        <option value="us-east-1">US-East (N. Virginia)</option>
                        <option value="us-west-1">US-West (N. California)</option>
                        <option value="us-west-2">US-West (Oregon)</option>
                        <option value="af-south-1">Africa (Cape Town)</option>
                        <option value="ap-southeast-3">Asia Pacific (Jakarta)</option>
                        <option value="ap-south-1">Asia Pacific (Mumbai)</option>
                        <option value="ap-northeast-3">Asia Pacific (Osaka)</option>
                        <option value="ap-northeast-2">Asia Pacific (Seoul)</option>
                        <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                        <option value="ap-southeast-2">Asia Pacific (Sydney)</option>
                        <option value="ap-northeast-1">Asia Pacific (Tokyo)</option>
                        <option value="ca-central-1">Canada (Central)</option>
                        <option value="eu-central-1">Europe (Frankfurt)</option>
                        <option value="eu-west-1">Europe (Ireland)</option>
                        <option value="eu-west-2">Europe (London)</option>
                        <option value="eu-south-1">Europe (Milan)</option>
                        <option value="eu-west-3">Europe (Paris)</option>
                        <option value="eu-north-1">Europe (Stockholm)</option>
                        <option value="il-central-1">Israel (Tel Aviv)</option>
                        <option value="me-south-1">Middle East (Bahrain)</option>
                        <option value="sa-east-1">South America (São Paulo)</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label class="form-label" for="bucketName">S3 Bucket Name</label>
                    <input type="text" class="form-control" id="bucketName" name="bucketName" />
                </div>
                <div class="mb-3">
                    <label class="form-label" for="parentFolder">Parent Folder</label>
                    <input type="text" class="form-control" id="parentFolder" name="parentFolder" />
                </div>
                <p class="form-text">Optional: Set a Parent Folder to use that as the root of your uploads. Left blank files will be uploaded into the root of the bucket.<br/>Values should consist of the folder name followed by a /, e.g. <em>forum-uploads/</em></p>
                <div class="mb-3">
                    <label class="form-label" for="customUrl">Custom Url</label>
                    <input type="text" class="form-control" id="customUrl" name="customUrl" />
                </div>
                <p class="form-text">Optional: Set this if you are using AWS Cloudfront to serve your uploads, or if you are using a custom Url to access your S3 bucket.<br/>Please ensure you enter the full url including protocol and ending with a /, e.g. <em>https://example.com/</em></p>
            </div>
        </div>
        <button class="btn btn-lg btn-primary" id="save" type="button">Save</button>
    </fieldset>
</form>