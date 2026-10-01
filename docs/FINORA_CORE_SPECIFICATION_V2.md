# FINORA — CORE SPECIFICATION v2.0

**Tài liệu cốt lõi về sản phẩm, nghiệp vụ, UX/UI, kiến trúc, dữ liệu và roadmap**

- Sản phẩm: Finora
- Định hướng: Quản lý tài chính cá nhân và gia đình
- Nền tảng: Android + iOS
- Công nghệ: Expo / React Native / TypeScript
- Kiến trúc: MVVM + Modular Architecture + Service Layer + Repository Pattern
- Phiên bản: 2.0
- Trạng thái: **Nguồn sự thật (Source of Truth) cho quá trình xây dựng Finora**
- Ngôn ngữ mặc định: Tiếng Việt, sẵn sàng đa ngôn ngữ
- Project: `D:\Projects\Finoras\Finora`

---

## 1. Tuyên bố sản phẩm

Finora không được định hướng thành một ứng dụng có thật nhiều chức năng. Mục tiêu là làm cho **việc quản lý tiền trở nên đơn giản, nhanh, rõ ràng và đáng tin cậy**.

Nguyên tắc sản phẩm số 1:

> **Ghi nhận giao dịch phải nhanh hơn việc người dùng ngại ghi chép.**

Mọi tính năng nâng cao phải hỗ trợ, không được làm hỏng hoặc làm chậm luồng ghi Thu/Chi.

Finora phục vụ cả người mới bắt đầu và người có nhu cầu quản lý tài chính sâu hơn. Người dùng phổ thông không cần hiểu thuật ngữ kỹ thuật hay kế toán để sử dụng ứng dụng.

---

## 2. Đối tượng và nhu cầu

### 2.1 Người dùng cá nhân

Nhu cầu chính:
- Biết hiện có bao nhiêu tiền.
- Ghi một khoản Thu/Chi trong vài thao tác.
- Biết tiền đang được chi vào đâu.
- Theo dõi lịch sử.
- Đặt giới hạn chi tiêu.
- Xem tình hình tài chính theo ngày/tháng.

### 2.2 Gia đình

Nhu cầu mở rộng:
- Nhiều thành viên.
- Nhiều ví/tài khoản.
- Theo dõi chi tiêu chung.
- Phân quyền khi cần.
- Báo cáo theo phạm vi cá nhân/gia đình.

Tính năng gia đình có thể triển khai sau khi lõi cá nhân ổn định.

---

## 3. Nguyên tắc UX cốt lõi

1. **Mobile-first, một tay:** thao tác chính nằm trong vùng dễ chạm.
2. **Ít bước:** giao dịch thường xuyên phải tối giản.
3. **Không ép người dùng nhập quá nhiều thông tin:** chỉ yêu cầu trường thực sự cần.
4. **Mặc định thông minh:** ngày, ví thường dùng, danh mục gần nhất có thể được đề xuất.
5. **Hiển thị rõ:** số tiền, số dư và trạng thái phải dễ đọc.
6. **Không gây sợ:** lỗi được giải thích bằng ngôn ngữ đời thường.
7. **Có thể hoàn tác:** thao tác xóa hoặc thay đổi quan trọng cần có cơ chế an toàn.
8. **Accessibility:** hỗ trợ cỡ chữ lớn, vùng chạm đủ rộng, tương phản tốt và thông tin không chỉ truyền bằng màu.
9. **Offline-first cho nghiệp vụ lõi:** ghi nhận và xem dữ liệu cục bộ không phụ thuộc Internet.
10. **Nhất quán:** một nghiệp vụ chỉ có một quy tắc tính toán.

---

## 4. Mô hình trải nghiệm chính

### 4.1 Luồng hằng ngày

Mở Finora → nhìn nhanh tình hình → ghi giao dịch → tiếp tục sử dụng.

Dashboard phải trả lời nhanh:

- Tôi đang có bao nhiêu tiền?
- Tháng này tôi thu bao nhiêu?
- Tôi đã chi bao nhiêu?
- Tiền đang đi đâu?
- Có ngân sách nào sắp vượt?

### 4.2 Luồng ghi giao dịch

**Chi tiêu**
1. Bấm nút Giao dịch.
2. Chọn Chi.
3. Nhập số tiền.
4. Chọn/đề xuất danh mục.
5. Chọn/đề xuất ví.
6. Có thể thêm ghi chú.
7. Lưu.
8. Cập nhật giao dịch, số dư, ngân sách và dashboard theo một transaction flow nhất quán.

