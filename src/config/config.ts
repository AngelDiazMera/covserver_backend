import path from 'path'

const stepBack = `${__dirname.includes('build') ? '../../' : '../'}../`;
const pathFCM = path.join(__dirname, stepBack, 'google_fcm.json');

export default {
    jwtSecret: process.env.JWT_SECRET || 'somesecrettoken',
    DB: {
        URI: process.env.MONGODB_URI || 'mongodb://localhost/covserver_data',
        USER: process.env.MONGODB_USER,
        PASSWORD: process.env.MONGODB_PSW
    },
    FCM: {
        key: 
            process.env.GOOGLE_APPLICATION_KEY ||
            'AAAAe-r-_Pc:APA91bHq5ZXIdm-UOpr8OYds3I1yt1hy-2_JtavQkucQzr4UPZM_VZK-EqYAo5EdcLAjtB0ku3K8hsWNQ11JkmtXQpSmlUyYFwG4brOXV8ER6BtyKaz1AOQtMfwIlmmwpHmy2UeT7ikp',
        serviceAccount: 
            process.env.GOOGLE_APPLICATION_CREDENTIALS || pathFCM,
        databaseURL: 'https://covserver-default-rtdb.firebaseio.com/'
    } 
}