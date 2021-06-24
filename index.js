const app = require('./app')
const mongoose = require('mongoose')
const io = require('./routes/socketRoutes.js')
const port = 7300;

async function bootstrap() {
    await mongoose.connect("mongodb://defaultUser:passwordPassport1224@ladeira.eu:1283/CrackedTyping", { useNewUrlParser: true, useUnifiedTopology: true })
    console.log("Connected to MongoDB");
    return app.listen(port);
}

bootstrap().then(server => {
    io.attach(server);
    console.log(`Express listening on port ${port}`)
});