**Thu nhập** dùng cùng nguyên tắc nhưng loại giao dịch là Thu.

**Chuyển tiền**
1. Chọn Chuyển.
2. Chọn ví/tài khoản nguồn.
3. Chọn ví/tài khoản đích.
4. Nhập số tiền.
5. Lưu.
6. Trừ nguồn và cộng đích.
7. **Không làm thay đổi tổng tài sản chỉ vì chuyển tiền nội bộ.**

### 4.3 Luồng sau khi lưu

Sau khi lưu thành công:
- Hiển thị xác nhận rõ ràng.
- Cập nhật số dư.
- Cập nhật danh sách giao dịch.
- Cập nhật dữ liệu Dashboard/Budget/Report khi liên quan.
- Cho phép hoàn tác trong thời gian hợp lý nếu UX áp dụng.

---

## 5. Information Architecture

Điều hướng chính nên giữ đơn giản:

- **Tổng quan**
- **Giao dịch**
- **Ví**
- **Báo cáo**
- **Khác**

Các chức năng như Danh mục, Ngân sách, Cài đặt, Sao lưu... không nhất thiết phải chiếm tab chính nếu tần suất sử dụng thấp.

Nút **+ Giao dịch** phải luôn dễ tiếp cận từ màn hình chính.

---

## 6. Chức năng lõi

### 6.1 Wallet / Account

Mỗi nguồn tiền được biểu diễn như một ví/tài khoản tài chính.

Ví dụ:
- Tiền mặt
- Tài khoản ngân hàng
- Ví điện tử
- Tài khoản khác

Thông tin cơ bản:
- Tên
- Loại
- Số dư đầu kỳ
- Số dư hiện tại
- Trạng thái hoạt động
- Đơn vị tiền tệ

Không nên đồng nhất mọi loại tài khoản với tiền mặt. Mô hình dữ liệu phải đủ khả năng mở rộng cho thẻ tín dụng và các khoản phải thu/phải trả.

### 6.2 Category

Danh mục gồm:
- Danh mục Chi
- Danh mục Thu
- Nhóm danh mục
- Danh mục hệ thống
- Danh mục người dùng tự tạo

Không cho phép xóa cứng danh mục đã được giao dịch sử dụng nếu việc đó làm mất tính toàn vẹn lịch sử. Có thể chuyển sang trạng thái không hoạt động.

### 6.3 Transaction

Ba loại lõi:
- Income
- Expense
- Transfer

Thuộc tính cần thiết:
- ID
- Loại giao dịch
- Số tiền
- Ví/tài khoản
- Danh mục nếu áp dụng
- Ngày giao dịch
- Ghi chú
- Trạng thái
- Thời gian tạo/cập nhật

Các thao tác:
- Tạo
- Xem
- Sửa
- Xóa/an toàn hóa
- Hoàn tác khi phù hợp
- Tìm kiếm
- Lọc
- Sắp xếp

### 6.4 Budget

Ngân sách theo:
- Thời gian
- Danh mục
- Số tiền kế hoạch

Theo dõi:
- Đã chi
- Còn lại
- Phần trăm sử dụng
- Cảnh báo theo ngưỡng

Các trạng thái cần xét:
- Bình thường
- Gần ngưỡng
- Đạt 100%
- Vượt ngân sách

### 6.5 Dashboard

Ưu tiên:
1. Tổng số dư các tài khoản tiền được chọn.
2. Thu trong kỳ.
3. Chi trong kỳ.
4. Dòng tiền ròng.
5. Giao dịch gần đây.
6. Ngân sách đáng chú ý.
7. Phân bổ chi tiêu khi có đủ dữ liệu.

Không hiển thị quá nhiều biểu đồ ngay khi người dùng chưa có dữ liệu.

### 6.6 Report

Báo cáo lấy dữ liệu từ nguồn giao dịch đã chuẩn hóa.

Nhóm báo cáo:
- Thu/Chi theo kỳ
- Thu/Chi theo danh mục
- Dòng tiền
- So sánh kỳ
- Ngân sách và thực tế

Tổng báo cáo phải khớp dữ liệu giao dịch nguồn.

---

## 7. Financial Engine — nguyên tắc bất biến

