import { Router } from 'express';

import sessionsController from '../controllers/sessions.controller';

const router = Router();

router.post('/register', sessionsController.register);
router.post('/login', sessionsController.login);
router.post('/logout', sessionsController.logout);
router.get('/current', sessionsController.current);
router.post('/unprotectedLogin', sessionsController.unprotectedLogin);
router.get('/unprotectedCurrent', sessionsController.unprotectedCurrent);

export default router;
