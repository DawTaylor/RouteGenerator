var listUsers = (data, callback) => callback(200, { 'usuarios' : 'Lista de usuarios'})
var getUsers = (data, callback) => callback(200,  data )

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
