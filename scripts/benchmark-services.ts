import { readServices } from '@/lib/repositories/services';
import { performance } from 'perf_hooks';

const ITERATIONS = 1000;

async function runBenchmark() {
  console.log(`Starting benchmark for readServices (Async) - ${ITERATIONS} iterations`);

  const start = performance.now();

  for (let i = 0; i < ITERATIONS; i++) {
    const services = await readServices();
    if (!Array.isArray(services)) {
        throw new Error('Expected array of services');
    }
  }

  const end = performance.now();
  const duration = end - start;
  const avg = duration / ITERATIONS;

  console.log(`Total time: ${duration.toFixed(2)}ms`);
  console.log(`Average time per call: ${avg.toFixed(4)}ms`);
}

runBenchmark();
