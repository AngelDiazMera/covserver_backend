import {Router} from 'express';
import passport from 'passport';


import { getGroups, saveGroup, assignToGroup, getGroupById, getQR, deleteUserFromGroup } from '../controllers/groupsController';

const router: Router = Router();
const auth = passport.authenticate('jwt', { session: false})

router.route('/assign')
    .post(auth, assignToGroup)
    .put(auth, deleteUserFromGroup);

router.route('/qr')
    .post(getQR);    

router.route('/')
    .get(getGroups) 
    .post(auth, saveGroup);

router.route('/:id')
    .get(getGroupById);

export default router;