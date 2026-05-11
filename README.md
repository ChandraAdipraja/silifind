# SiliFind

SiliFind adalah aplikasi lost and found kampus untuk membantu pengguna melaporkan barang hilang, mencatat barang ditemukan, mengajukan klaim kepemilikan, dan memverifikasi pengembalian barang melalui dashboard admin/operator.

Repository ini berbentuk monorepo dengan tiga aplikasi utama:

- `server` - REST API berbasis Express, MongoDB, JWT, dan Cloudinary.
- `web` - dashboard admin/operator berbasis Next.js.
- `mobile` - aplikasi mobile pengguna berbasis Expo React Native.

## Fitur Utama

### Mobile App

- Registrasi dan login pengguna.
- Melihat ringkasan laporan dan status klaim.
- Mencari laporan barang hilang atau barang ditemukan.
- Membuat laporan barang hilang atau ditemukan.
- Upload foto barang melalui Cloudinary.
- Menggunakan lokasi perangkat untuk laporan barang ditemukan.
- Melihat detail laporan.
- Mengajukan klaim barang ditemukan dengan deskripsi bukti dan foto opsional.
- Melihat status klaim: `pending`, `approved`, atau `rejected`.

### Web Admin Dashboard

- Login khusus `admin` dan `operator`.
- Dashboard statistik laporan dan klaim.
- Melihat dan memfilter laporan berdasarkan tipe/status.
- Melihat detail laporan lengkap dengan foto dan pelapor.
- Melihat antrean klaim.
- Approve atau reject klaim.
- Saat klaim disetujui, status report otomatis menjadi `returned` dan klaim pending lain untuk report yang sama ditolak.
- Manajemen user khusus role `admin`.
- Mengubah data user dan role: `user`, `operator`, `admin`.
- Menghapus user, kecuali akun yang sedang digunakan.

### Backend API

- Auth dengan JWT.
- Role-based access control.
- CRUD laporan.
- Workflow klaim barang.
- Upload gambar ke Cloudinary.
- Seed akun demo untuk admin, operator, dan user.

## Tech Stack

| Bagian | Teknologi |
| --- | --- |
| Backend | Node.js, Express, MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| Upload | Multer, Cloudinary |
| Web Dashboard | Next.js, React, Tailwind CSS, Axios, Lucide React |
| Mobile App | Expo, React Native, Expo Router, NativeWind, Axios |
| Storage Mobile | AsyncStorage |

## Struktur Folder

```text
silifind/
- server/
  - server.js
  - src/
    - app.js
    - config/
    - controllers/
    - middleware/
    - models/
    - routes/
    - seed/
- web/
  - app/
  - components/
  - lib/
  - public/
- mobile/
  - app/
  - components/
  - contexts/
  - hooks/
  - lib/
  - assets/
```

## Prasyarat

Pastikan sudah terpasang:

- Node.js 20 atau lebih baru
- npm
- MongoDB database, lokal atau MongoDB Atlas
- Akun Cloudinary
- Expo Go atau emulator Android/iOS untuk menjalankan aplikasi mobile

## Environment Variables

Buat file `.env` pada folder `server`.

```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/silifind
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Opsional untuk `web/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

Opsional untuk `mobile/.env`:

```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

Catatan untuk mobile:

- Jika menjalankan di Android emulator, gunakan `http://10.0.2.2:5000/api`.
- Jika menjalankan di perangkat fisik, gunakan IP lokal komputer, misalnya `http://192.168.1.10:5000/api`.
- Jika environment variable tidak diisi, web dan mobile akan memakai API default production: `https://silifind.onrender.com/api`.

Jangan commit file `.env` atau `.env.local`.

## Instalasi

Install dependency untuk masing-masing aplikasi.

```bash
cd server
npm install

cd ../web
npm install

cd ../mobile
npm install
```

## Menjalankan Project

### 1. Jalankan Backend

```bash
cd server
npm run dev
```

