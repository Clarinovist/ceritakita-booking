import fs from 'fs';
import path from 'path';
import lockfile from 'proper-lockfile';

const SERVICES_PATH = path.join(process.cwd(), 'data', 'services.json');

export interface Service {
  id: string;
  name: string;
  basePrice: number;
  discountValue: number;
  isActive: boolean;
  badgeText?: string;
  benefits?: string[];
}

export async function readServices(): Promise<Service[]> {
  try {
    const fileContent = await fs.promises.readFile(SERVICES_PATH, 'utf-8');
    return JSON.parse(fileContent) as Service[];
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      const defaultServices: Service[] = [
        { id: '1', name: 'Indoor Studio', basePrice: 0, discountValue: 0, isActive: true },
        { id: '2', name: 'Outdoor / On Location', basePrice: 0, discountValue: 0, isActive: true },
        { id: '3', name: 'Wedding', basePrice: 0, discountValue: 0, isActive: true },
        { id: '4', name: 'Prewedding Bronze', basePrice: 0, discountValue: 0, isActive: true },
        { id: '5', name: 'Prewedding Silver', basePrice: 0, discountValue: 0, isActive: true },
        { id: '6', name: 'Prewedding Gold', basePrice: 0, discountValue: 0, isActive: true },
        { id: '7', name: 'Wisuda', basePrice: 0, discountValue: 0, isActive: true },
        { id: '8', name: 'Family', basePrice: 0, discountValue: 0, isActive: true },
        { id: '9', name: 'Birthday', basePrice: 0, discountValue: 0, isActive: true },
        { id: '10', name: 'Pas Foto', basePrice: 0, discountValue: 0, isActive: true },
        { id: '11', name: 'Self Photo', basePrice: 0, discountValue: 0, isActive: true },
      ];
      await fs.promises.writeFile(SERVICES_PATH, JSON.stringify(defaultServices, null, 2), 'utf-8');
      return defaultServices;
    }
    console.error("Error parsing services file:", error);
    return [];
  }
}

export async function writeServices(data: Service[]): Promise<void> {
  let release: (() => Promise<void>) | null = null;

  try {
    // Acquire exclusive lock
    release = await lockfile.lock(SERVICES_PATH, {
      retries: {
        retries: 5,
        minTimeout: 100,
        maxTimeout: 1000,
      }
    });

    // Write data
    try {
      await fs.promises.writeFile(SERVICES_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err: any) {
      // Provide a clearer error message for permission issues so operators know how to fix
      if (err.code === 'EACCES' || err.code === 'EPERM') {
        console.error(`Permission error writing services file: ${SERVICES_PATH}. Please ensure the container user can write to the data directory.`);
        // Re-throw a descriptive error so API layer returns 500 with context
        const e = new Error(`EACCES: cannot write services file (${SERVICES_PATH}). Ensure ./data is writable by the container user or set the service user in docker-compose.`);
        // attach original code for logging downstream
        (e as any).code = err.code;
        throw e;
      }
      throw err;
    }
  } catch (error) {
    console.error("Error writing services file:", error);
    throw error;
  } finally {
    if (release) {
      await release();
    }
  }
}
