/// <reference lib="webworker" />
import SparkMD5 from 'spark-md5';

export type FileHashComputationItem = {
  file: File;
  /** @description the size (byte) of each chunk, which is applied inside the worker to incrementally calculate the hash */
  chunkSize: number;
};

export type FileHashComputationResult = {
  type: 'result';
  /** @description the name of the file */
  fileName: string;
  /** @description the size (byte) of the file */
  fileSize: number;
  /** @description the hash of the file */
  hash: string;
};

export type FileHashComputationProgress = {
  type: 'progress';
  /** @description the current chunk index (0-based) */
  currentChunk: number;
  /** @description the total number of chunks */
  totalChunks: number;
};

export type FileHashComputationError = {
  type: 'error';
  /** @description the error message */
  errorMessage: string;
  /** @description the error type */
  errorType: string;
};

self.onmessage = async (e: MessageEvent<FileHashComputationItem>) => {
  const { file, chunkSize } = e.data;

  const spark = new SparkMD5.ArrayBuffer();
  const chunks = Math.ceil(file.size / chunkSize);
  console.log(`File Name: ${file.name}\n Size: ${file.size}\n Chunks: ${chunks}`);
  let currentChunk = 0;

  const loadNext = async () => {
    try {
      const start = currentChunk * chunkSize;
      const end = start + chunkSize >= file.size ? file.size : start + chunkSize;

      const chunk = file.slice(start, end);
      const chunkBuffer = await chunk.arrayBuffer();
      spark.append(chunkBuffer);
      self.postMessage({ type: 'progress', currentChunk, totalChunks: chunks });
      currentChunk++;
      if (currentChunk < chunks) {
        loadNext();
      } else {
        const hash = spark.end();
        self.postMessage({ type: 'result', fileName: file.name, fileSize: file.size, hash });
        spark.destroy();
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '计算Hash时发生未知错误';
      const errorType = err instanceof Error ? err.name : 'UnknownError';
      self.postMessage({ type: 'error', errorType, errorMessage });
    }
  };

  loadNext();
};

self.onerror = (e) => {
  const message = typeof e === 'string' ? e : (e as ErrorEvent).message;
  self.postMessage({ type: 'error', errorType: 'WorkerUncaughtError', errorMessage: message });
};
