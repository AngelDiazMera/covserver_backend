// Imported packages
import exphbs from 'express-handlebars';
import express, {Application} from 'express';
import path from 'path';

// imported files
import exampleRoutes from './routes/example.routes';
import enterpriseRoutes from './routes/enterprise.routes';
import groupsRoutes from './routes/groups.routes';

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
app.use(express.json()); // Uses JSON to send and retrieve data
app.use(express.urlencoded({extended: false})); // Interpreter url requests

// Routes: routes from the api
app.use('/example', exampleRoutes);
app.use('/enterprise', enterpriseRoutes);
app.use('/groups', groupsRoutes);

// Static files: everything that a browser can use
app.use(express.static(path.join(__dirname, 'public')));

export default app;