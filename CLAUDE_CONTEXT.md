# CeritaKita Project Context

> **Instruksi:** Copy-paste isi file ini di awal conversation baru dengan Claude untuk melanjutkan konteks.

---

## Project Overview

**Nama:** CeritaKita Photography Booking System
**Tech Stack:** Next.js 14, TypeScript, SQLite (better-sqlite3), Tailwind CSS
**Database:** SQLite di `data/bookings.db`
**Deployment:** VPS

---

## Layanan/Services

CeritaKita adalah studio foto dengan layanan:
- Prewedding (Bronze, Silver, Gold)
- Wedding
- Wisuda / Graduation
- Birthday
- Family
- Tematik (Christmas, Lebaran, Imlek)
- Outdoor / On Location
- Pas Foto
- Self Photo

---

## Status Terakhir (Update: Januari 2026)

### Homepage Baru (DONE)
Homepage sudah diupdate dengan section:
- HeroSection - "Abadikan Setiap Momen Berharga"
- AboutSection - "Studio Foto untuk Setiap Cerita Anda"
- PackagesGrid - 6 kategori layanan (prewedding, wedding, wisuda, birthday, family, tematik)
- WhyChooseUsSection - 4 value props (Fotografer, Hasil Cepat, Harga Transparan, Lokasi Fleksibel)
- PromoSection - Promo seasonal
- TestimonialsSection - 3 testimonials
- CTASection - "Siap Mengabadikan Momen Anda?"
- Footer - Updated tagline

**Masalah:** Semua konten HARDCODED di komponen React, belum bisa dikelola dari admin.

### Rencana Migrasi ke Prisma (IN PROGRESS)

Alasan migrasi:
- Butuh proper migration system untuk safe deployment
- Saat ini pakai better-sqlite3 dengan raw SQL
- Migrasi manual dengan try/catch (rawan error)

Langkah-langkah:
1. ✅ Keputusan: Tetap pakai SQLite + Prisma (bukan PostgreSQL)
2. ⏳ Setup Prisma dengan introspect existing DB
3. ⏳ Buat baseline migration
4. ⏳ Tambah tabel baru untuk Homepage CMS
5. ⏳ Update API routes ke Prisma
6. ⏳ Deploy ke VPS dengan `prisma migrate deploy`

### Rencana Homepage CMS (PENDING - after Prisma)

Tabel baru yang akan ditambahkan:
- `homepage_content` - Key-value untuk hero, about, cta, footer, promo
- `service_categories` - Kategori layanan untuk homepage
- `testimonials` - Testimonials dinamis
- `value_propositions` - "Mengapa Memilih CeritaKita"

Admin panel yang akan dibuat:
- /admin/homepage - Tab-based editor (Hero, About, Layanan, Keunggulan, Testimonials, Promo & CTA)

---

## Database Schema (Current - better-sqlite3)

Tabel existing di `lib/db.ts`:
- photographers
- bookings
- payments
- addons
- booking_addons
- reschedule_history
- coupons
- coupon_usage
- portfolio_images
- users
- payment_methods
- ads_performance_log
- system_settings
- system_settings_audit
- leads

---

## File Structure (Homepage)

```
components/homepage/
├── Navbar.tsx
├── HeroSection.tsx (hardcoded)
├── AboutSection.tsx (hardcoded)
├── PackagesGrid.tsx (hardcoded - BUKAN dari DB services)
├── WhyChooseUsSection.tsx (hardcoded)
├── PromoSection.tsx (hardcoded)
├── TestimonialsSection.tsx (hardcoded)
├── CTASection.tsx (hardcoded)
├── Footer.tsx (hardcoded)
└── index.ts
```

---

## Deployment Info

- **Platform:** VPS
- **Database Location:** `data/bookings.db`
- **Scale:** Kecil-menengah
- **Process Manager:** PM2

---

## Next Steps (To-Do)

1. **Migrasi ke Prisma:**
   ```bash
   npm install prisma @prisma/client
   npx prisma init --datasource-provider sqlite
   npx prisma db pull
   # Buat baseline migration
   # Test di local
   ```

2. **Di VPS setelah migrasi:**
   ```bash
   cp data/bookings.db data/bookings.db.backup-$(date +%Y%m%d)
   git pull
   npm install
   npx prisma migrate resolve --applied 0_init
   npx prisma migrate deploy
   pm2 restart ceritakita
   ```

3. **Setelah Prisma ready:**
   - Tambah tabel Homepage CMS
   - Buat API endpoints untuk homepage content
   - Update komponen homepage untuk fetch dari API
   - Buat admin panel untuk manage homepage content

---

## Prompt yang Sudah Disiapkan

### Prompt untuk Implementasi Homepage CMS (Full)
Lihat conversation sebelumnya - sudah ada prompt lengkap untuk:
- Database schema (homepage_content, service_categories, testimonials, value_propositions)
- API endpoints
- Admin panel pages
- Frontend component updates
- Seed data

---

## Notes

- WhatsApp number hardcoded di 3 tempat: PromoSection, CTASection, Footer (`6281234567890`)
- Services di PackagesGrid TIDAK terhubung ke `data/services.json`
- Image assets di `/images/` folder (static)

---

## Cara Melanjutkan Conversation

Paste context ini di awal chat baru, lalu sampaikan:

> "Saya ingin melanjutkan project CeritaKita. Context ada di atas.
> Status terakhir: [sebutkan langkah terakhir yang sudah dilakukan]
> Sekarang saya mau: [sebutkan apa yang ingin dilakukan]"

---

*Last updated: 2026-01-09*
