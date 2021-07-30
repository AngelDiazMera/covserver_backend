import {Router} from "express";
import passport from 'passport'

import{ getUsers, signUp, signIn, getUserById, getMyUser, setInfected } from '../controllers/userController';

const router: Router = Router();
const auth = passport.authenticate('jwt', { session: false })

// Authentication routes
router.post('/signup', signUp);
router.post('/signin', signIn);

router.route('/')
    .get(auth, getUsers);

router.route('/mine')
    .get(auth, getMyUser);

router.route('/setInfected')
    .post(auth, setInfected);

router.route('/:id')
    .get(auth, getUserById);

export default router;