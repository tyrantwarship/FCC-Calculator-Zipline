var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));

app.get('*', function (req, res) {
    res.sendfile('./public/index.html');
});

app.listen(8080);
console.log("app listening on port 8080");