#Node.js : aueditor

aueditor for nodejs 可以让你的UEditor支持nodejs 并上传附件到阿里云对象存储


```
 丢进NODE.JS项目的这里面 node_modules
 在app.js加上如下代码所示几个东东
 记得阿里云几个依赖的模块也加上：https://github.com/aliyun-UED/aliyun-sdk-js
 前端页面引入例子里的ueditor
 剩下的都交给插件吧

```



```
##Example
```javascript
var express = require('express');
var ejs = require('ejs');
var path = require('path');
var app = express();

var ueditor = require("ueditor");
ueditor.initAliyunFun("region", "accessKeyId", "accessKeySecret", "对象访问的起始域名或IP");
//配置阿里云对象存储获取到的几个参数，如：("oss-cn-shenzhen", "7Y2Ss1o564JJed2z", "csjRXdPub7kPb7JHGhwD0xOPEGBR8Q", "http://img.nodejsnet.com/")
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
// view engine setup


app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.engine('.html', ejs.__express);
app.set('view engine', 'html');

app.use("/ueditor/ue", ueditor(path.join(__dirname, 'public'), function (req, res, next) {
    // ueditor 客户发起上传图片请求
    if (req.query.action === 'uploadimage') {
        var foo = req.ueditor;
        var date = new Date();
        var imgname = req.ueditor.filename;

        var img_url = '/images/ueditor/';
        res.ue_up(img_url); //你只要输入要保存的地址 。保存操作交给ueditor来做
    }
    //  客户端发起图片列表请求
    else if (req.query.action === 'listimage') {
        var dir_url = '/images/ueditor/';
        res.ue_list(dir_url); // 客户端会列出 dir_url 目录下的所有图片
    }
    // 客户端发起其它请求
    else {
        // console.log('config.json')
        res.setHeader('Content-Type', 'application/json');
        res.redirect('/ueditor/nodejs/config.json');
    }
}));


app.use('/', function (req, res) {
    res.render('ueditor');
});

app.listen(3000, function () {
    console.log('app listen : 3000');
});

module.exports = app;

```


