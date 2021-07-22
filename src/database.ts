import mongoose, {ConnectionOptions} from 'mongoose'
import config from './config/config'

// Options to connect to database
const dbOptions: ConnectionOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
};
// Connect mongoose to mongodb URI
mongoose.connect(config.DB.URI, dbOptions)

const connection = mongoose.connection;
// When conection is open
connection.once('open', () => {
    console.log('\x1b[32m%s\x1b[0m','Database is connected');
});
// When connection crashed, exit the process
connection.on('error', error => {
    console.log(error);
    process.exit(0);
});


