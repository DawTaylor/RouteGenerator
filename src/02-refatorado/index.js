var restify = require('restify')
var router = require('restify-route')

var server = restify.createServer()

router
	.use(server)
	.set('/users', 'get', (req, res, next) => {
		var Users = require('./controller/UserController').listar

		Users(req.params, (code, data) => {
			res.send(code, data)
		})
		return next()
	})
	.set('/users/:id', 'get', (req, res, next) => {
		var Users = require('./controller/UserController').obter

		Users(req.params, (code, data) => {
			res.send(code, data)
		})
		return next()
	})

server.listen(process.argv[2], () => {
  console.log('%s listening at %s', server.name, server.url);
})