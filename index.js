require('dotenv').config()

const app = require('./app.js')
const io = require('./routes/socket.route.js')
const mongoose = require('mongoose')
const config = require('config')
const https = require('https')
const fs = require('fs')

async function bootstrap() {
    let server;
    
    server = await app.listen(config.get('app.port'))
    console.log(`Express listening on port ${config.get('app.port')}`)

    await mongoose.connect(process.env.MONGO_STRING, config.get('mongoOptions'))
    console.log('Connected to MongoDB')
    
    await io.attach(server)
    console.log('Socket.io attached to server')
}

bootstrap().then(() => {
    console.log(`Enviroment is set to ${app.get('env')}`)
    console.log('---> Finished')
})