Đây là phần quan trọng nhất của Finora.

### 7.1 Số dư

Số dư phải được xác định từ:
- Số dư đầu kỳ
- Các giao dịch làm tăng
- Các giao dịch làm giảm
- Các giao dịch chuyển vào/ra

Ví dụ:

**1.000.000đ - 300.000đ = 700.000đ**

### 7.2 Transfer

Chuyển 500.000đ từ A sang B:

- A giảm 500.000đ.
- B tăng 500.000đ.
- Tổng tài sản nội bộ không đổi.

### 7.3 Sửa giao dịch

Sửa giao dịch phải điều chỉnh đúng ảnh hưởng cũ trước khi áp dụng ảnh hưởng mới. Không được cộng/trừ lặp.

### 7.4 Xóa giao dịch

Xóa phải bảo đảm số dư và các tổng hợp liên quan được cập nhật chính xác.

Ưu tiên soft delete hoặc cơ chế audit khi phù hợp thay vì xóa vật lý không kiểm soát.

### 7.5 Tiền

Không dùng phép tính floating-point đơn giản cho nghiệp vụ tiền.

Thiết kế phải dùng:
- đơn vị nhỏ nhất phù hợp, hoặc
- Decimal/kiểu số chính xác.

Mục tiêu là tránh sai số tiền do biểu diễn số thực.

### 7.6 Date/Time

Phân biệt:
- Ngày giao dịch
- Thời điểm tạo
- Thời điểm cập nhật

Không để timezone làm thay đổi sai ngày tài chính của người dùng.

### 7.7 Data integrity

Mọi thao tác ảnh hưởng tới giao dịch và số dư phải được xử lý theo một use case nhất quán, tránh trạng thái giao dịch đã lưu nhưng số dư chưa cập nhật hoặc ngược lại.

---

## 8. Offline-first

Các nghiệp vụ lõi phải sử dụng được khi không có Internet:
- Xem dữ liệu.
- Tạo giao dịch.
- Sửa giao dịch.
- Xóa/hoàn tác theo quy tắc.
- Xem số dư.
- Xem các tổng hợp có thể tính cục bộ.

Cloud Sync là lớp mở rộng sau này, không được trở thành điều kiện để Finora hoạt động cơ bản.

---

## 9. Database domain model

Mô hình định hướng:

```
User
 └── Ledger / Household
      ├── Members
      ├── Wallets / Accounts
      ├── Categories
      ├── Transactions
      ├── Budgets
      ├── Recurring Rules
      ├── Savings Goals
      ├── Debts
      └── Audit / Sync Metadata
```

Lõi MVP tối thiểu:
- users
- ledgers/workspaces
- wallets
- categories
- transactions
- budgets

Mở rộng:
- recurring_transactions/rules
- debts
- savings
- attachments
- notifications
- audit_logs
- sync metadata

### 9.1 Quy tắc dữ liệu

- ID phải ổn định.
- Có createdAt/updatedAt ở entity cần thiết.
- Không phá lịch sử khi đổi tên danh mục hoặc ví.
- Foreign key/reference phải được kiểm soát.
- Dữ liệu tiền phải có quy tắc precision thống nhất.
- Migration phải có version.
- Không sửa schema tùy tiện mà không cập nhật đặc tả.

---

## 10. Kiến trúc phần mềm

Giữ:

```
View
 ↓
ViewModel
 ↓
Service / Use Case
 ↓
Repository Interface
 ↓
Repository Implementation
 ↓
Database / External Source
```

### View
Chỉ trình bày và nhận tương tác.

### ViewModel
Quản lý UI state, validation flow, loading/error/success và command.

### Service
Chứa business rules và use cases.

### Repository
Đọc/ghi dữ liệu thông qua abstraction.

### Expo Router
Thư mục `app/` chỉ nên giữ route và kết nối mỏng tới View. Không đặt SQL hoặc business logic quan trọng trong route.

---

## 11. Modular Architecture

Module lõi:

```
src/modules/
├── transaction/
├── wallet/
├── category/
├── budget/
└── report/
```

Module mở rộng khi thực sự triển khai:

```
├── recurring/
├── debt/
├── saving/
├── notification/
└── account/
```

Quy tắc:
- Module không truy cập trực tiếp database của module khác.
- Phối hợp nghiệp vụ qua Service/public interface.
- Không tạo dependency vòng.
- Shared components đặt trong `src/shared`.
- Hạ tầng chung đặt trong `src/core`.
- Không over-engineer module chưa cần.

