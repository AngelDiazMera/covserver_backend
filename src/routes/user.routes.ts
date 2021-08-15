import {Router} from "express";
import passport from 'passport'

import{ getUsers, signUp, signIn, getMembers , getVisits, getUserById, getMyUser, getSymptoms, updateHealthCondition, updateMyUser  } from '../controllers/userController';

const router: Router = Router();
const auth = passport.authenticate('jwt', { session: false })

// Authentication routes
router.post('/signup', signUp);
router.post('/signin', signIn);

// Routes which need authentication
router.route('/members')
    .get(auth, getMembers);

router.route('/visits')
    .get(auth, getVisits);

router.route('/')
    .get(auth, getUsers);

router.route('/mine')
    .get(auth, getMyUser)
    .patch(auth, updateMyUser);

router.route('/symptoms')
    .get(auth, getSymptoms)

router.route('/healthCondition')

    .put(auth, updateHealthCondition);

router.route('/:id')
    .get(auth, getUserById);

export default router;