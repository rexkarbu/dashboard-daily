# Dashboard Daily 🌤️📅

**Dashboard Daily** adalah desktop widget harian berukuran kompak (frameless, semi-transparan, dark-themed) yang selalu terlihat di pojok layar monitor Anda untuk memberikan informasi esensial dalam satu pandangan cepat (*glanceable*):
- 🌤️ **Cuaca Hari Ini**: Integrasi Open-Meteo API tanpa API key dengan cache offline dan geocoding pencarian lokasi langsung.
- 📅 **Agenda Hari Ini**: Jadwal manual harian dengan jam mulai, jam selesai opsional, dan catatan.
- ✅ **To-Do List Harian**: Checklist tugas harian dengan sistem **Daily Rollover** & **Carry-Over** otomatis.
- 📝 **Catatan Cepat**: Memo free-text dengan autosave debounced dan status simpan instan.
- ⚙️ **Widget Controller**: Pengaturan 4 pojok layar (*corner positioning*), Always-On-Top toggle, System Tray, dan Auto-Start saat startup OS.

> **Privasi 100% Lokal**: Tidak ada akun, backend, database server, cloud sync, analytics, atau telemetry. Seluruh data pribadi Anda tersimpan secara lokal dan aman di perangkat pengguna.

---

## 🛠️ Stack Teknologi

- **Electron** + **Electron Forge** (Template Webpack TypeScript)
- **React 19** + **TypeScript** (Strict Mode)
- **Vanilla CSS** dengan Design Tokens & Dark Glassmorphism Theme
- **Zod** (Validasi runtime data model dan payload IPC)
- **Lucide React** (Ikon antarmuka)
- **Vitest** + **@testing-library/react** + **jsdom** (Automated unit & renderer testing)
- **Open-Meteo API** (Geocoding & weather forecast publik)

---

## 🚀 Prasyarat & Instalasi

### Prasyarat
- Node.js versi 18.x atau lebih baru
- npm versi 9.x atau lebih baru

### Instalasi Dependensi
```bash
npm install
```

---

## 💻 Menjalankan & Menguji Aplikasi

### 1. Menjalankan Mode Development
```bash
npm start
```

### 2. Pemeriksaan Type & Lint
```bash
npm run typecheck
npm run lint
```

### 3. Menjalankan Automated Tests
```bash
npm test
```

### 4. Membuat Packaged App & Distributables
```bash
# Package folder executables (out/Dashboard Daily-win32-x64)
npm run package

# Build installer installer resmi (Setup.exe & ZIP untuk Windows)
npm run make
```

---

## 🏗️ Arsitektur Aplikasi

Aplikasi dibangun mengikuti prinsip pemisahan tanggung jawab (*process ownership*) dan keamanan Electron yang ketat:

```
dashboard-daily/
├── assets/icons/          # Ikon aplikasi dan system tray (.png & .ico)
├── src/
│   ├── main/              # Main process: Lifecycle, BrowserWindow, Tray, IPC, AutoStart, Rollover, JsonStore
│   │   ├── ipc/           # IPC Handlers dengan validasi Zod
│   │   ├── services/      # JsonStore (atomic write + backup), WeatherService, LocationService, AutoStartService
│   │   ├── tray/          # System Tray controller & context menu
│   │   ├── utils/         # Local date (non-UTC slice) & AppError
│   │   └── window/        # Frameless window positioning & display change listeners
│   ├── preload/           # ContextBridge aman dengan interface DashboardAPI yang sempit
│   ├── renderer/          # React 19 UI: Components, Features (Weather, Agenda, Todos, Notes, Settings), Styles
│   └── shared/            # Kontrak TypeScript, Zod Schemas, Konstanta IPC Channels, Default Values
└── tests/
    ├── unit/              # Unit tests (local date, rollover, json store, window position, weather codes)
    └── renderer/          # Component interaction tests (Agenda, Todo, Quick Note)
```

### Keamanan Electron (Security Invariants)
- `contextIsolation: true`
- `nodeIntegration: false`
- `sandbox: true`
- `setWindowOpenHandler` menolak popups/window baru (`deny`)
- Navigasi eksternal diblokir di renderer dan dibuka di browser default melalui `shell.openExternal`
- Tidak ada raw `ipcRenderer`, `fs`, `path`, atau `process` yang diekspos ke renderer
- Content Security Policy (CSP) ketat pada dokumen renderer

