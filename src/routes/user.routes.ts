import {Router} from "express";
import passport from 'passport'

import{ getUsers, signUp, getMembers , getVisits,signIn, getUserById, getMyUser } from '../controllers/userController';

const router: Router = Router();
const auth = passport.authenticate('jwt', { session: false })

// Authentication routes
router.post('/signup', signUp);
router.post('/signin', signIn);

router.route('/members')
    .get(auth, getMembers);

router.route('/visits')
    .get(auth, getVisits);

router.route('/')
    .get(auth, getUsers);

router.route('/mine')
    .get(auth, getMyUser);

router.route('/:id')
    .get(auth, getUserById);

export default router;