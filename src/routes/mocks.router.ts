import { Router } from 'express';

import mocksController from '../controllers/mocks.controller';

const router = Router();

router.get('/mockingpets', mocksController.mockingPets);
router.get('/mockingusers', mocksController.mockingUsers);
router.post('/generateData', mocksController.generateData);

export default router;
