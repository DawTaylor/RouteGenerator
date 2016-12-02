const CONTROLLER_PATH = '/controller/'
const restify = require('restify')
const router = require('restify-route')
const loader = require('./lib/loader.js')

const server = restify.createServer()

router.use(server)

loader(__dirname + CONTROLLER_PATH, router)

server.listen(process.argv[2], () => console.log('%s listening at %s', server.name, server.url))
