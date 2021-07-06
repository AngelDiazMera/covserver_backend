import {Router} from 'express';

import { getEnterprises, saveEnterprise, getEnterpriseById } from '../controllers/enterpriseController';

const router: Router = Router();

router.route('/')
    .get(getEnterprises) 
    .post(saveEnterprise);

router.route('/:id')
    .get(getEnterpriseById);

export default router;