---

## 📂 Lokasi Penyimpanan Data Lokal

Data disimpan dalam format JSON terenkapsulasi dengan mekanisme atomic temporary write dan recovery cadangan otomatis (`.bak`).

- **Windows**: `%APPDATA%\dashboard-daily\dashboard-daily.json` (atau `%APPDATA%\Dashboard Daily\dashboard-daily.json`)
- **macOS**: `~/Library/Application Support/dashboard-daily/dashboard-daily.json`
- **Linux**: `~/.config/dashboard-daily/dashboard-daily.json`

### Cara Reset / Hapus Data Manual
1. Tutup aplikasi Dashboard Daily dari System Tray (**Keluar**).
2. Hapus file `dashboard-daily.json` dan `dashboard-daily.json.bak` pada folder di atas.
3. Jalankan kembali aplikasi; Dashboard Daily akan otomatis membuat file default baru.

---

## 🔄 Cara Kerja Fitur Unggulan

### 1. Daily Rollover & Carry-Over
- **Idempotent Rollover**: Setiap to-do memiliki `id` dan `seriesId`.
- Saat tanggal lokal berganti (tengah malam, saat aplikasi dibuka, atau saat PC bangun dari sleep), sistem mengelompokkan to-do berdasarkan `seriesId`.
- Tugas yang **belum selesai** dan memiliki opsi **Carry-Over** aktif (`carryOver: true`) akan otomatis dikloning ke tanggal hari ini dengan `carriedFromId` yang merujuk ke item sebelumnya.
- Jika aplikasi tidak dibuka beberapa hari, tugas yang tertunda hanya dibawa **satu kali langsung ke hari saat ini** (tanpa membuat duplikat di hari-hari perantara).
- Rollover berulang pada hari yang sama dijamin aman dan tidak menghasilkan duplikasi item.

### 2. Cuaca Open-Meteo & Cache Cerdas
- Pencarian lokasi menggunakan Open-Meteo Geocoding API secara real-time dengan debounced input.
- Data ramalan cuaca hari ini disimpan dalam cache selama **15 menit**.
- Jika jaringan offline atau permintaan gagal, sistem akan menampilkan data cache terakhir dengan label jelas **"Data tersimpan"**.
- Refresh cuaca otomatis dijalankan setiap **30 menit** di latar belakang.

### 3. Window Positioning & Corner Anchoring
- Widget terpasang di salah satu dari 4 pojok layar: **Kanan Atas**, **Kiri Atas**, **Kanan Bawah**, **Kiri Bawah**.
- Posisi dihitung dinamis berdasarkan `display.workArea` (memperhitungkan taskbar Windows/macOS Dock) dengan margin 16px.
- Saat resolusi monitor berubah atau layar multi-monitor ditambah/dilepas, widget otomatis memposisikan ulang dirinya agar tetap rapi di pojok.

### 4. Auto-Start OS
- Pada **mode development**, auto-start dinonaktifkan demi menjaga kebersihan startup sistem operasi pengembangan.
- Pada **mode packaged/installer**, opsi `launchAtLogin` mendaftarkan aplikasi secara resmi ke Windows Startup / macOS Login Items / Linux XDG Autostart.

---

## ⚠️ Batasan Platform & Catatan Khusus

1. **Jendela Transparan (Transparent Window)**:
   - BrowserWindow transparan pada Electron dirancang frameless dan non-resizable untuk mencegah glitch rendering grafis GPU.
2. **Always-on-Top pada Linux (Wayland)**:
   - Pada desktop environment Linux yang menggunakan Wayland, izin *always-on-top* dikontrol oleh window manager compositing (seperti Mutter/KWin) dan mungkin memiliki batasan kebijakan keamanan compositor.
3. **macOS Code Signing**:
   - Untuk mengaktifkan auto-start dan notifikasi izin secara mulus pada macOS tanpa peringatan Gatekeeper, disarankan menandatangani binary menggunakan sertifikat Apple Developer (Code Signing & Notarization).
