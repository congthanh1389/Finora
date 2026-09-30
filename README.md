# Finora

Ứng dụng quản lý tài chính cá nhân và gia đình cho Android và iOS, phát triển với Expo / React Native / TypeScript.

## Foundation status

Đây là phase **Project Foundation** theo `Finora Core Specification v1`. Foundation thiết lập starter, routing, theme, backend/database nền tảng, cấu trúc module, design brief và quy trình kiểm tra. Nghiệp vụ Wallet, Category, Transaction, Budget và Report sẽ được triển khai theo các phase riêng.

## Kiến trúc

```text
View → ViewModel → Service → Repository Interface → Repository Implementation → Database / External Data Source
```

- `app/`: Expo Router routes và kết nối mỏng tới View.
- `src/core/`: database, storage, config, constants, errors, utils và types dùng chung ở mức hạ tầng.
- `src/shared/`: components, hooks, theme và types dùng chung.
- `src/modules/`: module nghiệp vụ; chỉ tạo module khi bắt đầu triển khai nghiệp vụ đó.
- `server/`, `drizzle/`: backend và schema của starter; giữ nguyên vị trí, mở rộng có kiểm soát.
- `tests/`: unit, integration và fixtures.

## Chạy project

```bash
pnpm db:push
pnpm dev
```

- Metro/Web: `8081`
- API: `3000`

## Kiểm tra

```bash
pnpm check
pnpm lint
pnpm test
pnpm build
```

## Git workflow

- `main` luôn phải build/test được.
- Feature branch: `feature/<ten-chuc-nang>`.
- Fix branch: `fix/<ten-loi>`.
- Thay đổi lớn đi qua Pull Request và phải mô tả module, schema/interface và kiểm tra liên quan.
- Không commit `.env`, secret, API key, signing key hoặc file nhạy cảm.
- Finora dùng repository độc lập; không dùng branch hoặc sao chép máy móc từ `D:\QCT`.

Xem thêm `CONTRIBUTING.md`, `ideas.md` và thư mục `docs/`.
