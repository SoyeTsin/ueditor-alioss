var Busboy = require('busboy');
var fs = require('fs');
var fse = require('fs-extra');
var os = require('os');
var path = require('path');
var snowflake = require('node-snowflake').Snowflake;
//阿里云存储服务
var co = require('co');
var OSS = require('ali-oss');
var ossObj = {
    region: '',
    accessKeyId: '',
    accessKeySecret: ''
}
//初始化声明
var client;
var realm_name = "";
var ueditor = function (static_url, handel) {
    return function (req, res, next) {
        var _respond = respond(static_url, handel);
        _respond(req, res, next);
    };
};
ueditor.initAliyunFun = function (region, accessKeyId, accessKeySecret, realm_name) {
    ossObj.region = region;
    ossObj.accessKeyId = accessKeyId;
    ossObj.accessKeySecret = accessKeySecret;
    realm_name = realm_name;
    client = new OSS(ossObj);
};
var respond = function (static_url, callback) {
    return function (req, res, next) {
        if (req.query.action === 'config') {
            callback(req, res, next);
            return;
        } else if (req.query.action === 'listimage') {
            res.ue_list = function (list_dir) {
                co(function * ()
                {
                    client.useBucket('bucket-soye');
                    var result = yield client.list({
                        'max-keys': 10
                    });
                    //console.log(result.objects);
                    var list = [];
                    for (var i in result.objects) {
                        list.push({url: realm_name + result.objects[i].name})
                    }
                    res.json({
                        "state": "SUCCESS",
                        "list": list,
                        "start": 1,
                        "total": result.objects.length
                    });
                }
                ).
                catch(function (err) {
                    console.log(err);
                });
            };
            callback(req, res, next);

        } else if (req.query.action === 'uploadimage') {

            var busboy = new Busboy({
                headers: req.headers
            });

            busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
                req.ueditor = {};
                req.ueditor.fieldname = fieldname;
                req.ueditor.file = file;
                req.ueditor.filename = filename;
                req.ueditor.encoding = encoding;
                req.ueditor.mimetype = mimetype;
                res.ue_up = function (img_url, pathName) {
                    var tmpdir = path.join(os.tmpDir(), path.basename(filename));
                    var name = snowflake.nextId() + path.extname(tmpdir);
                    var dest = path.join(static_url, img_url, name);
                    var fileWriteStream = fs.createWriteStream(tmpdir);
                    file.pipe(fileWriteStream);
                    fileWriteStream.on('finish', function () {
                        fse.move(tmpdir, dest, function (err) {
                            if (err) throw err;
                            //setTimeout(function () {
                            co(function * ()
                            {
                                client.useBucket('bucket-soye');
                                var fileStream = fs.createReadStream(pathName + name);
                                var result = yield client.put("/images/" + name, fileStream);//path.join(img_url, name)
                                //console.log(result);
                                res.json({
                                    'url': realm_name + name,//path.join(img_url, name)
                                    'title': req.body.pictitle,//
                                    'original': filename,
                                    'state': 'SUCCESS'
                                });
                                fs.unlink(pathName + name);//删除临时文件
                            }
                            ).
                            catch(function (err) {
                                console.log("err:::" + err);
                            });
                            //}, 5000)
                        });
                    });
                };
                callback(req, res, next);
            });
            req.pipe(busboy);
        } else {
            callback(req, res, next);
        }
        return;
    };
};

module.exports = ueditor;