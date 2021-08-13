import {Router} from 'express'
import passport from 'passport'

import { deleteSymptoms, saveSymptoms } from '../controllers/symptomsController'

const router: Router = Router();
const auth = passport.authenticate('jwt', { session: false})

// Routes which need authentication
router.route('/mine')
    .post(auth, saveSymptoms)
    .delete(auth, deleteSymptoms);

export default router;