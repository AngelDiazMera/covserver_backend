import {Router} from 'express';

import { getGroups, saveGroup, getGroupById } from '../controllers/groupsController';

const router: Router = Router();

router.route('/')
    .get(getGroups) 
    .post(saveGroup);

router.route('/:id')
    .get(getGroupById);

export default router;