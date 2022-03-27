let mongoose = require('mongoose');
mongoose.connect('mongodb://admin:stillnix@vmi779869.contaboserver.net:27017/battleship', {useNewUrlParser: true});
let conn = mongoose.connection;
conn.on('connected', function() {
    console.log('database is connected successfully');
});
conn.on('disconnected',function(){
    console.log('database is disconnected successfully');
})
conn.on('error', console.error.bind(console, 'connection error:'));

module.exports = conn;