---

## 12. Cấu trúc thư mục chuẩn

```
app/
src/
├── core/
│   ├── database/
│   ├── storage/
│   ├── config/
│   ├── constants/
│   ├── errors/
│   ├── utils/
│   └── types/
├── shared/
│   ├── components/
│   ├── hooks/
│   ├── theme/
│   └── types/
└── modules/
    ├── transaction/
    ├── wallet/
    ├── category/
    ├── budget/
    └── report/

assets/
tests/
docs/
```

Mỗi module có thể có:
- model
- types
- view
- viewmodel
- service
- repository
- validation
- tests
- index

Chỉ tạo phần cần thiết khi nghiệp vụ được triển khai.

---

## 13. Design System

Finora cần một design system thống nhất thay vì mỗi màn hình tự thiết kế.

Bao gồm:
- Typography
- Spacing
- Radius
- Iconography
- Button
- Input
- Card
- List
- Bottom sheet
- Modal
- Toast/Snackbar
- Empty state
- Loading state
- Error state
- Confirmation
- Theme

Tiền phải có định dạng nhất quán toàn ứng dụng.

Các màu không được là nguồn thông tin duy nhất. Ví dụ Thu/Chi cần có thêm chữ, icon hoặc trạng thái.

---

## 14. Accessibility và khả năng tiếp cận

Finora phải phục vụ:
- Người dùng lớn tuổi.
- Người dùng thích cỡ chữ lớn.
- Người dùng thao tác bằng một tay.
- Người dùng có khả năng nhìn màu hạn chế.

Yêu cầu:
- Vùng chạm đủ lớn.
- Text dễ đọc.
- Không phụ thuộc hoàn toàn vào màu sắc.
- Nội dung biểu đồ có cách đọc thay thế.
- Label rõ ràng.
- Focus/accessibility semantics phù hợp.
- Không nhồi quá nhiều thông tin vào một màn hình.

---

## 15. Error handling

Không hiển thị lỗi kỹ thuật kiểu database/SQL cho người dùng.

Ví dụ:
- Không lưu được giao dịch → giải thích việc gì xảy ra và cho phép thử lại.
- Không đủ dữ liệu → hướng dẫn người dùng bổ sung.
- Sync lỗi → dữ liệu cục bộ vẫn an toàn và cho phép thử lại.

Mọi trạng thái chính:
- Loading
- Empty
- Success
- Error
- Disabled

phải được thiết kế trước khi coi màn hình hoàn thành.

---

## 16. Security và quyền riêng tư

Dữ liệu tài chính là dữ liệu nhạy cảm.

Yêu cầu kiến trúc:
- Không đưa secret/API key vào Git.
- Không log dữ liệu tài chính nhạy cảm không cần thiết.
- Chuẩn bị khả năng khóa ứng dụng bằng cơ chế bảo vệ phù hợp.
- Backup/restore phải tránh ghi đè hoặc mất dữ liệu ngoài ý muốn.
- Cloud sync phải có chiến lược conflict rõ ràng trước khi triển khai.

---

## 17. Testing Strategy

### Unit
Ưu tiên:
- Tính số dư.
- Thu/Chi.
- Transfer.
- Sửa giao dịch.
- Xóa/hoàn tác.
- Budget.
- Report aggregation.
- Date/time.
- Money precision.

### Integration
Kiểm tra chuỗi:

```
Transaction
 → Wallet
 → Balance
 → Budget
 → Dashboard
 → Report
```

### Regression
Mỗi thay đổi ở Financial Engine phải chạy lại các test liên quan.

### E2E
Các luồng quan trọng:
- Tạo ví.
- Tạo giao dịch Chi.
- Tạo giao dịch Thu.
- Chuyển tiền.
- Sửa giao dịch.
- Xóa/hoàn tác.
- Tạo ngân sách.
- Xem báo cáo.

**Không release khi các phép tính tài chính cốt lõi chưa được kiểm thử.**

---

## 18. Product quality gates

Một chức năng chỉ được coi là hoàn thành khi:

