const fs = require('fs')
    
module.exports = (path, router) => 
    fs.readdir(path, (err, files) => 
        files.map((file) => {
            var module = require(path + file)
            module.map((route, index) => {
                router.set(route.path, route.method, (req, res, next) => 
                    module[index].action(req.params, (code, data) => res.send(code, data))
                )
            )
        })
    )
