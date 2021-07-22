import {Router} from "express";

import{ getUsers, saveUser, getUserById } from '../controllers/userController';

const router: Router = Router();

router.route('/')
    .get(getUsers)
    .post(saveUser);

router.route('/:id')
    .get(getUserById);

export default router;