// Imported packages
import exphbs from 'express-handlebars';
import express, {Application} from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';

// imported files
import exampleRoutes from './routes/example.routes';
import enterpriseRoutes from './routes/enterprise.routes';

// Initializations
const app: Application = express();

// Settings
app.set('port', process.env.PORT || 5000); // Port

app.set('views', path.join(__dirname, 'views')); // path of views for hbs
app.engine('.hbs', exphbs({ // Handlebars configuration
    extname: '.hbs',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    helpers: require('./lib/helpers'),
}));
app.set('view engine', '.hbs');

// Midlewares
app.use(morgan('dev'));
app.use(cors());
app.use(express.json()); // Uses JSON to send and retrieve data
app.use(express.urlencoded({extended: false})); // Interpreter url requests

// Routes: routes from the api
app.use('/example', exampleRoutes);
app.use('/enterprise', enterpriseRoutes);

// Static files: everything that a browser can use
app.use(express.static(path.join(__dirname, 'public')));

export default app;