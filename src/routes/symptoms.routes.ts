import {Router} from 'express'
import passport from 'passport'

import { saveSymptoms } from '../controllers/symptomsController'

const router: Router = Router();
const auth = passport.authenticate('jwt', { session: false})

// Routes which need authentication
router.route('/mine')
    .post(auth, saveSymptoms);

export default router;