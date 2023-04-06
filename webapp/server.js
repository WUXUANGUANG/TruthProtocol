// 导入 Express 框架
const express = require('express');
const app = express();

var bannedUrlList=["https://zhuanlan.zhihu.com/p/92667917","https://blog.csdn.net/qq_41618084/article/details/81411314"]
function getBannedUrlList(){
    return bannedUrlList
}

// 静态文件服务器，将静态文件目录设置为项目根目录
app.use(express.static(__dirname + '/static'));

// 处理 GET /rank 路径请求
app.get('/rank', (req, res) => {
  // 返回一个简单的 HTML 页面，显示排名信息
  res.sendFile(__dirname+"/static/rank.html")
});

// 处理 GET /index 路径请求
app.get('/index', (req, res) => {
  // 返回一个简单的 HTML 页面，显示排名信息
  res.sendFile(__dirname+"/static/index.html")
});

app.get('/api/getBannedUrlList',(req,res) =>{
    // 返回一个简单list
    const data={
        code: 2001,
        data: getBannedUrlList()
    };
    res.json(data)
});

// 启动服务器，监听端口 3000
app.listen(3001, () => {
  console.log('服务器已启动，访问 http://localhost:3000/rank 查看排名页面。');
});
