import {Router} from 'express';
import passport from 'passport';


import { getGroups, saveGroup, getGroupById, getQR, assignToGroup, getObserver, setInfected } from '../controllers/groupsController';

const router: Router = Router();
const auth = passport.authenticate('jwt', { session: false})


router.route('/qr')
    .post(getQR);
    
router.route('/assign')
    .get(auth, getObserver)
    .post(auth, assignToGroup);

router.route('/setInfected')
    .post(auth, setInfected);

router.route('/')
    .get(getGroups) 
    .post(auth, saveGroup);

router.route('/:id')
    .get(getGroupById);

export default router;