# Route generator

Projeto destinado a criar um gerador de rotas segundo um padrão onde as rotas sejam geradas automaticamente à partir dos controllers disponíveis.

Antes de mais nada, precisamos entender como funciona a definição de rotas. Nesse exemplo utilizaremos o `restify-route` em conjunto com o `restify`, que é um framework Node focado em APIs REST.


```js
var restify = require('restify')
var router = require('restify-route')

var server = restify.createServer()

router
	.use(server)
	.set('/users', 'get', function(req, res, next){
		res.send({
			'usuarios' : 'Lista de usuários',
			'version' : '1.0.2'
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
```
Na definição de rotas acima podemos perceber os seguintes elementos:

- router: `restify-route`
- path: `/, /:id`
- method: `get`
- callback: `function(req, res, next)`

Antes de seguirmos em frente, vamos refatorar o código acima usando ES6

```js
var restify = require('restify')
var router = require('restify-route')

var server = restify.createServer()

router
	.use(server)
	.set('/', 'get', (req, res, next) => {
		res.send({
			'api' : 'api-rest',
			'version' : '1.0.2'
		})
		return next()
	})
	.set('/:id', 'get', (req, res, next) =>{
    const id = req.params.id
		res.send({
			'user' : id
		})
		return next()
	})
```

Agora vamos imaginar que nosso projeto segue a seguinte estrutura de pastas.

```
|-- src/
|   |-- index.js
|   |-- controller/
|   |   |-- UserController.js
```
Vamos refatorar o nosso código para utilizar o `UserController` e simplificar a definição das nossas rotas.

```js
//index.js
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
```
Note que a definição das duas rotas é basicamente a mesma, mudando apenas o método utilizado do `controller`.

Abaixo o conteúdo do nosso `UserController`

```js
//UserController.js
var listUsers = (data, callback) => {
    return callback(200, { 'usuarios' : 'Lista de usuarios'})
}

var getUsers = (data, callback) => {

    return callback(200,  data )
}

module.exports = {
    listar : listUsers,
    obter : getUsers
}
```

Nessa estrutura podemos ter uma infinidade de rotas a serem definidas para um único `controller`.

Antes de pensar em automatizar definição das rotas, precisamos estabelecer um padrão para definição dessas rotas dentro dos `controllers`. Para isso vamos refatorar nosso `UserController` da seguinte forma.

```js
var listUsers = (data, callback) => {
    return callback(200, { 'usuarios' : 'Lista de usuarios'})
}

var getUsers = (data, callback) => {

    return callback(200,  data )
}

module.exports = [
    {
        path : '/users',
        method : 'get',
        action : listUsers
    },
    {
        path : '/users/:id',
        method : 'get',
        action : getUsers
    }
]
```
Note que agora o nosso `module.exports` do `UserController` define suas rotas possíveis e todas as informações necessárias para executa-las.

Agora podemos pensar em automatizar a criação dessas rotas, utilizando o módulo `fs`, nativo do Node.
```js
var fs = require('fs')
```
À partir do uso desse módulo, podemos fazer a leitura do conteúdo da pasta `controller` e identificar quais os `controllers` disponíveis. Algo como:

```js
fs.readdir(__dirname + '/controller', (err, files) => {
  //Arquivos presentes na pasta controller
})
```

Agora que já conseguimos obter o conteúdo da pasta `controller`, precisamos identificar as rotas presentes em cada arquivo.
Para isso vamos executar um `map` nos arquivos da função `readdir` do `fs`.

```js
fs.readdir(__dirname + '/controller', (err, files) => {
  files.map((file) => {
    //Lógica para cada arquivo.
  })
})
```
Agora que já conseguimos obter os arquivos, e executar uma lógica a cada um deles, podemos definir as rotas.


```js
fs.readdir(__dirname + '/controller', (err, files) => {
  files.map((file) => {
    //Primeiro adicionamos o módulo
	  var module = require("./controller/" + file)
    //Esse módulo tem uma série de módulos internos que definimos para cada rota
    module.map((route, index) => {
      //Definimos todas as rotas definidas no nosso UserController
      router.set(route.path, route.method, (req, res, next) => {
          //Agora executamos a ação relativa à rota
          module[index].action(req.params, (code, data) => {
            res.send(code, data)
          })
      })
    })
  })
})

```
Agora podemos remover a definição manual de rotas do nosso `index.js`, deixando ele assim.

```js
var restify = require('restify')
var router = require('restify-route')
var fs = require('fs')

var server = restify.createServer()

router
	.use(server)

fs.readdir(__dirname + '/controller', (err, files) => {
  files.map((file) => {
    //Primeiro adicionamos o módulo
	  var module = require("./controller/" + file)
    //Esse módulo tem uma série de módulos internos que definimos para cada rota
    module.map((route, index) => {
      //Definimos todas as rotas definidas no nosso UserController
      router.set(route.path, route.method, (req, res, next) => {
          //Agora executamos a ação relativa à rota
          module[index].action(req.params, (code, data) => {
            res.send(code, data)
          })
      })
    })
  })
})

server.listen(process.argv[2], () => {
  console.log('%s listening at %s', server.name, server.url);
})
```

Para tornar nosso código reaproveitável, podemos criar um módulo para fazer esse carregamento.

```js
module.exports = (path, router) => {
    var fs = require('fs')
    
    fs.readdir(path, (err, files) => {
        files.map((file) => {
            var module = require(path + file)
            module.map((route, index) => {
            router.set(route.path, route.method, (req, res, next) => {
                module[index].action(req.params, (code, data) => {
                    res.send(code, data)
                })
            })
            })
        })
    })
}
```

Agora basta executarmos o módulo injetando o nosso router.

```js
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
```

Esse estudo foi desenvolvido com base no material [AgnosticRoutes](https://github.com/suissa/AgnosticRoutes) desenvolvido pelo [suissa](https://github.com/suissa).