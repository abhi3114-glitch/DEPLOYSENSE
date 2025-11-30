import { Router } from 'express';
import { getCertificate, getCertificateHTML } from '../controllers/certificate.controller';

const router = Router();

router.get('/:id', getCertificateHTML);

export default router;