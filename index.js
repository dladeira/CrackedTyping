const app = require('./app.js')
const io = require('./routes/socket.route.js')
const mongoose = require('mongoose')
const config = require('config')
const http = require('http')
const https = require('https')
const fs = require('fs')

const serverOptions = {
    key: fs.readFileSync('./certificates/privkey.pem'),
    cert: fs.readFileSync('./certificates/fullchain.pem')
}

async function bootstrap() {
    let httpServer = http.createServer(app).listen(config.get('app.httpPort'))
    let httpsServer = await https.createServer(serverOptions, app).listen(config.get('app.httpsPort'))
    console.log(`Express listening on port ${config.get('app.httpPort')} (http) and ${config.get('app.httpsPort')} (https)`)

    await mongoose.connect(config.get('mongodb.connectionString'), config.get('mongodb.options'))
    console.log('Connected to MongoDB')
    
    await io.attach(httpServer)
    await io.attach(httpsServer)
    console.log('Socket.io attached to server')
}

bootstrap().then(() => {
    console.log(`Enviroment is set to ${app.get('env')}`)
    console.log('---> Finished')
})