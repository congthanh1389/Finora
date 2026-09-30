# Finora — Kế hoạch chuẩn bị trước coding

## 1. Mục tiêu

Chuẩn bị đầy đủ quyết định, ranh giới module, quy tắc dữ liệu, quy trình GitHub và backlog trước khi bắt đầu coding, bám sát **Finora Core Specification v1**.

## 2. Các quyết định đã chốt theo đặc tả

- Sản phẩm: **Finora** — ứng dụng quản lý tài chính cá nhân và gia đình.
- Nền tảng: Android và iOS.
- Công nghệ định hướng: Expo / React Native / TypeScript.
- Kiến trúc: MVVM + Modular Architecture + Repository Pattern + Service Layer.
- Routing: Expo Router; thư mục `app/` chỉ giữ route và phần kết nối mỏng tới View.
- MVP: Wallet, Category, Transaction, Budget, Report.
- Project độc lập với `D:\QCT` và có Git repository riêng.
- Không đưa `.env`, secret, API key, signing key hoặc thông tin nhạy cảm vào Git.
- Main/master phải luôn ở trạng thái có thể build/test.

## 3. Trình tự chuẩn bị

### Bước A — Foundation và repository

- Tạo project Finora độc lập.
- Tạo Git repository riêng.
- Thiết lập TypeScript, Expo Router, linting, theme và cấu trúc thư mục.
- Tạo `README.md`, quy ước branch và quy tắc bảo vệ `main`.
- Xác nhận cách chạy lint, typecheck, test và build.

### Bước B — Chốt data contract

- Xác định entity nền tảng: users, wallets, categories, transactions, budgets.
- Xác định ID, thời gian, loại giao dịch, tiền tệ và trạng thái bản ghi.
- Xác định owner của từng entity.
- Xác định repository interface trước implementation database.
- Xác định migration và database adapter theo hướng có thể thay đổi.

### Bước C — Chốt financial invariants

- Quy tắc cộng/trừ số dư.
- Quy tắc giao dịch chuyển tiền.
- Quy tắc sửa và xóa giao dịch.
- Quy tắc ngân sách kế hoạch/thực tế.
- Quy tắc báo cáo chỉ đọc dữ liệu nguồn và không trở thành nơi sở hữu dữ liệu gốc.
- Quy tắc atomicity khi giao dịch ảnh hưởng cả transaction và wallet balance.

### Bước D — Chốt module contracts

Mỗi module phải có ranh giới rõ ràng và giao tiếp qua service/public interface. Không module nào truy cập trực tiếp database của module khác.

### Bước E — Chốt workflow GitHub

- Branch feature theo dạng `feature/<ten-chuc-nang>`.
- Branch fix theo dạng `fix/<ten-loi>`.
- Pull Request cho thay đổi chức năng lớn.
- Kiểm tra lint, typecheck, test và build trước khi merge.
- Cập nhật tài liệu kiến trúc khi có thay đổi lớn.

### Bước F — Bắt đầu coding theo phase

1. Project Foundation
2. Database + Repository
3. Wallet
4. Category
5. Transaction
6. Dashboard
7. Budget
8. Report
9. Recurring / Debt / Saving
10. Backup / Cloud / Account
11. Testing
12. Release

## 4. Tiêu chí sẵn sàng bắt đầu coding

- [ ] Project và Git repository Finora độc lập.
- [ ] Cấu trúc thư mục nền tảng đã được xác nhận.
- [ ] Hướng phụ thuộc `View → ViewModel → Service → Repository → Database` được giữ rõ ràng.
- [ ] Owner của entity và public interface cơ bản đã được xác định.
- [ ] Quy tắc số dư, giao dịch và chuyển tiền đã được ghi thành test case.
- [ ] Có quy trình branch/PR và kiểm tra tự động tối thiểu.
- [ ] Không có secret trong source hoặc Git.
- [ ] Main/master có thể build/test.
- [ ] Các quyết định kiến trúc lớn được ghi nhận trong tài liệu.
