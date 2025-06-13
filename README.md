# Jobs Running Service

A Node.js backend service for launching, monitoring, and managing native processing jobs concurrently.  
Supports job status tracking, output capture, concurrency control and retry for failed jobs.
Job statuses: pending, running, completed, failed, error.

---

## Features

- Launch native (OS) processes as jobs (simulated by using batch file)
- Monitor job status, output, and exit codes
- Configurable concurrency (number of parallel jobs and queue for pending jobs)
- Retry for failed jobs (for each failed job new job created with the same parameters and run one more time)
- REST API for submitting jobs and querying status
- Written in TypeScript for type safety


---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)
- [npm](https://www.npmjs.com/)

### Installation and build

    git clone https://github.com/leonidgiliutin/jobs-assignment.git
    cd jobs-service
    npm install
    npm run build


## Usage

### Start the Service

    npm run start


### Example: Submit a Job

    Send a POST request to `/api/jobs` with the command and arguments:
        curl -X POST -H "Content-Type: application/json" -d "{"name": "task name", "args": {"complexity": "72", "failProbability"": "8"}}" "http://localhost:3000/api/jobs"

    or use
        ./add_jobs.bat 20
    in order to send a number of requests with randomly assigned job parameters 

### Job parameters

| Parameter       | Description
|-----------------|------------------------------------------------
| name            | Job name
| complexity      | "Complexity" of simulated job, affects job duration
| failProbability | "Probability" of fail, affects job success/fail

---

## API Endpoints

| Method | Endpoint           | Description                                                     |
|--------|--------------------|-----------------------------------------------------------------|
| POST   | `/api/jobs`        | Submit a new job                                                |
| GET    | `/api/jobs`        | Returns a list of all submitted jobs and their current statuses |
| GET    | `/api/stats`       | Return correlations between various job characteristics and job |
|        |                    | success.                                                        |

---