API akan berjalan di:

```text
http://localhost:5000/api
```

Cek health endpoint:

```text
GET http://localhost:5000/api/health
```

### 2. Jalankan Web Admin

```bash
cd web
npm run dev
```

Buka:

```text
http://localhost:3000
```

Halaman root akan redirect ke `/login`.

### 3. Jalankan Mobile App

```bash
cd mobile
npm start
```

Lalu pilih target dari Expo:

- Android emulator
- iOS simulator
- Expo Go di perangkat fisik
- Web preview

## Seed User Demo

Backend menyediakan script seed user.

```bash
cd server
npm run seed:users
```

Akun demo yang dibuat:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@silifind.com` | `admin123` |
| Operator | `operator@silifind.com` | `operator123` |
| User | `user@silifind.com` | `user123` |

Gunakan akun demo hanya untuk development/testing.

## Role dan Hak Akses

| Role | Akses |
| --- | --- |
| `user` | Menggunakan aplikasi mobile, membuat laporan, membuat klaim, melihat klaim sendiri |
| `operator` | Mengakses dashboard web, melihat laporan, melihat semua klaim, approve/reject klaim |
| `admin` | Semua akses operator, ditambah manajemen user dan role |

## API Endpoint Utama

Base URL:

```text
/api
```

### Public

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| GET | `/health` | Cek status API |
| GET | `/endpoints` | Melihat daftar endpoint |
| POST | `/auth/register` | Registrasi user |
| POST | `/auth/login` | Login user |
| GET | `/reports` | Melihat semua laporan |
| GET | `/reports/:id` | Melihat detail laporan |

### Authenticated User

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| GET | `/auth/profile` | Melihat profile user login |
| POST | `/reports` | Membuat laporan |
| PUT | `/reports/:id` | Update laporan milik sendiri |
| DELETE | `/reports/:id` | Hapus laporan milik sendiri |
| POST | `/claims` | Membuat klaim barang ditemukan |
| GET | `/claims/my-claims` | Melihat klaim milik user login |
| POST | `/uploads` | Upload gambar |

### Admin / Operator

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| GET | `/claims` | Melihat semua klaim |
| PUT | `/claims/:id/approve` | Menyetujui klaim |
| PUT | `/claims/:id/reject` | Menolak klaim |

### Admin Only

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| GET | `/users` | Melihat semua user |
| PUT | `/users/:id` | Update data user |
| PUT | `/users/:id/role` | Update role user |
| DELETE | `/users/:id` | Hapus user |

## Model Data

### User

- `name`
- `email`
- `password`
- `phoneNumber`
- `role`: `user`, `operator`, `admin`

### Report

- `title`
- `category`
- `description`
- `image`
- `location`
- `type`: `lost`, `found`
- `status`: `open`, `claimed`, `returned`
- `reportedBy`

### Claim

- `claimant`
- `report`
- `proofDescription`
- `proofImage`
- `status`: `pending`, `approved`, `rejected`
- `verifiedBy`

## Script yang Tersedia

### Server

```bash
npm run dev
npm start
npm run seed:users
```

### Web

```bash
npm run dev
npm run build
npm start
npm run lint
```

### Mobile

```bash
npm start
npm run android
npm run ios
npm run web
npm run lint
```

## Catatan Deployment

- Backend dapat dideploy ke Render, Railway, Fly.io, atau platform Node.js lain.
- Web dashboard dapat dideploy ke Vercel atau platform Next.js lain.
- Mobile app dapat dibuild menggunakan EAS Build.
- Pastikan environment production memakai `JWT_SECRET` yang kuat.
- Pastikan domain frontend yang dipakai sudah diperbolehkan oleh konfigurasi CORS jika CORS diperketat.
- Jangan gunakan akun seed demo untuk production.

## Lisensi

Project ini belum mendefinisikan lisensi khusus. Tambahkan file `LICENSE` sebelum publikasi jika diperlukan.
