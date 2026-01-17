import { getDb } from '@/lib/db';

export interface PortfolioImage {
  id: string;
  service_id: string;
  image_url: string;
  display_order: number;
  created_at: string;
}

export function getPortfolioImages(serviceId: string): PortfolioImage[] {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM portfolio_images
    WHERE service_id = ?
    ORDER BY display_order ASC
  `).all(serviceId) as PortfolioImage[];
}

export function addPortfolioImage(data: {
  id: string;
  service_id: string;
  image_url: string;
  display_order?: number;
}): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO portfolio_images (id, service_id, image_url, display_order)
    VALUES (?, ?, ?, ?)
  `).run(data.id, data.service_id, data.image_url, data.display_order || 0);
}

export function deletePortfolioImage(id: string): void {
  const db = getDb();
  db.prepare('DELETE FROM portfolio_images WHERE id = ?').run(id);
}