- Đúng nghiệp vụ.
- UX dễ hiểu.
- Luồng chính ngắn.
- Có loading/empty/error/success phù hợp.
- Không phá chức năng cũ.
- Không làm sai số dư.
- Có test nghiệp vụ quan trọng.
- Không phá kiến trúc MVVM.
- Có thể sử dụng offline nếu thuộc nhóm lõi.
- Đã kiểm tra trên Android; sau đó kiểm tra iOS trước release.

---

## 19. Roadmap v2

### Milestone 1 — Foundation
- Project foundation
- Theme
- Navigation
- Shared components
- Core infrastructure

### Milestone 2 — Financial Core
- Database
- Repository
- Wallet/Account
- Category
- Transaction
- Financial Engine

**Mục tiêu nghiệm thu:** người dùng có thể ghi Thu/Chi/Chuyển tiền và số dư luôn chính xác.

### Milestone 3 — Daily Finance
- Dashboard
- Transaction history
- Search/filter
- Quick transaction
- Recent transactions

### Milestone 4 — Planning
- Budget
- Budget alerts
- Period comparison

### Milestone 5 — Understanding
- Reports
- Charts
- Cash-flow analysis
- Spending breakdown

### Milestone 6 — Advanced Finance
- Recurring
- Debt
- Saving goals
- Notifications

### Milestone 7 — Account & Data
- Backup
- Restore
- Account
- Cloud sync
- Multi-device

### Milestone 8 — Production
- Unit tests
- Integration tests
- E2E/regression
- Accessibility
- Performance
- Security/privacy review
- Android/iOS release

---

## 20. Quy tắc phát triển Git

Trong giai đoạn xây dựng:

- `main` = phiên bản ổn định.
- Mỗi chức năng/nhóm chức năng phát triển trên branch riêng.
- Không merge vào `main` chỉ vì một chức năng vừa chạy được.
- Chỉ merge khi nhóm chức năng đã ổn định và đạt quality gates.
- Sau khi merge, `main` phải luôn ở trạng thái có thể tiếp tục phát triển an toàn.

Quy trình:

```
main
  ↓
feature/*
  ↓
Develop
  ↓
Build
  ↓
Test
  ↓
Fix
  ↓
Regression
  ↓
Stable
  ↓
Merge main
```

---

## 21. Nguyên tắc thay đổi đặc tả

Đây là tài liệu **Source of Truth**.

Nếu thay đổi ảnh hưởng đến:
- Dữ liệu
- Giao dịch
- Số dư
- Budget
- Report
- Luồng UX chính
- Kiến trúc

thì phải cập nhật tài liệu trước hoặc đồng thời với code.

Không tự suy đoán các nghiệp vụ tài chính quan trọng chưa được quyết định. Những điểm chưa chốt phải đánh dấu **TBD**.

---

## 22. Những gì Finora không ưu tiên ở giai đoạn lõi

Không triển khai AI, OCR, kết nối ngân hàng hoặc tính năng phức tạp chỉ để tăng số lượng chức năng trước khi:

- Financial Engine ổn định.
- Database ổn định.
- Transaction flow ổn định.
- Dashboard/Report cho kết quả chính xác.
- Backup/restore có chiến lược rõ ràng.

Các tính năng nâng cao phải được xây trên nền dữ liệu đáng tin cậy.

---

## 23. Tiêu chuẩn trải nghiệm cuối cùng

Khi người dùng mở Finora, họ phải có cảm giác:

**“Tôi biết mình đang có bao nhiêu tiền.”**

Khi muốn ghi chi:

**“Tôi ghi xong rất nhanh.”**

Khi muốn kiểm tra:

**“Tôi hiểu tiền của mình đang đi đâu.”**

Khi nhập sai:

**“Tôi có thể sửa và không sợ làm hỏng số dư.”**

Khi mất mạng:

**“Dữ liệu của tôi vẫn ở đây.”**

Đó là tiêu chuẩn sản phẩm mà mọi phase sau phải hướng tới.

---

## 24. Trạng thái phiên bản

### v2.0 — Core Product Specification
- Hợp nhất định hướng sản phẩm, UX/UI, nghiệp vụ, kiến trúc, dữ liệu, testing và roadmap.
- Chuyển trọng tâm từ “nhiều module” sang “trải nghiệm quản lý tiền đơn giản và chính xác”.
- Xác lập Financial Engine và Quick Transaction là nền tảng.
- Xác lập `main` là stable branch.
- Xác lập tài liệu này là Source of Truth.

**Ngày:** 2026-10-02
