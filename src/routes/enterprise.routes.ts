import {Router} from 'express';

import { getEnterprises, saveEnterprise, getEnterpriseById, isEmailUnique } from '../controllers/enterpriseController';

const router: Router = Router();

router.route('/')
    .get(getEnterprises) 
    .post(saveEnterprise);
    
router.route('/:id')
    .get(getEnterpriseById);
    
router.route('/email_validation/:email')
    .get(isEmailUnique);

export default router;