import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { JobProcessor } from '../jobs/jobProcessor';

// Add job body type
interface AddJobBody {
  name: string;
  args: {
    complexity: string
    failProbability: string;
  }
}

// Custom type for typed request body
interface TypedRequestBody<T> extends Request {
  body: T;
}

const processor = new JobProcessor(5);


export const getJobs = asyncHandler(async (_req: Request, res: Response) => {
  res.json(processor.getAllStatuses());
});

export const startJob = asyncHandler(async (req: TypedRequestBody<AddJobBody>, res: Response) => {
  console.log(req.body);
  const {name} = req.body;
  const {complexity, failProbability} = req.body.args;
  processor.addJob(name, [complexity, failProbability]);
  res.send(`${name} started with complexity ${complexity} and fail probability ${failProbability}%`);
});

export const getStats = asyncHandler(async (_req: Request, res: Response) => {
  res.json(processor.getStats());
});
