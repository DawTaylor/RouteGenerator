var restify = require('restify')
var router = require('restify-route')
var loader = require('./lib/loader.js')

var server = restify.createServer()

router
	.use(server)

loader(__dirname + '/controller/', router)

server.listen(process.argv[2], () => {
  console.log('%s listening at %s', server.name, server.url);
})