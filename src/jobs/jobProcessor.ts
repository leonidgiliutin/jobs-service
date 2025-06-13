import { spawn, ChildProcessByStdio } from 'child_process';
import { Writable, Readable } from 'stream';

type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'error';

interface JobInfo {
  name: string;
  status: JobStatus;
  startTime?: number;
  endTime?: number;
  complexity: string;
  failProbability: string;
}

interface JobData {
  process?: ChildProcessByStdio<null, Readable, Readable>;
  exitCode?: number | null;
  output?: string;
  error?: string;
  info: JobInfo;
}

export class JobProcessor {
  private concurrency: number;
  private running: number = 0;
  private queue: Array<() => void> = [];
  private jobs: Map<string, JobData> = new Map();

  constructor(concurrency: number = 4) {
    this.concurrency = concurrency;
  }

  addJob(name: string, args: string[]): string {
    const jobId = Date.now() + Math.random().toString(36).substring(2, 9);
    this.jobs.set(jobId, {info: {name: name, status: 'pending', complexity: args[0], failProbability: args[1] }});

    const runJob = () => {
      this.running++;
      const child = spawn('.\\run_job.bat', [name, ...args], {
        stdio: ['inherit', 'pipe', 'pipe'],
        shell: true
      });

      const jobData: JobData = {
        process: child,
        output: '',
        info: {
          name: name,
          status: 'running',
          startTime: Date.now(),
          complexity: args[0],
          failProbability: args[1]
        }
      };
      this.jobs.set(jobId, jobData);

      child.stdout.on('data', (data: Buffer) => {
        jobData.output += data.toString();
      });

      child.stderr.on('data', (data: Buffer) => {
        jobData.output += data.toString();
      });

      child.on('exit', (code: number | null) => {
        jobData.info.status = code === 0 ? 'completed' : 'failed';
        jobData.info.endTime = Date.now();
        jobData.exitCode = code;
        this.running--;
        this.next();
        if(jobData.info.status === 'failed' && !jobData.info.name.endsWith('-retry')) {
          this.addJob(jobData.info.name + '-retry', [jobData.info.complexity, jobData.info.failProbability, 'retry']);
        }
      });

      child.on('error', (err: Error) => {
        jobData.info.status = 'error';
        jobData.error = err.message;
        jobData.info.endTime = Date.now();
        this.running--;
        this.next();
      });
    };

    if (this.running < this.concurrency) {
      runJob();
    } else {
      this.queue.push(runJob);
    }

    return jobId;
  }

  private next() {
    if (this.queue.length > 0 && this.running < this.concurrency) {
      const nextJob = this.queue.shift();
      if (nextJob) nextJob();
    }
  }

  getStats() {
    const arr = Array.from(this.jobs.values());
    const total = arr.length;

    const filterByStatus = (arr: JobData[], status: JobStatus) => {
      return arr.filter(value => value.info.status === status);
    }

    
    const completed = filterByStatus(arr, 'completed');
    const failed = filterByStatus(arr, 'failed');
    const running = filterByStatus(arr, 'running');
    const pending = filterByStatus(arr, 'pending');

    const calcPattern = (filter: (value: JobData) => boolean, name: string) => {
      const jobs = arr.filter(filter);
      return {
        pattern: name, matchCount: jobs.length,
        completed: filterByStatus(jobs, 'completed').length,
        failed: filterByStatus(jobs, 'failed').length,
        retried: jobs.filter(value => value.info.name.endsWith('retry')).length
      };
    }

    return {totalJobs: total, completed: completed.length, failed: failed.length, running: running.length, pending: pending.length,
      patterns: [
        calcPattern((value: JobData) => (Number(value.info.complexity) <= 50), "Complexity <= 50"),
        calcPattern((value: JobData) => (Number(value.info.complexity) > 50), 'Complexity > 50'),
        calcPattern((value: JobData) => (Number(value.info.failProbability) <= 50), 'Fail probability <= 50'),
        calcPattern((value: JobData) => (Number(value.info.failProbability) > 50), 'Fail probability > 50'),
        calcPattern((value: JobData) => (value.info.name.endsWith('retry')), 'Retried'),
        calcPattern((value: JobData) => (
          (value.info.endTime !== undefined && value.info.startTime !== undefined) && (value.info.endTime - value.info.startTime) <= 10000), 'Duration <= 10 sec')
      ]};

  }

  getAllStatuses() {
    return Array.from(this.jobs.values()).map( (value) => value.info);
  }

}
