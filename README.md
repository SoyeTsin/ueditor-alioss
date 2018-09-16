#Node.js : ueditor-aliyun

安装方法：

```
npm i ueditor-aliyun
```
ueditor-aliyun for nodejs 可以让你的UEditor支持nodejs 并上传附件到阿里云对象存储中


```
 在app.js加上如下代码所示几个东东
 前端页面引入例子里的ueditor
 要用到的index.html
 还有 \ueditor-alioss\example\public\ueditor 文件夹复制到静态目录下进行引用
 剩下的都交给插件吧

```


app.js文件中加入如下代码
```
##Example
```javascript

//这里引入我们的组件库
var ueditor = require("ueditor-alioss");
ueditor.initAliyunFun("oss-cn-shenzhen", "soyevip", "LTAIAEOvcub5yhjX", "WjaeXyQ2lm5Rx6LT5dfI9hoTC1yIGJ", "http://files.nodejsnet.com/");
//参数说明：Region,Bucket,OSS_ACCESS_KEY_ID,OSS_SECRET_ACCESS_KEY，host（记得结尾加个/）


//...

//这一段代码用来接收网页传过来的文件
app.use("/ueditor/ue", ueditor(path.join(__dirname, 'public'), function (req, res, next) {
    // ueditor 客户发起上传图片请求
    if (req.query.action === 'uploadimage') {
        var foo = req.ueditor;
        var date = new Date();
        var imgname = req.ueditor.filename;

        var img_url = '/images/ueditor/';
        res.ue_up(img_url, __dirname + "/public"); //你只要输入要保存的地址 。保存操作交给ueditor来做
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

```


