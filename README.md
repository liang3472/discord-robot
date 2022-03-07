## 1、拉取docker镜像，负责转发到腾讯云的`NLP 闲聊服务`(只转发上传聊天内容，docker代码晚点开源)

a、控制台执行

``` docker pull liang3472/ai-talk-server:0.0.3 ```

b、运行镜像

``` docker run -d -p 10086:10086 liang3472/ai-talk-server:0.0.3 ```

## 2、通过`Google浏览器`安装本插件，确保浏览器已经打开了`开发者模式`
![image](https://user-images.githubusercontent.com/5353946/157006041-8a8a6719-3b48-4fd7-9427-5aee305bfbf2.png)

## 3、设置插件
a、打开网页版`discord`[https://discord.com/]，按下面步骤打开控制台

![image](https://user-images.githubusercontent.com/5353946/157007058-5fd6d865-1c7b-484d-9934-7cdaf5e3562a.png)


b、选中要开启自动聊天的频道，打开随便发句话，然后找到相应的请求信息，在`header`中找到，如下图

![image](https://user-images.githubusercontent.com/5353946/157037009-fb21bdbf-b2b3-4549-a594-c4bbbc3105db.png)

并将图中的`authorization`值复制出来，粘贴到插件的输入框中

![image](https://user-images.githubusercontent.com/5353946/157006256-ea006289-6b72-4b3a-95cf-878895ca99d8.png)

## 4、开启功能
目前只有两个功能

a、自动聊天，点击`AI Talk`将进入自动聊天模式，退出点击关闭就行。

![image](https://user-images.githubusercontent.com/5353946/157037635-adfeb998-a8e1-46f2-a95a-235418a33858.png)

b、一键搜索问题答案(调试ing...)
