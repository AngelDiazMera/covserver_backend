import {Application} from 'express';
import AppConfig from './app';
import GroupSubjects from './logic/groupSubjects';

// Initializations
const app:Application = AppConfig;
import './database';
GroupSubjects.initialize();

// Starting the server
app.listen(app.get('port'), () => {
    console.log('Server on port', app.get('port'));
});
