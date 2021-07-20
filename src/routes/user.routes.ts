import {Router} from "express";

import{ getUsers, signUp, getUserById } from '../controllers/userController';

const router: Router = Router();

// Authentication routes
router.post('/signup', signUp);
// router.post('/signin', signIn);

router.route('/')
    .get(getUsers);

router.route('/:id')
    .get(getUserById);

export default router;