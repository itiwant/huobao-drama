# 🎬 Huobao Drama - Nền tảng tạo phim ngắn bằng AI

<div align="center">

**Nền tảng full-stack TypeScript cho sản xuất phim ngắn bằng AI tự động**

[![Node Version](https://img.shields.io/badge/Node.js-20+-339933?style=flat&logo=node.js)](https://nodejs.org)
[![Vue Version](https://img.shields.io/badge/Vue-3.x-4FC08D?style=flat&logo=vue.js)](https://vuejs.org)
[![License](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)
[![Download](https://img.shields.io/github/v/release/chatfire-AI/huobao-drama?style=flat&logo=github&label=T%E1%BA%A3i%20v%E1%BB%81)](https://github.com/chatfire-AI/huobao-drama/releases/latest)

[English](README.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | **Tiếng Việt**

[Tính năng](#-tính-năng) • [Bắt đầu nhanh](#-bắt-đầu-nhanh) • [Hướng dẫn trực quan](#-hướng-dẫn-trực-quan) • [Ứng dụng Desktop](#-ứng-dụng-desktop-khuyến-nghị) • [Triển khai](#-triển-khai)

<h2>🔑 <a href="https://api.firemux.com">Lấy Huobao API Key 👉 Xem ngay</a></h2>

**Toàn bộ năng lực AI văn bản · hình ảnh · video, chỉ cần một Key là dùng được hết**

Sau khi triển khai, dán Key vào mục "Cài đặt → Cấu hình nhanh Huobao" để ghi ba cấu hình đề xuất chỉ với một cú nhấp — dùng được ngay

<h3>📥 <a href="https://github.com/chatfire-AI/huobao-drama/releases/latest">Tải ứng dụng Desktop (macOS / Windows)</a></h3>
<h3>🌐 <a href="https://www.chatfire.site">Website chính thức</a></h3>

</div>

---

## 📖 Tổng quan

Huobao Drama là nền tảng sản xuất phim ngắn bằng AI, tự động hóa toàn bộ quy trình: viết kịch bản, thiết kế nhân vật, chia phân cảnh và ghép video.

### 🎯 Giá trị cốt lõi

- **🤖 Vận hành bằng AI**: LLM phân tích kịch bản và trích xuất nhân vật, bối cảnh, thông tin phân cảnh
- **🎨 Sáng tạo thông minh**: AI tạo hình cho thiết kế nhân vật và bối cảnh
- **📹 Tạo video**: Mô hình text-to-video và image-to-video tự động sản xuất các clip phân cảnh
- **🔄 Quy trình khép kín**: Đường ống hoàn chỉnh từ ý tưởng đến tập phim hoàn thiện

### 🛠️ Kiến trúc

```
frontend/   — Nuxt 3 + Vue 3 + TypeScript (CSS thuần, không dùng UI framework)
backend/    — Hono + Drizzle ORM + Mastra AI Agents + better-sqlite3
backend/workspace/skills/ — Định nghĩa skill cho Agent (SKILL.md, sửa được trực tiếp trên UI)
desktop/    — Ứng dụng Electron (main process + esbuild + electron-builder dmg/exe)
data/       — Tài nguyên sinh ra và cơ sở dữ liệu SQLite
```

---

## ✨ Tính năng

### 🎭 Quản lý nhân vật

- ✅ AI tạo thiết kế nhân vật
- ✅ Tạo nhân vật hàng loạt
- ✅ Tải lên và quản lý hình ảnh nhân vật

### 🎬 Tác vụ video

- ✅ Tự động sinh tác vụ video bằng AI
- ✅ Sinh mô tả bối cảnh và prompt video
- ✅ Tạo video hàng loạt theo từng tác vụ

### 🎥 Tạo video

- ✅ Tạo video từ văn bản (text-to-video)
- ✅ Ghép từng cảnh bằng FFmpeg và xử lý phụ đề
- ✅ Nối và xuất trọn tập phim

### 📦 Quản lý tài nguyên

- ✅ Thư viện tài nguyên thống nhất
- ✅ Hỗ trợ lưu trữ cục bộ
- ✅ Theo dõi tiến độ tác vụ

### 🤖 AI Agents

Bốn agent Mastra tích hợp sẵn, cấu hình lưu trong cơ sở dữ liệu và mở rộng được bằng Skill:

| Agent | Vai trò |
|---|---|
| `script_rewriter` | Chuyển tiểu thuyết → kịch bản đúng định dạng |
| `extractor` | Trích xuất và khử trùng lặp nhân vật / bối cảnh / đạo cụ |
| `storyboard_breaker` | Chia kịch bản → chuỗi phân cảnh |
| `prompt_generator` | Prompt hình ảnh cho nhân vật/bối cảnh/đạo cụ + prompt video phân cảnh |

### 🌐 Giao diện đa ngôn ngữ

Giao diện có sẵn **中文 / English / 日本語 / 한국어**, kèm cài đặt toàn cục cho ngôn ngữ nội dung do AI sinh ra.

### 🔌 Hỗ trợ đa nhà cung cấp

| Loại | Nhà cung cấp |
|---|---|
| **Văn bản** | OpenAI (API tương thích), Gemini |
| **Hình ảnh** | OpenAI, Gemini, Volcano Engine |
| **Video** | Volcano Engine Seedance 2.0 (Standard / Fast / Mini), MiniMax H3, Alibaba Bailian Wan 3.0 (Prime / Standard) |

---

## 🚀 Bắt đầu nhanh

### 📋 Yêu cầu hệ thống

| Phần mềm | Phiên bản | Ghi chú |
|---|---|---|
| **Node.js** | 20+ | Môi trường chạy cho frontend và backend |
| **npm** | 9+ | Trình quản lý gói |

> **Cơ sở dữ liệu không cần cài đặt**: SQLite đi kèm (một tệp duy nhất trong thư mục data của dự án) — không cần server database.
>
> **Không cần cài FFmpeg**: Binary đi kèm qua gói npm `ffmpeg-static` / `ffprobe-static` — chạy được ngay.

### ⚙️ Biến môi trường

Không có tệp cấu hình — mọi thứ đặt qua biến môi trường (tất cả đều có giá trị mặc định; chạy dev cục bộ không cần cấu hình gì):

| Biến | Mặc định | Mô tả |
|---|---|---|
| `SQLITE_PATH` | `<repo>/data/huobao.sqlite3` | Vị trí tệp cơ sở dữ liệu SQLite |
| `PORT` | `5679` | Cổng dịch vụ backend |
| `STORAGE_PATH` | `<repo>/data/static` | Thư mục lưu tệp sinh ra |
| `HUOBAO_DATA_DIR` | — | Do main process Electron tiêm vào (gốc dữ liệu userData) |
| `WORKSPACE_PATH` | `backend/workspace` | Thư mục skill/prompt của Agent (desktop: bản sao ghi được trong userData) |
| `FRONTEND_DIST` | `frontend/dist` | Thư mục build tĩnh của frontend |
| `FFMPEG_BIN` / `FFPROBE_BIN` | binary npm đi kèm | Đường dẫn tùy chỉnh tới ffmpeg/ffprobe |
| `PUBLIC_BASE_URL` | — | Địa chỉ công khai để Seedance tham chiếu tài nguyên cục bộ (bản triển khai server) |

> **Lưu ý**: API key, base URL và tham số model của dịch vụ AI đều được cấu hình trên trang "Cài đặt" trong web UI và lưu trong cơ sở dữ liệu — không bao giờ nằm trong tệp cấu hình hay biến môi trường.

### 📥 Cài đặt

```bash
# Clone kho mã
git clone https://github.com/chatfire-AI/huobao-drama.git
cd huobao-drama

# Cài dependency backend
cd backend && npm install

# Cài dependency frontend
cd ../frontend && npm install
```

### 🎯 Chạy dự án

#### Cách 1: Chế độ phát triển (khuyến nghị)

Frontend và backend chạy riêng, có hot reload:

```bash
# Terminal 1: backend
cd backend
npm run dev

# Terminal 2: frontend
cd frontend
npm run dev
```

- Frontend: `http://localhost:3013`
- Backend API: `http://localhost:5679/api/v1`
- Frontend tự động proxy `/api` và `/static` về backend

#### Cách 2: Chế độ một dịch vụ

Backend phục vụ cả API lẫn tệp tĩnh của frontend:

```bash
# 1. Build frontend
cd frontend && npm run generate

# 2. Sao chép kết quả build tới nơi backend mong đợi
#    (generate xuất ra .output/public; backend đọc frontend/dist)
cp -r .output/public dist

# 3. Khởi động backend
cd ../backend && npm start
```

Truy cập: `http://localhost:5679`

### 🗄️ Cơ sở dữ liệu

SQLite đi kèm (`better-sqlite3` + chế độ WAL). Bảng được tạo tự động trong lần chạy đầu (phát lại DDL idempotent + dữ liệu seed). Tệp mặc định: `data/huobao.sqlite3`, ghi đè bằng `SQLITE_PATH`. Ứng dụng desktop lưu dữ liệu trong thư mục user-data (`~/Library/Application Support/HuobaoDrama/data/`).

Di chuyển dữ liệu từ bản MySQL cũ:

**Tự động migrate khi khởi động (khuyến nghị)**: Khi MySQL được cấu hình rõ ràng (`DATABASE_URL` hoặc `MYSQL_HOST`) và cơ sở dữ liệu SQLite đang trống, backend sẽ tự phát hiện và nhập toàn bộ bảng một lần (kiểm tra số dòng từng bảng, ghi nguyên tử trong một transaction, tự rollback và thử lại ở lần chạy sau, kèm dấu `.mysql-imported` để không nhập lại). Đặt `MYSQL_AUTO_IMPORT=false` để tắt.

```bash
# Hoặc chạy thủ công (đích đã có dữ liệu cần --force; tự sao lưu trước khi ghi)
cd backend && npx tsx scripts/import-mysql-to-sqlite.ts
```

> Migration chỉ bao gồm dữ liệu trong database; các tệp media (hình ảnh/video) trong `data/static/` của bản cũ phải sao chép thủ công, nếu không tài nguyên cũ sẽ không hiển thị được.

### 🔑 Lần đầu sử dụng: Cấu hình dịch vụ AI

Mọi tính năng AI (văn bản/hình ảnh/video) đều cần cấu hình dịch vụ model trước — một banner ở đầu trang sẽ hướng dẫn cho tới khi hoàn tất:

1. Mở trang "Cài đặt"
2. Dán API key Huobao vào mục "Cấu hình nhanh Huobao" ([lấy tại api.firemux.com](https://api.firemux.com)) để ghi ba cấu hình đề xuất (văn bản, hình ảnh, video) chỉ với một cú nhấp
3. Hoặc thêm từng nhà cung cấp qua "Mẫu thủ công", kèm kiểm tra kết nối

Sau khi cấu hình xong, banner sẽ biến mất và bạn có thể bắt đầu sản xuất tập phim.

---

## 📖 Hướng dẫn trực quan

Toàn bộ quy trình từ tiểu thuyết đến tập phim hoàn chỉnh. Thanh tiến trình bên trái luôn cho biết bạn đang ở bước nào.

### Bước 1 · Tạo dự án

Ở trang chủ nhấn "Dự án mới", chọn **tỷ lệ khung hình** (16:9 ngang / 9:16 dọc, cố định sau khi tạo) và **phong cách hình ảnh** (3D, tả thực, … — được chèn vào mọi prompt hình ảnh).

<p align="center">
  <img src="docs/screenshots/02-create-drama.png" alt="Tạo dự án" width="800">
</p>

<p align="center">
  <img src="docs/screenshots/01-projects.png" alt="Danh sách dự án" width="800">
</p>

### Bước 2 · Cấu hình dịch vụ AI (lần chạy đầu)

Dán API key vào Cài đặt → "Cấu hình nhanh Huobao" để ghi cả ba cấu hình đề xuất cùng lúc, hoặc thêm nhà cung cấp thủ công. Có thể đổi model hiện tại bất cứ lúc nào từ thanh trên cùng (xem Bước 5).

<p align="center">
  <img src="docs/screenshots/03-settings-quick.png" alt="Cấu hình dịch vụ AI" width="800">
</p>

### Bước 3 · Giai đoạn kịch bản

Dán **tiểu thuyết gốc** vào bàn làm việc, rồi nhấn "AI viết lại" để tạo kịch bản quay — chia theo tập với ghi chú bối cảnh và nhân vật. Bạn có thể đổi model văn bản và giọng điệu trong lúc viết lại.

<p align="center">
  <img src="docs/screenshots/05-script.png" alt="Giai đoạn kịch bản" width="800">
</p>

### Bước 4 · Tài nguyên

Chạy **trích xuất** trên kịch bản để có danh sách nhân vật / bối cảnh / đạo cụ, rồi tạo ảnh tham chiếu nhất quán cho từng mục (hoặc theo lô). Những hình này được chèn làm tư liệu tham chiếu khi tạo video.

<p align="center">
  <img src="docs/screenshots/06-assets.png" alt="Sản xuất tài nguyên" width="800">
</p>

### Bước 5 · Phân cảnh & Video

Trên trang "Sản xuất video", trước tiên chạy **chia phân cảnh** (AI tách cảnh quay và viết prompt video). Sau đó:

- Chọn **model video** ở thanh trên cùng (Seedance / Wan 3.0 / MiniMax…); mức phân giải và thời lượng phụ thuộc model
- Xem lại và chỉnh prompt của từng cảnh quay ở khung bên phải (tham chiếu `@nhân vật` tự động ánh xạ tới ảnh tham chiếu)
- Nhấn "Tạo video hàng loạt"; tác vụ lỗi có thể thử lại bằng một cú nhấp

<p align="center">
  <img src="docs/screenshots/07-storyboard.png" alt="Chia phân cảnh" width="800">
</p>

<p align="center">
  <img src="docs/screenshots/08-videos.png" alt="Tạo video" width="800">
</p>

### Bước 6 · Nối & Xuất

Chọn các cảnh quay (rê chuột để xem trước từng clip), nhấn "Bắt đầu nối" và FFmpeg sẽ ghép thành trọn tập — xem trực tuyến hoặc tải về. Nhấn "Đánh dấu hoàn thành" khi xong để thắp sáng thanh tiến trình.

<p align="center">
  <img src="docs/screenshots/09-export.png" alt="Nối & xuất" width="800">
</p>

Danh sách tập phim hiển thị trạng thái sản xuất của từng tập — nhấn "Vào xưởng" để tiếp tục:

<p align="center">
  <img src="docs/screenshots/04-episodes.png" alt="Danh sách tập" width="800">
</p>

---

## 📦 Triển khai

### 🖥️ Ứng dụng Desktop (khuyến nghị)

**⬇️ Bản cài đặt dựng sẵn: [GitHub Releases](https://github.com/chatfire-AI/huobao-drama/releases/latest) · [Bản gương cho Trung Quốc (Tencent COS)](https://installer.chatfire.site/huobao-drama/v4.0.0/)**

| Nền tảng | Tệp cần tải |
|---|---|
| macOS (Apple Silicon, dòng M) | `HuobaoDrama-4.0.0-arm64.dmg` |
| macOS (Intel) | `HuobaoDrama-4.0.0.dmg` |
| Windows | `HuobaoDrama.Setup.4.0.0.exe` |

> Người dùng Trung Quốc: dùng bản gương COS ở trên (GitHub chậm/không truy cập được ở Trung Quốc đại lục). Trình cập nhật trong ứng dụng cũng kiểm tra bản gương COS trước, rồi mới dự phòng sang GitHub.

Không cần build — tải dmg/exe và cài đặt. Bản đã cài tự động cập nhật qua trình cập nhật tích hợp. (Nếu muốn tự đóng gói từ mã nguồn, xem các lệnh bên dưới.)

Nhấp đúp để cài, chạy được ngay (macOS + Windows): cơ sở dữ liệu SQLite, media sinh ra và skill của Agent đều nằm trong thư mục user-data — gỡ ứng dụng không ảnh hưởng tới dữ liệu của bạn.

```bash
# Đóng gói bằng một lệnh (frontend generate → backend esbuild → electron-builder)
npm run dist        # macOS dmg (arm64 + Intel)
npm run dist:win    # Bộ cài Windows NSIS (win-x64, cross-build được trên macOS)

# Sản phẩm đầu ra
# desktop/release/HuobaoDrama-<version>-arm64.dmg     (Apple Silicon)
# desktop/release/HuobaoDrama-<version>.dmg           (Intel)
# desktop/release/HuobaoDrama Setup <version>.exe     (Windows)
```

Lưu ý khi cài đặt:

- Bản macOS chưa ký số — lần chạy đầu hãy nhấp chuột phải → Open, hoặc chạy `xattr -cr /Applications/HuobaoDrama.app`
- Bản Windows chưa ký số — SmartScreen sẽ hỏi "More info → Run anyway"
- Thư mục user-data: `~/Library/Application Support/HuobaoDrama/` (database, media sinh ra, bản sao ghi được của skill sửa trực tuyến)
- Binary FFmpeg/FFprobe đi kèm — không cần cài trong hệ thống
- Electron được ghim ở 37.x: prebuild win32 của better-sqlite3 chỉ hỗ trợ tới ABI đó (chìa khóa cho việc cross-package không cần biên dịch)
- Liên kết ngoài mở bằng trình duyệt hệ thống (ví dụ "Lấy key tại api.firemux.com")

#### 🔄 Cập nhật trong ứng dụng (không cần ký Apple)

Ứng dụng desktop có trình cập nhật tích hợp (cùng nhóm giải pháp như Tauri: thay thế thư mục trên macOS / cài đặt im lặng trên Windows, kèm xác minh sha256 cục bộ). Để phát hành bản mới:

```bash
# 1. Tăng version trong desktop/package.json, rồi đóng gói
npm run dist        # macOS (tạo dmg + zip cập nhật)
npm run dist:win    # Windows (tạo Setup.exe)

# 2. Sinh manifest phát hành release/latest.json (kèm sha256 cho từng nền tảng)
cd desktop && npm run feed

# 3. Phát hành: tải latest.json + bộ cài + zip lên GitHub Release (tag dạng v1.0.1)
```

Ứng dụng đã cài sẽ tự kiểm tra manifest sau khi khởi động (có thể kiểm tra thủ công trong "Cài đặt → Giới thiệu & Cập nhật") và nhắc tải về, cài đặt khi có bản mới. Ghi đè URL manifest bằng biến môi trường `HUOBAO_UPDATE_FEED`.

Phát triển desktop:

```bash
npm run build:frontend   # đầu ra tĩnh của frontend (frontend/.output/public)
cd desktop && npm run dev  # đóng gói backend và chạy trong cửa sổ Electron
```

> Hạn chế đã biết: model video Seedance cần địa chỉ công khai `PUBLIC_BASE_URL` để tham chiếu tài nguyên cục bộ; ứng dụng desktop không có cổng công khai nên tình huống đó sẽ báo lỗi rõ ràng. Text-to-video, tạo hình ảnh và mọi năng lực khác không bị ảnh hưởng.

---

### 🏭 Triển khai trên server

```bash
# 1. Build frontend
cd frontend && npm run generate

# 2. Sao chép kết quả build (generate xuất ra frontend/.output/public; backend đọc
#    frontend/dist — bỏ qua bước này thì API vẫn chạy nhưng trang sẽ 404)
cp -r .output/public dist && cd ..

# 3. Khởi động backend
cd backend && npm start
```

Các tệp cần tải lên server:

```
backend/                    # mã nguồn backend + node_modules
backend/workspace/skills/   # tệp skill của Agent
frontend/dist/              # kết quả build frontend
data/                       # thư mục dữ liệu (tự tạo trong lần chạy đầu)
```

#### Nginx reverse proxy

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Tối đa 50MB cho việc tải lên video/âm thanh tham chiếu
    client_max_body_size 100m;

    # Hình ảnh/video sinh ra được phục vụ thẳng từ đĩa, bỏ qua Node:
    # sendfile zero-copy + cache dài hạn
    # (tệp đặt tên theo uuid và bất biến, nên cache immutable là an toàn)
    location /static/ {
        alias /path/to/huobao-drama/data/static/;
        sendfile on;
        tcp_nopush on;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location / {
        proxy_pass http://localhost:5679;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

> Tối ưu tải media: backend tự sinh ảnh thu nhỏ 400px (`*_thumb.webp`) cho các trang danh sách và trích khung hình poster (`*_poster.jpg`) làm ảnh bìa video — frontend chỉ tải tệp gốc khi mở ảnh đầy đủ hoặc phát video. Để bù dữ liệu cho các tệp cũ, chạy `npm run backfill-artwork` trong `backend/`.

### 🐳 Triển khai Docker (kèm cập nhật trong ứng dụng)

**Cách A — image dựng sẵn (không cần clone, không cần build):** đa kiến trúc (`linux/amd64` + `linux/arm64`), server x86 và thiết bị ARM tự khớp

```bash
docker pull huobao/huobao-drama:4.0.0

docker run -d \
  --name huobao-drama \
  -p 5679:5679 \
  -v huobao-data:/app/data \
  --restart unless-stopped \
  huobao/huobao-drama:4.0.0
```

**Cách B — docker compose (build từ mã nguồn + cập nhật trong ứng dụng bằng Watchtower):** thư mục gốc của kho cung cấp sẵn `Dockerfile` tất-cả-trong-một (ba tầng: frontend generate + dependency backend + runtime; backend chạy qua tsx giống như triển khai server) và `docker-compose.yml` (app + Watchtower):

```bash
# 1. Cấu hình môi trường (token Watchtower — phải khớp giữa phía app và watchtower)
cp .env.example .env   # sửa WATCHTOWER_TOKEN

# 2. Build và khởi động (tiêm version lúc phát hành để "Giới thiệu & Cập nhật" so sánh)
HUOBAO_VERSION=4.0.0 docker compose up -d --build

# 3. Truy cập http://localhost:5679
```

- **Bền vững dữ liệu**: volume đặt tên `huobao-data` gắn vào `/app/data` (SQLite + hình ảnh/video sinh ra + workspace/skills) — cập nhật image không mất dữ liệu
- **Cập nhật trong ứng dụng**: tệp compose có sẵn sidecar [Watchtower](https://containrrr.dev/watchtower/) (`--label-enable` chỉ cập nhật container có nhãn, `--cleanup` xóa image cũ, tự kiểm tra hằng ngày). "Cài đặt → Giới thiệu & Cập nhật" có thể kiểm tra bản mới và "Cập nhật ngay" — backend kích hoạt qua HTTP API của Watchtower, dịch vụ sẽ kéo image mới và dựng lại container; làm mới trang sau vài phút
- **Chế độ thủ công**: xóa hai biến `HUOBAO_WATCHTOWER_*` của app (hoặc toàn bộ service watchtower) khỏi `docker-compose.yml` — "Giới thiệu & Cập nhật" sẽ chuyển thành thông báo có bản mới + lệnh thủ công `docker compose pull && docker compose up -d`
- **Phát hành image**: `docker buildx build --platform linux/amd64,linux/arm64 --build-arg HUOBAO_VERSION=x.y.z -t huobao/huobao-drama:x.y.z -t huobao/huobao-drama:latest --push .` — manifest version dùng chung với ứng dụng desktop qua `latest.json` trên GitHub Releases (ghi đè bằng `HUOBAO_UPDATE_FEED`)

---

## 🎨 Công nghệ sử dụng

### Backend

- **Runtime**: Node.js 20+
- **Web framework**: Hono
- **ORM**: Drizzle ORM + better-sqlite3 (chế độ WAL)
- **AI Agents**: Mastra + AI SDK (tương thích OpenAI)
- **Xử lý video**: FFmpeg (fluent-ffmpeg + binary đi kèm)
- **Xử lý hình ảnh**: Sharp

### Desktop

- **Vỏ**: Electron (utilityProcess chạy backend; BrowserWindow tải cùng origin)
- **Đóng gói**: esbuild (bundle backend một tệp) + electron-builder (dmg arm64/x64, NSIS win-x64)

### Frontend

- **Framework**: Nuxt 3 (chế độ SPA)
- **Ngôn ngữ**: Vue 3 + TypeScript
- **Routing**: Routing theo tệp (Vue Router 4)
- **Styling**: CSS thuần + CSS Variables
- **Icon**: Lucide Vue
- **i18n**: vue-i18n (中文 / English / 日本語 / 한국어)

---

## 📝 Câu hỏi thường gặp

### H: Ứng dụng desktop lưu dữ liệu ở đâu?

Đ: `~/Library/Application Support/HuobaoDrama/data/` (cơ sở dữ liệu SQLite + hình ảnh/video sinh ra); bản sao ghi được của skill sửa trực tuyến nằm trong thư mục `workspace/` cùng cấp. Ở chế độ phát triển thì dùng thư mục `data/` của kho mã.

### H: Làm sao migrate dữ liệu MySQL cũ sang SQLite?

Đ: Giữ MySQL truy cập được (biến môi trường hoặc `backend/.env`), rồi chạy `cd backend && npx tsx scripts/import-mysql-to-sqlite.ts`. Script sẽ tự tạo bảng, nhập từng bảng và kiểm tra số dòng (đích đã có dữ liệu cần `--force`; có sao lưu trước khi ghi).

### H: Chưa cài hoặc không tìm thấy FFmpeg?

Đ: Không cần cài. Dự án đi kèm binary `ffmpeg-static` / `ffprobe-static` (được mang theo trong gói desktop). FFmpeg có sẵn trong `PATH` cũng không xung đột, và bạn có thể chỉ định rõ qua `FFMPEG_BIN`/`FFPROBE_BIN`.

### H: Đầu trang báo "Chưa cấu hình model"?

Đ: Đó là hướng dẫn bình thường cho lần triển khai đầu. Vào "Cài đặt" và dùng "Cấu hình nhanh Huobao" để dán API key và ghi cấu hình chỉ với một cú nhấp, hoặc thêm nhà cung cấp qua "Mẫu thủ công". Banner sẽ biến mất khi cả văn bản, hình ảnh và video đều có cấu hình được bật.

### H: Frontend không gọi được API backend?

Đ: Kiểm tra backend đang chạy và cổng có đúng không. Ở chế độ dev, cấu hình proxy nằm trong `frontend/nuxt.config.ts`.

### H: Bảng trong database chưa được tạo?

Đ: Backend tự tạo toàn bộ bảng trong lần chạy đầu — xem log để xác nhận khởi tạo thành công.

---

## 📋 Nhật ký thay đổi

### v4.0.0 (2026-08)

#### 🖥️ Ứng dụng Desktop + Migration cơ sở dữ liệu

- Ứng dụng Electron desktop (macOS dmg, kiến trúc kép arm64/x64)
  - Nhấp đúp để cài, chạy được ngay: tự chọn cổng, khóa một instance, tiến trình backend cô lập khi crash
  - Cô lập user-data: cơ sở dữ liệu SQLite / media sinh ra / bản sao skill đều nằm trong thư mục userData
  - FFmpeg/FFprobe đi kèm; mẫu skill của workspace được sao chép trong lần chạy đầu, khi nâng cấp chỉ bù phần thiếu chứ không ghi đè
- Cơ sở dữ liệu migrate hoàn toàn từ MySQL sang SQLite (better-sqlite3 + WAL)
  - Không thay đổi mã nghiệp vụ (tầng truy vấn Drizzle vốn đã di động); phát lại DDL idempotent
  - Script nhập một lần mới `import-mysql-to-sqlite.ts` (kiểm tra số dòng từng bảng + tự sao lưu)
- Backend được đóng gói thành một tệp bằng esbuild (externals: sharp/better-sqlite3/gói binary ffmpeg)
- Bỏ triển khai Docker/MySQL (có thể khôi phục từ lịch sử git)

### v3.1.0 (2026-09)

- Thêm model video Alibaba Bailian Wan 3.0 (Prime / Standard, payload `input.media`/`parameters` chính thức)
- Bộ chọn phân giải trên thanh trên cùng của bàn làm việc với các mức gốc theo nhà cung cấp (Seedance 480p/720p, MiniMax 768P/2K, Wan 480P/720P/1080P)
- Model video mặc định đổi thành Seedance 2.0 Mini
- Sửa lỗi sinh do lệch nhà cung cấp/model khi chuyển đổi model video
- Video hàng loạt: chế độ chọn + xác nhận trước khi sinh (số cảnh quay / tổng thời lượng / model / phân giải), thử lại tác vụ lỗi bằng một cú nhấp
- Thời lượng phân cảnh giờ sửa được trực tiếp trong vùng tham số tạo video, áp dụng cho cả sinh đơn lẻ và hàng loạt
- Lỗi kiểm duyệt nội dung (người thật / nội dung nhạy cảm) giờ gợi ý đổi model và thử lại

### v3.0.0 (2026-08)

#### 🚀 Cải thiện triển khai & trải nghiệm

- Sẵn sàng triển khai Docker
  - Health check cho MySQL / ứng dụng; ứng dụng chờ database trước khi khởi động
  - Khởi tạo database có thử lại — không cần can thiệp thủ công khi triển khai container lần đầu
  - Bỏ phụ thuộc FFmpeg hệ thống; binary đi kèm ở mọi nơi
  - Bền vững thư mục skill của Agent bằng volume (sửa trực tuyến trong Cài đặt vẫn giữ được)
  - Thêm `docker/init.sql` và script xuất (DBA rà soát / tạo bảng trước)
- Hướng dẫn lần đầu sử dụng
  - Banner toàn site dẫn tới Cài đặt khi chưa cấu hình dịch vụ AI
  - "Cấu hình nhanh Huobao" mới trong Cài đặt: một key ghi ba cấu hình đề xuất (văn bản/hình ảnh/video)
  - Lỗi "chưa cấu hình model" được bản địa hóa kèm chỉ dẫn tới Cài đặt
- Model video mặc định đổi thành Seedance 2.0 Fast
- Gộp nhà cung cấp: chỉ còn OpenAI / Gemini / Volcano Engine
- Bàn làm việc: ngăn kéo danh sách tác vụ, trạng thái từng giai đoạn quy trình, nối chọn lọc (kiểm tra tệp video tồn tại trước khi ghép)
- Thiết kế lại thư viện tài nguyên, cải thiện @mention, làm lại danh sách tập phim

### v2.0.0 (2026-04)

#### 🚀 Cập nhật lớn

- Chuyển hoàn toàn sang stack TypeScript
  - Backend: Hono + Drizzle ORM + mysql2
  - Frontend: Nuxt 3 + Vue 3
  - AI Agents: framework Mastra
- Làm lại UI bàn làm việc tập phim và luồng sản xuất
  - Bố cục console gọn hơn
  - Làm lại vùng sửa phân cảnh
  - Làm lại các màn hình ảnh cảnh quay, video, ghép và xuất
- Hỗ trợ triển khai Docker — gộp frontend và backend vào một image
- Cơ chế nạp Skill lúc chạy
- Mở rộng adapter media đa nhà cung cấp
  - Hình ảnh: OpenAI, Gemini, Volcano Engine, Alibaba
  - Video: Volcano Engine/Seedance, Vidu, Alibaba
- Cải thiện xử lý tệp cục bộ và chuyển mã ảnh tham chiếu theo nhu cầu

### v1.0.4 (2026-01-27)

- Chiến lược lưu trữ cục bộ để tránh liên kết tài nguyên ngoài bị chết
- Truyền ảnh tham chiếu nhúng base64
- Sửa lỗi reset trạng thái khi chuyển cảnh quay
- Chuyển scene sang chapter

### v1.0.3 (2026-01-16)

- Cải thiện hiệu năng đồng thời của database
- Hỗ trợ đa nền tảng Docker cho host.docker.internal

### v1.0.2 (2026-01-14)

- Sửa lỗi phân tích phản hồi API tạo video
- Cấu hình endpoint video OpenAI Sora
- Cải thiện xử lý lỗi và ghi log

---

## 📄 Giấy phép

Dự án này được cấp phép theo **[CC BY-NC-SA 4.0](LICENSE)** (Attribution-NonCommercial-ShareAlike 4.0 International).

- ✅ Hoan nghênh sử dụng cá nhân, học tập và các dự án phi thương mại
- ✅ Được phép sửa đổi và phân phối lại theo cùng giấy phép, kèm ghi công
- ❌ **Cấm sử dụng thương mại** — bạn không được dùng dự án này, toàn bộ hay một phần, cho bất kỳ mục đích thương mại nào (bao gồm dịch vụ trả phí, triển khai thương mại hoặc bán lại) nếu không có sự cho phép bằng văn bản trước của tác giả

Toàn văn giấy phép: xem [LICENSE](LICENSE).

---

## 🤝 Đóng góp

Hoan nghênh Issue và Pull Request!

1. Fork dự án
2. Tạo nhánh tính năng (`git checkout -b feature/AmazingFeature`)
3. Commit thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push lên nhánh (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

Các kiểm tra thường dùng:

```bash
cd backend && npm run typecheck
cd ../frontend && npm run build
```

---

## ☕ Ủng hộ tác giả

Nếu dự án này giúp ích cho bạn, hãy mời tác giả một ly cà phê ☕ — sự ủng hộ của bạn giúp các bản cập nhật tiếp tục ra đời!

<div align="center">
  <img src="donate.png" alt="Mã QR ủng hộ Alipay" width="240" />
</div>

---

## 💬 Nhóm WeChat

Quét mã QR để tham gia nhóm WeChat:

<div align="center">
  <img src="docs/images/wx-group.jpg" width="200" alt="Mã QR nhóm WeChat" />
</div>

---

> _"Để AI cùng chúng ta sáng tạo"_

## 🔗 Liên kết

Dự án này đã được cộng đồng [LINUX DO](https://linux.do/) ghi nhận và gắn liên kết.

- [LINUX DO](https://linux.do/) — tinh thần mã nguồn mở chân chính, một cộng đồng được xây dựng trên sự chia sẻ

---
