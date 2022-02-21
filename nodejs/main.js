var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var path = require('path');
var template = require('./lib/template.js')
var sanitizeHtml = require('./node_modules/sanitize-html')

function setBody(title, description){
    return `<h2>${title}</h2>
    <p>${description}</p>`
}
var app = http.createServer(function(request, response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathName = url.parse(_url, true).pathname;
    
    if (pathName === "/"){
        if(queryData.id === undefined){
            fs.readdir('./data', function(error, filelist){
                var title = "Welcome";
                var description = "Hello Node.js";
                var list = template.list(filelist);
                var html = template.html(title, list, setBody(title, description),
                '<a href="/create">create</a>');
                response.writeHead(200);
                response.end(html)
            });
            
        }else{
            fs.readdir('./data', function(error, filelist){
                var filterdId = path.parse(queryData.id).base
            fs.readFile(`data/${filterdId}`, 'utf8', function(err, description){
                var title = queryData.id
                var sanitizedTitle = sanitizeHtml(title)
                var sanitizeDescription = sanitizeHtml(description, {
                    allowedTags :['h1']
                })
                var list = template.list(filelist);
                var html = template.html(title, list, setBody(title, sanitizeDescription),
                `<a href="/create">create</a> 
                <a href="/update?id=${sanitizedTitle}">update</a> 
                <form action = "/delete_process" method='post'>
                <input type = 'hidden' name = 'id' value ="${sanitizedTitle}">
                <input type = 'submit' value = "delete">
                </from>`);
                response.writeHead(200);
                response.end(html)
            });
        });
        }
    }
    else if(pathName === "/create"){
        fs.readdir('./data', function(error, filelist){
            var title = "WEB - create";
            var list = template.list(filelist);
            var html = template.html(title, list, `
            <form action = "/create_process" method="post">
                    <p>
                        <input type = "text" name = "title" placeholder='title'>
                    </p>
                        <p>
                            <textarea name = "description" placeholder='description'></textarea>
                        </p>
                    <p>
                        <input type='submit'>
                    </p>
             </form>
            `,'');
            response.writeHead(200);
            response.end(html)
        });
    }else if(pathName === "/create_process"){
        var body = '';
        request.on('data', function(data){
            body = body + data;
        });
        request.on('end', function(){
            var post = qs.parse(body);
            var title = post.title;
            var description = post.description;
            fs.writeFile(`./data/${title}`, description, 'utf8',function(err){
                response.writeHead(302, {Location:`/?id=${title}`});
                response.end()
            })
        })
        
    }else if(pathName === "/update"){
        fs.readdir('./data', function(error, filelist){
            var filterdId = path.parse(queryData.id).base
            fs.readFile(`data/${filterdId}`, 'utf8', function(err, description){
                
                var title = queryData.id
                var sanitizedTitle = sanitizeHtml(title)
                var sanitizeDescription = sanitizeHtml(description)
                var list = template.list(filelist);
                var html = template.html(title, list, 
                    `
                    <form action = "/update_process" method="post">
                        <input type = "hidden" name = 'id' value = ${sanitizedTitle}>
                        <p>
                            <input type = "text" name = "title" placeholder='title' value = ${sanitizedTitle}>
                        </p>
                            <p>
                                <textarea name = "description" placeholder='description'>${sanitizeDescription}</textarea>
                            </p>
                        <p>
                            <input type='submit'>
                        </p>
                    </form>
                    `,
                    `<a href="/create">create</a> <a href="/update?id=${sanitizedTitle}">update</a>`);
                response.writeHead(200);
                response.end(html)
            });
        });
    }else if(pathName === "/update_process"){
        var body = '';
        request.on('data', function(data){
            body = body + data;
        });
        request.on('end', function(){
            var post = qs.parse(body);
            var title = post.title;
            var id = post.id;
            var description = post.description;
            fs.rename(`data/${id}`, `data/${title}`, function(err){
                fs.writeFile(`./data/${title}`, description, 'utf8',function(err){
                    console.log("The file has been solved")
                    response.writeHead(302, {Location:`/?id=${title}`});
                    response.end()
                })
            })
            
        });
    }else if(pathName === "/delete_process"){
        var body = '';
        request.on('data', function(data){
            body = body + data;
        });
        request.on('end', function(){
            var post = qs.parse(body);
            var id = post.id;
            var filterdId = path.parse(id).base;
            fs.unlink(`data/${filterdId}`, function(err){
                response.writeHead(302, {Location:`/`});
                response.end()
            })
        });
    }else{
            response.writeHead(404);
            response.end("Not Found")
    };
});
app.listen(3000);
