var restify = require('restify')
var router = require('restify-route')

var server = restify.createServer()

router
	.use(server)
	.set('/users', 'get', function(req, res, next){
		res.send({
			'usuários' : 'Lista de usuários'
		})
		return next()
	})
	.set('/users/:id', 'get', function(req, res, next){
        const id = req.params.id
		res.send({
			'user' : id
		})
		return next()
	})

server.listen(process.argv[2], function() {
  console.log('%s listening at %s', server.name, server.url);
})