# Finora — Quy tắc dữ liệu, GitHub và backlog MVP

## 1. Quy tắc dữ liệu tài chính cần chốt trước implementation

Đây là các câu hỏi nghiệp vụ phải được chuyển thành decision/test case trước khi viết UI:

1. Số dư ví được lưu trực tiếp, tính từ giao dịch, hay kết hợp cả hai?
2. Chi tiêu làm giảm số dư; thu nhập làm tăng số dư theo ví liên quan như thế nào?
3. Sửa giao dịch sẽ hoàn nguyên ảnh hưởng cũ rồi áp dụng ảnh hưởng mới ra sao?
4. Xóa giao dịch sẽ cập nhật số dư thế nào?
5. Chuyển tiền giữa hai ví được biểu diễn như một nghiệp vụ có hai phía thế nào?
6. Nếu lưu giao dịch thành công nhưng cập nhật số dư thất bại, hệ thống rollback hoặc khôi phục ra sao?
7. Ngân sách theo tháng/danh mục lấy dữ liệu thực tế theo khoảng thời gian nào?
8. Báo cáo dùng cùng quy tắc lọc ngày, ví, danh mục và loại giao dịch nào?
9. Cách xử lý tiền tệ và độ chính xác số học là gì?
10. Có cho phép số dư âm hay không, và rule này thuộc WalletService hay TransactionService?

Các quyết định cuối cùng phải được ghi nhận trước Phase 2 và có test trước khi phát hành.

## 2. Test cases nền tảng

### Wallet / balance

- Số dư đầu kỳ `1.000.000đ` trừ chi `300.000đ` bằng `700.000đ`.
- Thu nhập làm tăng đúng ví.
- Chi tiêu làm giảm đúng ví.
- Sửa giao dịch cập nhật đúng phần chênh lệch.
- Xóa giao dịch hoàn nguyên đúng ảnh hưởng.

### Transaction

- Tạo giao dịch hợp lệ.
- Từ chối dữ liệu form không hợp lệ.
- Lọc/tìm kiếm theo ngày, ví, danh mục và loại giao dịch.
- Chuyển tiền không làm tăng/giảm tổng tài sản sai.

### Budget

- So sánh số kế hoạch và số thực tế.
- Tính phần còn lại hoặc phần vượt ngân sách theo rule đã chốt.

### Report

- Tổng hợp thu/chi đúng theo khoảng thời gian.
- Phân bổ theo danh mục không làm mất hoặc nhân đôi giao dịch.

## 3. Quy trình GitHub

### Branch

```text
main
feature/foundation
feature/database-repository
feature/wallet
feature/category
feature/transaction
feature/budget
feature/report
fix/<ten-loi>
```

### Pull Request

Mỗi PR nên nêu:

- Mục tiêu thay đổi.
- Module bị ảnh hưởng.
- Thay đổi schema/migration nếu có.
- Thay đổi public interface nếu có.
- Test đã thêm/chạy.
- Kết quả lint, typecheck, test và build.
- Ảnh chụp UI nếu có thay đổi giao diện.

### CI tối thiểu

```text
install dependencies
lint
typecheck
unit test
integration test khi có
build/check Expo
```

`main` chỉ nhận thay đổi khi các kiểm tra phù hợp đạt và code review hoàn tất.

## 4. Backlog MVP theo phase

### Phase 1 — Project Foundation

- [ ] Tạo project Expo / React Native / TypeScript.
- [ ] Thiết lập Expo Router.
- [ ] Tạo `core`, `shared`, `modules`, `assets`, `tests`.
- [ ] Thiết lập theme, linting và typecheck.
- [ ] Tạo README và Git workflow.

### Phase 2 — Database + Repository

- [ ] Chốt schema nền tảng.
- [ ] Tạo database adapter.
- [ ] Tạo migration.
- [ ] Tạo repository interface và implementation.
- [ ] Viết test repository/integration cơ bản.

### Phase 3 — Wallet

- [ ] Tạo wallet model/types.
- [ ] Tạo wallet repository/service/viewmodel/view.
- [ ] Quản lý số dư.
- [ ] Viết test số dư.

### Phase 4 — Category

- [ ] Tạo danh mục thu/chi.
- [ ] Hỗ trợ tùy chỉnh theo phạm vi MVP.
- [ ] Viết validation và test.

### Phase 5 — Transaction

- [ ] Thu nhập.
- [ ] Chi tiêu.
- [ ] Chuyển tiền.
- [ ] Lịch sử, tìm kiếm/lọc.
- [ ] Cập nhật số dư qua WalletService/public interface.
- [ ] Test create/edit/delete và các case lỗi.

### Phase 6 — Dashboard

- [ ] Tổng quan tài chính dựa trên dữ liệu các module nền tảng.

### Phase 7 — Budget

- [ ] Ngân sách theo tháng/danh mục.
- [ ] So sánh kế hoạch và thực tế.
- [ ] Test tính toán.

### Phase 8 — Report

- [ ] Thu/chi.
- [ ] Dòng tiền.
- [ ] Phân bổ theo danh mục.
- [ ] Biểu đồ.
- [ ] Test tổng hợp.
