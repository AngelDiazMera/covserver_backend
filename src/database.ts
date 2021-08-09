import mongoose, {ConnectionOptions} from 'mongoose'
import config from './config/config'

// Options to connect to database
const dbOptions: ConnectionOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
};
// Connect mongoose to mongodb URI
mongoose.connect(config.DB.URI, dbOptions)

// If wants to debug queries and log them into console
// mongoose.set('debug', true);

const connection = mongoose.connection;
// When conection is open
connection.once('open', () => {
    console.log('\x1b[36m%s\x1b[0m','Database is connected');
});
// When connection crashed, exit the process
connection.on('error', error => {
    console.log(error);
    process.exit(0);
});


