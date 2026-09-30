# Finora — Kiến trúc và hợp đồng module

## 1. Luồng phụ thuộc bắt buộc

```text
View
  ↓
ViewModel
  ↓
Service
  ↓
Repository Interface
  ↓
Repository Implementation
  ↓
Database / External Data Source
```

### Không được phép

- View → Database
- View → Repository
- ViewModel → SQL trực tiếp
- Database → View
- Module → database của module khác
- Tạo dependency vòng giữa các module

## 2. Trách nhiệm từng tầng

| Tầng | Được làm | Không được làm |
|---|---|---|
| Model | Entity/domain data và quy tắc biểu diễn dữ liệu | UI |
| View | Hiển thị, input, interaction | Business logic, truy cập database |
| ViewModel | UI state, validation flow, commands, loading/error state | SQL, chi tiết database |
| Service | Business rules, use cases, phối hợp nghiệp vụ | Phụ thuộc trực tiếp vào UI |
| Repository | Đọc/ghi dữ liệu qua abstraction | Logic giao diện |

## 3. Owner dữ liệu đề xuất theo đặc tả

| Entity | Module sở hữu |
|---|---|
| wallets | Wallet |
| categories | Category |
| transactions | Transaction |
| budgets | Budget |
| users | Account khi module Account được triển khai |
| Dữ liệu tổng hợp | Report sử dụng dữ liệu nguồn, không sở hữu bản ghi gốc |

## 4. Hợp đồng module MVP

### Wallet

- Quản lý ví tiền, tài khoản ngân hàng, ví điện tử và số dư.
- Cung cấp service/public interface cho các nghiệp vụ cần đọc hoặc cập nhật số dư.
- Không để Transaction truy cập trực tiếp Wallet database.

### Category

- Quản lý danh mục thu/chi.
- Cho phép danh mục có khả năng tùy chỉnh.
- Transaction sử dụng public contract của Category khi cần kiểm tra danh mục.

### Transaction

- Quản lý thu nhập, chi tiêu, chuyển tiền, ngày, ví, danh mục và ghi chú.
- TransactionService là nơi thực thi business rules của giao dịch.
- Khi cần cập nhật số dư, phối hợp với WalletService hoặc public Wallet interface.

### Budget

- Quản lý ngân sách theo tháng/danh mục.
- So sánh kế hoạch và thực tế.
- Không tự trở thành nguồn dữ liệu giao dịch gốc.

### Report

- Tổng hợp dữ liệu giao dịch để tạo báo cáo và biểu đồ.
- Chỉ đọc dữ liệu qua contract phù hợp.
- Không truy cập trực tiếp database của Transaction, Wallet, Category hoặc Budget.

## 5. Template module

```text
src/modules/<module>/
├── model/
├── types/
├── view/
├── viewmodel/
├── service/
├── repository/
├── validation/
├── __tests__/
└── index.ts
```

Chỉ tạo module khi bắt đầu triển khai nghiệp vụ đó; không tạo trước toàn bộ module mở rộng.

## 6. Quy tắc đặt tên

- Service file: `transaction.service.ts`
- ViewModel file: `transaction.viewmodel.ts`
- Repository file: `transaction.repository.ts`
- React View: `TransactionListView.tsx`
- Class: `TransactionService`
- Interface: `ITransactionRepository`
- Function: `createTransaction()`, `getTransactions()`
- Type: `Transaction`, `TransactionType`, `TransactionFilter`
