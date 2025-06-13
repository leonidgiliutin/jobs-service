import { Router } from 'express';
import { getJobs, startJob, getStats } from '../controllers/jobController';

const router = Router();

router.post("/jobs/", startJob);
router.get('/jobs/', getJobs);
router.get("/stats/", getStats);

export default router;
