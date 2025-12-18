import { merge, Observable, share, Subject } from 'rxjs';
import { v7 as uuidv7 } from 'uuid';

/**
 * @version 0.0.1
 * @description
 *
 * T:  the job payload that will be processed by the worker
 * E:  the event type that will be emitted by the worker
 */
export class WorkerPool<T, E> {
  private readonly idleWorkers: Worker[] = [];
  private readonly pendingJobs: JobItem<T, E>[] = [];
  private readonly runningJobs: JobItem<T, E>[] = [];
  private readonly completedJobs: JobItem<T, E>[] = [];
  private readonly job2worker: WeakMap<JobItem<T, E>, Worker> = new WeakMap();

  private isPaused = false;

  public completed$ = new Subject<string>();

  constructor(
    private readonly creator: () => Worker,
    private options: WorkerPoolOptions,
  ) {
    // Array.from can accept an array-like object with length property and indexed properties (undefined here)
    this.idleWorkers = Array.from({ length: options.size }, this.creator);

    this.completed$.subscribe((jobId) => {
      this.release(jobId);
    });
  }

  /**
   * @description submit a job / job list to the worker pool.
   * Must manually subscribe the `stream$` to run jobs in this batch.
   */
  public submit(job: T): Observable<WorkerPoolMessage<E>>;
  public submit(job: T[]): Observable<WorkerPoolMessage<E>>;
  public submit(job: T | T[]): Observable<WorkerPoolMessage<E>> {
    const jobList = Array.isArray(job) ? job : [job];
    const jobItems = jobList.map((job) => {
      return {
        id: uuidv7(),
        payload: job,
        subject: new Subject<WorkerPoolMessage<E>>(),
        status: 'pending',
      } satisfies JobItem<T, E>;
    });
    const merge$ = merge(...jobItems.map((item) => item.subject.asObservable()));
    /**
     * 1. Subject is "Hot": It multicasts values to observers. If data is emitted before
     *    any observer subscribes, that data is lost forever (like a live TV broadcast).
     *    In this case, we use dispatch() to automatically run after submission, so we will miss the early events before subscription outside.
     *
     * 2. Observable is "Cold" (Lazy): The execution logic (dispatching the job) is defined but only runs when someone subscribes.
     */
    const stream$ = new Observable<WorkerPoolMessage<E>>((subscriber) => {
      const jobListSubscription = merge$.subscribe(subscriber);

      this.pendingJobs.push(...jobItems);
      this.dispatch();

      return jobListSubscription;
    }).pipe(share());

    return stream$;
  }

  private dispatch(): void {
    if (this.isPaused) return;
    // only dispatch jobs if there are idle workers and pending jobs
    while (this.idleWorkers.length > 0 && this.pendingJobs.length > 0) {
      const job = this.pendingJobs.shift();
      const worker = this.idleWorkers.shift();

      // self-defend coding
      // theoretically, job and worker should not be undefined inside the loop
      if (job && worker) {
        job.status = 'running';
        this.runningJobs.push(job);
        this.job2worker.set(job, worker);
        worker.postMessage(job.payload);
        // transfer the data from worker to the invoker. let invoker handle the data by themselves.
        worker.onmessage = (e: MessageEvent<E>) => {
          job.subject.next({ jobId: job.id, payload: e.data });
        };

        //TODO: onError and onComplete
      }
    }
  }

  private release(jobId: string): void {
    const job = this.runningJobs.find((job) => job.id === jobId);
    if (job) {
      job.status = 'completed';
      job.subject.complete();
      this.runningJobs.splice(this.runningJobs.indexOf(job), 1);
      this.completedJobs.push(job);
      const worker = this.job2worker.get(job);
      this.job2worker.delete(job);
      if (worker) {
        this.idleWorkers.push(worker);
        this.dispatch();
      }
    }
  }

  public pause(): void {
    this.isPaused = true;
  }

  public resume(): void {
    this.isPaused = false;
    this.dispatch();
  }
}

/**
 * @description Worker pool configurations
 */
interface WorkerPoolOptions {
  size: number;
}

/**
 * @description Worker pool job item
 */
interface JobItem<T, E> {
  /** unique identifier for the job */
  id: string;
  /** user provided job payload */
  payload: T;
  /** the subject object that emits messages from the worker to the invoker*/
  subject: Subject<WorkerPoolMessage<E>>;
  status: 'pending' | 'running' | 'completed';
}

interface WorkerPoolMessage<E> {
  jobId: string;
  payload: E;
}
