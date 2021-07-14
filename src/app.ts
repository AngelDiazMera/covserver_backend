// Imported packages
import exphbs from 'express-handlebars'
import express, {Application} from 'express'
import cors from 'cors'
import morgan from 'morgan'
import path from 'path'
import passport from 'passport'

// imported files
import enterpriseRoutes from './routes/enterprise.routes'
import { enterpriseAuth } from './middlewares/passport'

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
app.use(passport.initialize()); // Uses passport
passport.use(enterpriseAuth); // Passport uses the configuration from the middleware

// Routes: routes from the api
app.use('/enterprise', enterpriseRoutes);

// Static files: everything that a browser can use
app.use(express.static(path.join(__dirname, 'public')));

export default app;