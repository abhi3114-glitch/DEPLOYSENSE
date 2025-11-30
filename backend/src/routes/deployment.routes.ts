import { Router } from 'express';
import { createDeployment, getDeployment } from '../controllers/deployment.controller';

const router = Router();

router.post('/', createDeployment);
router.get('/:id', getDeployment);

export default router;