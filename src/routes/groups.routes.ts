import {Router} from 'express';

import { getGroups, saveGroup, getGroupById, getQR } from '../controllers/groupsController';

const router: Router = Router();

router.route('/qr')
    .post(getQR);    

router.route('/')
    .get(getGroups) 
    .post(saveGroup);

router.route('/:id')
    .get(getGroupById);

export default router;