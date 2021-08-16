import * as admin from 'firebase-admin';
import config from '../config/config';

/**
 * Interface to declare a push notification message
*/
export interface PushNotification {
    notification: {
        title: string;
        body: string;
    },
    data?: any
};

const _initFirebase = () => {
    admin.initializeApp({
        credential: admin.credential.cert(config.FCM.serviceAccount),
        databaseURL: config.FCM.databaseURL
    }); 
    console.log('\x1b[36m%s\x1b[0m','FCM loaded');
};
_initFirebase();

/**
 * Send push notifications with FCM to a specific token
 * @param token token to send the message.
 * @param notification the notification message.
*/
export const sendPushToOne = (token: string, notification: PushNotification) => {
    const message = Object.assign({token: token}, notification);
    _sendMessage(message);
};
/**
 * Send push notifications with FCM to a group
 * @param group name of the group.
 * @param tokens list of tokens to send the message.
 * @param notification the notification message.
*/
export const sendPushToTopic = async (group: string, tokens: string[], notification: PushNotification) => {
    // const onlyUnique = (token: string, index: number, self: string[]) => {
    //     return self.indexOf(token) === index;
    // };
    // const filteredTokens = tokens.filter(onlyUnique);
    const message = {...{topic: group}, ...notification};
    console.log('Mensaje desde FCM:', message.data);
    await admin.messaging().subscribeToTopic(tokens, `/topics/${group}`);
    await _sendMessage(message);
};

/**
 * Send push notifications by FCM
*/
const _sendMessage = async (message: any & PushNotification) => {
    try {
        await admin.messaging().send(message);
    } catch (error) {
        console.log('Error sending message: ', error);
    }
};
