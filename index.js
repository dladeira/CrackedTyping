const app = require('./app.js')
const io = require('./routes/socketRoutes.js')
const mongoose = require('mongoose')
const config = require('config')
const https = require('https')
const fs = require('fs')

const serverOptions = {
    key: fs.readFileSync('./certificates/privkey.pem'),
    cert: fs.readFileSync('./certificates/fullchain.pem')
}

async function bootstrap() {
    await mongoose.connect(config.get("mongodb.connectionString"), config.get("mongodb.options"))
    console.log("Connected to MongoDB")
    return https.createServer(serverOptions, app).listen(config.get("app.port"))
}

bootstrap().then(server => {
    console.log(`Express listening on port ${config.get("app.port")}`)
    io.attach(server)
});