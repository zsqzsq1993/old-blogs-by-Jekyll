---
layout: post
title: "Node中的异步编程"
description: "Node中的事件发射器与监听器"
tags:
    - Node.js
    - JavaScript
---
Node中的事件发射器与监听器很像客户端的事件处理程序，不同的是它将发生与回调拆分开来。

**事件发射器**往往配合**监听器**一起使用。这两者有点类似于函数的定义和函数的调用：监听器像是函数的定义，它含有形参，起着当有事件发生时就会被触发的回调函数的作用；事件发射器则是函数的调用，它含有实参，引用它时就会发出这个发射器指定的事件。这一对组合靠着它们的第一个字符串参数“事件名”映射着，比如’data‘，’join‘，’broadcast‘等。它们的名称可以是任意的，但为了方便自己及他人理解，往往选用具有语义信息的字符串。

每一组事件发射器及监听器之间都是异步的，也就是他们处于平行时间轴上。它们均在自己的时间轴上监听、触发、回调互不干扰。除非一个监听器嵌套了另一个监听器，内部的监听器只有当外部的监听器被回调时才会开始监听。

以下的代码示例展示了一个用事件发射器及监听器完成一个PUB/SUB的例子(pub_sub.js)：

```javascript
const net = require('net'); // using telnet protocol
const EventEmitter = require('events').EventEmitter;
const channel = new EventEmitter();
channel.clients = {};
channel.subscriptions = {};

channel.on('join', function(id,client){ // function can't be replaced by =>, wierd!
    channel.clients[id] = client;
    channel.subscriptions[id] = (senderId, message) =>{
        if(id !=== senderId){
            client.write(message);
        }
    };
    this.on('broadcast',this.subscriptions[id]);
});
 
const server = net.createServer(client =>{
    const id = `${client.remoteAddress}:${client.remotePort}`;
    channel.emit('join',id,client);
    client.on('data',data =>{
        data = data.toString();
        channel.emit('broadcast',id,data);
    });
});

server.listen(4000);
```

通过代码`node pub_sub.js`和`telnet localhost 4000`可以开启服务器。这样打开多个terminal并均开启服务器的话，在一中一个terminal发送消息，消息会抵达除它在外的其他terminal。

* broadcast监听器嵌套在join监听器内部，因此，当join事件发生时，broadcast才会开始监听；
* 每当一个client加入channel后都会设置broadcast监听；这个监听一直存在，因为异步的关系，当下一个client被加入后并触发当下client的broadcast事件时，上一个client的监听器也会被回调。`id!===senderId`设置了该消息不会传递给给发送消息的client；
* `channel.subscriptions[id] = (senderId, message)=>{...}`保证了每个client都有自己独立的回调函数，即占用了独立的内存空间。若只将函数只定义在一个内存空间，多个client同时调用的时候，会存在问题；
* 仅针对上述代码，个人认为没有必要将每个client储存起来；
* 这里再简要记录一下箭头函数与普通函数引用的区别：
  - 箭头函数在使用多层函数嵌套结构时能保证this仍指向最初的实例对象，而普通函数则不能；
  - 箭头函数不能用于构造函数的使用，因此也无法使用new命令；
  - 箭头函数内部没有定义arguments，如果要使用，可以用rest达到相似的效果；
  - 箭头函数无法使用yield命令，因此不能用来构造generator。
* `channel.on('join',function(id,client){...})`若换成箭头函数`channel.on('join',(id,client)=>{})`会导致代码报错，愿因就是上面的第一点：**箭头函数在使用多层函数嵌套结构时能保证this仍指向最初的实例对象**。这即是优点也是缺点，箭头函数不会创建自己的this，它只会从自己作用域的上一层继承this。因此，若上一层没有对this进行绑定，那箭头函数中的this只会取到undefined!!