const app = require('./app.js')
const io = require('./routes/socket.route.js')
const mongoose = require('mongoose')
const config = require('config')
const https = require('https')
const fs = require('fs')

let server

const serverOptions = {
    key: fs.readFileSync('./certificates/privkey.pem'),
    cert: fs.readFileSync('./certificates/fullchain.pem')
}

async function bootstrap() {
    await mongoose.connect(config.get("mongodb.connectionString"), config.get("mongodb.options"))
    console.log("Connected to MongoDB")

    server = await https.createServer(serverOptions, app).listen(config.get("app.port"))
    console.log(`Express listening on port ${config.get("app.port")}`)

    await io.attach(server)
    console.log(`Socket.io attached to https server`)
}

bootstrap().then(() => {
    console.log(`Enviroment is set to ${app.get('env')}`)
    console.log(`---> Finished`)
})