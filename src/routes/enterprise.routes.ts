import {Router} from 'express'
import passport from 'passport'

import { getEnterprises, getMyEnterprise, updateEnterprise, isEmailUnique, signUp, signIn } from '../controllers/enterpriseController'

const router: Router = Router();
const auth = passport.authenticate('jwt', { session: false})

// Authentication routes
router.post('/signup', signUp);
router.post('/signin', signIn);

// Routes which need authentication
router.route('/')
    .get(auth, getEnterprises);
    
router.route('/mine')
    .get(auth, getMyEnterprise)
    .post(auth, updateEnterprise);

// Routes which do not need authentication
router.route('/email_validation/:email')
    .get(isEmailUnique);

export default router;