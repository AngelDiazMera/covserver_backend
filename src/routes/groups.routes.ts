import {Router} from 'express';
import passport from 'passport';


import { getGroups, saveGroup, assignToGroup, getGroupByCode, getQR, deleteCode, deleteUserFromGroup, notifyInfected, getAlertData } from '../controllers/groupsController';

const router: Router = Router();
const auth = passport.authenticate('jwt', { session: false})

router.route('/assign')
    .post(auth, assignToGroup)
    .put(auth, deleteUserFromGroup);

router.route('/qr')
    .post(getQR);
/*THIS ROUTE IS DEFINDED IN TWO OCATIONS*/    
router.route('/assign')
    .post(auth, assignToGroup);

router.route('/notifyInfected')
    .post(auth, notifyInfected);

router.route('/getAlertData')
    .post(auth, getAlertData);

router.route('/')
    .get(auth, getGroups) 
    .post(auth, saveGroup)
    .delete(auth, deleteCode);

router.route('/:code')
    .get(auth, getGroupByCode);

export default router;