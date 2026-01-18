import 'server-only';
import { getDb } from './db';

/**
 * Performance Monitoring Utility
 */

export interface PerformanceMetric {
    operation: string;
    module: string;
    executionTimeMs: number;
    metadata?: any;
}

/**
 * Record a performance metric in the database
 */
export async function recordMetric(metric: PerformanceMetric) {
    try {
        const db = getDb();
        const stmt = db.prepare(`
      INSERT INTO performance_metrics (operation, module, execution_time_ms, metadata)
      VALUES (?, ?, ?, ?)
    `);

        stmt.run(
            metric.operation,
            metric.module,
            metric.executionTimeMs,
            metric.metadata ? JSON.stringify(metric.metadata) : null
        );
    } catch (error) {
        console.error('Failed to record performance metric:', error);
    }
}

/**
 * Utility function to track operation performance
 */
export async function trackPerformance<T>(
    operation: string,
    module: string,
    fn: () => Promise<T>,
    metadata?: any
): Promise<T> {
    const start = performance.now();
    try {
        const result = await fn();
        const end = performance.now();

        // Non-blocking recording
        recordMetric({
            operation,
            module,
            executionTimeMs: end - start,
            metadata
        });

        return result;
    } catch (error) {
        const end = performance.now();
        recordMetric({
            operation: `${operation}_error`,
            module,
            executionTimeMs: end - start,
            metadata: { ...metadata, error: error instanceof Error ? error.message : String(error) }
        });
        throw error;
    }
}

/**
 * Get performance statistics for a specific module or operation
 */
export async function getPerformanceStats(module?: string, days: number = 7) {
    try {
        const db = getDb();
        let query = `
      SELECT 
        operation,
        COUNT(*) as count,
        AVG(execution_time_ms) as avg_time,
        MAX(execution_time_ms) as max_time,
        MIN(execution_time_ms) as min_time
      FROM performance_metrics
      WHERE timestamp >= datetime('now', ?)
    `;
        const params: any[] = [`-${days} days`];

        if (module) {
            query += ' AND module = ?';
            params.push(module);
        }

        query += ' GROUP BY operation';

        const stats = db.prepare(query).all(...params);
        return stats;
    } catch (error) {
        console.error('Failed to fetch performance stats:', error);
        return [];
    }
}
