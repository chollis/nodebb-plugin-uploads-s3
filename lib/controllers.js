'use strict';

const Controllers = module.exports;

Controllers.renderAdminPage = function (req, res) {
    res.render('admin/plugins/uploads-s3', {
        title: 'Uploads (AWS S3)',
    });
};