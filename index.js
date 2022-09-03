/* INICIALIZA DEPENDÊNCIAS */

const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const http = require('http')
const server = http.createServer(app)

/* SOCKET.IO */
const io = require('socket.io')(server, {
	cors: {
		origin: '*'
	}
})

/* BODY PARSER */
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json({limit: '50mb'}))
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}))

/* AUTORIZA REQUISIÇÕES */
app.use('*', async (req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*')
	res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE')
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, token')
	next()
})

/* LÊ WEBHOOKS */
app.post('/webhook', (req, res) => {

	let tokens = req.body.tokens.split(',')
	delete (req.body.tokens)

	for(let i = 0; i < tokens.length; i = i + 1)
	{
		global.socket_emit(tokens[i], 'webhook', req.body)
	}

	res.status(200).send({status: 200})
})

/* SOCKET | SERVER */
const sockets = []
io.on('connection', (socket) => {

	if(!sockets.hasOwnProperty(socket.handshake.headers.token))
		sockets[socket.handshake.headers.token] = socket.id

	socket.on('disconnect', function() {
		delete (sockets[socket.handshake.headers.token])
	})

})

/* SOCKET | EMIT */
global.socket_emit = (token, type, data) => {

	if(sockets.hasOwnProperty(token))
	{
		io.to(sockets[token]).emit(type, data)
	}

}

/* INICIA ROTEAMENTO */
server.listen(process.env.PORT || 3000, () => { console.log('Socket.js is running...') })