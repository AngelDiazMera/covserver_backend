import {Application} from 'express';
import AppConfig from './app';

// Initializations
const app:Application = AppConfig;
import './database';

// Starting the server
app.listen(app.get('port'), () => {
    console.log('Server on port', app.get('port'));
});
