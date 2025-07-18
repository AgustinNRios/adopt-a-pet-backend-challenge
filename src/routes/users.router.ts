import { Router } from 'express';

import usersController from '../controllers/users.controller';
import uploader from '../utils/uploader';

const router = Router();

router.get('/', usersController.getAllUsers);

router.get('/:uid', usersController.getUser);
router.put('/:uid', usersController.updateUser);
router.delete('/:uid', usersController.deleteUser);
router.post(
  '/:uid/documents',
  uploader.documents.array('documents'),
  usersController.uploadDocuments,
);

export default router;
