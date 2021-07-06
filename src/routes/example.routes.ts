import {Router} from 'express';

import { exampleController } from '../controllers/exampleController';
// Just a route for the api
const router: Router = Router();
// Example: the following route must be used ONLY to define RESTful APi routes: http://localhost:3000/example
router.route('/')
    .get(exampleController.index) // The function the method refferences is located on controllers folder
    .post(exampleController.saveExample);

export default router;