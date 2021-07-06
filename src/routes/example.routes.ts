import {Router} from 'express';

// import { exampleController } from '../controllers/exampleController'; // if we use a class
import { getExamples, saveExample } from '../controllers/exampleController';
// Just a route for the api
const router: Router = Router();
// Example: the following route must be used ONLY to define RESTful APi routes: http://localhost:3000/example
router.route('/')
    .get(getExamples) // The function the method refferences is located on controllers folder
    .post(saveExample);

export default router;