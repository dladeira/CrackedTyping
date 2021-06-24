const app = require('./app.js')
const io = require('./routes/socketRoutes.js')
const mongoose = require('mongoose')
const config = require('config')

async function bootstrap() {
    await mongoose.connect(config.get("mongodb.connectionString"), config.get("mongodb.options"))
    console.log("Connected to MongoDB")
    return app.listen(config.get("app.port"))
}

bootstrap().then(server => {
    console.log(`Express listening on port ${config.get("app.port")}`)
    io.attach(server)
});