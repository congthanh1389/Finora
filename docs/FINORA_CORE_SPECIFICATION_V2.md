# FINORA — CORE SPECIFICATION v2.1

**Tài liệu Source of Truth cho sản phẩm, nghiệp vụ, UX/UI, kiến trúc, dữ liệu, kiểm thử và roadmap của Finora.**

- Sản phẩm: Finora
- Định hướng: quản lý tài chính cá nhân và gia đình
- Nền tảng: Android + iOS
- Công nghệ: Expo / React Native / TypeScript
- Kiến trúc: MVVM + Modular Architecture + Service / Use Case Layer + Repository Pattern
- Phiên bản: 2.1
- Trạng thái: **Core Source of Truth**
- Ngôn ngữ mặc định: Tiếng Việt, sẵn sàng đa ngôn ngữ
- Project: `D:\Projects\Finoras\Finora`

---

## 0. Mục đích và nguyên tắc của tài liệu

Tài liệu này là chuẩn chung để quyết định **Finora phải làm gì, làm như thế nào và khi nào được coi là hoàn thành**.

Khi code, UI, database hoặc tài liệu khác mâu thuẫn với tài liệu này, phải xử lý theo thứ tự:

1. Xác định mâu thuẫn.
2. Không tự ý tạo quy tắc nghiệp vụ mới trong code.
3. Nếu cần thay đổi nghiệp vụ, cập nhật Core Specification trước.
4. Sau khi đặc tả thay đổi mới cập nhật database, architecture và code.

Core Specification không phải danh sách mọi tính năng có thể có. Những tính năng chưa cần thiết cho lõi ổn định phải được giữ ngoài phạm vi triển khai hiện tại.

---

# 1. Tầm nhìn sản phẩm

Finora không được định hướng thành một ứng dụng có thật nhiều chức năng. Mục tiêu là làm cho **việc quản lý tiền trở nên đơn giản, nhanh, rõ ràng và đáng tin cậy**.

> **Nguyên tắc sản phẩm số 1: Ghi nhận giao dịch phải nhanh hơn việc người dùng ngại ghi chép.**

Mọi tính năng nâng cao phải hỗ trợ nguyên tắc này, không được làm chậm hoặc làm phức tạp luồng Thu / Chi cơ bản.

Finora phải phục vụ được:

- người mới bắt đầu quản lý tiền;
- người dùng thường xuyên muốn ghi chép thật nhanh;
- người dùng muốn phân tích tài chính sâu hơn;
- gia đình có nhiều ví, tài khoản và thành viên ở giai đoạn mở rộng.

Người dùng phổ thông không cần hiểu thuật ngữ kế toán để sử dụng các nghiệp vụ cơ bản.

---

# 2. Mục tiêu trải nghiệm

Mỗi ngày, trải nghiệm lý tưởng là:

`Mở app → nhìn tình hình → ghi giao dịch → tiếp tục cuộc sống`

Finora phải trả lời nhanh 5 câu hỏi:

1. Tôi đang có bao nhiêu tiền?
2. Trong kỳ này tôi đã thu bao nhiêu?
3. Trong kỳ này tôi đã chi bao nhiêu?
4. Tiền đang đi vào đâu?
5. Có khoản ngân sách nào cần chú ý không?

### 2.1 Quy tắc UX

1. Mobile-first.
2. Tối ưu thao tác một tay.
3. Ít bước cho nghiệp vụ thường xuyên.
4. Không bắt nhập thông tin không cần thiết.
5. Mặc định thông minh nhưng luôn cho phép người dùng sửa.
6. Số tiền và số dư phải dễ đọc.
7. Lỗi phải nói bằng ngôn ngữ đời thường và hướng dẫn cách xử lý.
8. Thao tác nguy hiểm phải có bảo vệ và/hoặc hoàn tác.
9. Core finance phải dùng được offline.
10. Một nghiệp vụ chỉ có một quy tắc tính toán.
11. Không dựa chỉ vào màu sắc để truyền trạng thái.
12. Vùng chạm, cỡ chữ và tương phản phải đáp ứng accessibility.

---

# 3. Người dùng và phạm vi

## 3.1 Cá nhân — phạm vi ưu tiên

MVP tập trung vào một người dùng quản lý tài chính của chính mình.

Nhu cầu:

- nhiều ví / tài khoản;
- Thu / Chi / Chuyển;
- số dư chính xác;
- danh mục;
- ngân sách;
- lịch sử giao dịch;
- báo cáo;
- dữ liệu hoạt động offline.

## 3.2 Gia đình — mở rộng sau lõi cá nhân

Mô hình phải đủ khả năng mở rộng thành:

`User → Ledger / Household → Members → Financial Data`

Nhưng không được để phân quyền, đồng bộ nhiều thành viên hoặc cloud sync làm phức tạp MVP cá nhân.

---

# 4. Information Architecture

Điều hướng chính đề xuất:

- **Tổng quan**
- **Giao dịch**
- **Ví**
- **Báo cáo**
- **Khác**

Nút **+ Giao dịch** phải luôn dễ tiếp cận từ Tổng quan và các màn hình chính.

Các chức năng tần suất thấp như Danh mục, Ngân sách, Sao lưu, Cài đặt không cần chiếm tab chính.

### 4.1 Tổng quan

Là nơi trả lời nhanh tình hình tài chính.

Ưu tiên hiển thị:

1. Tổng số dư các tài khoản được đưa vào phạm vi tổng quan.
2. Thu trong kỳ.
3. Chi trong kỳ.
4. Dòng tiền ròng.
5. Giao dịch gần đây.
6. Ngân sách đáng chú ý.
7. Phân bổ chi tiêu khi có đủ dữ liệu.

Không ép người dùng xem quá nhiều biểu đồ khi dữ liệu chưa đủ.

### 4.2 Giao dịch

Cho phép:

- xem danh sách;
- tìm kiếm;
- lọc theo kỳ, ví, loại, danh mục;
- sắp xếp;
- mở chi tiết;
- sửa;
- xóa / vô hiệu hóa theo quy tắc;
- hoàn tác khi có thể.

### 4.3 Ví

Cho phép xem:

- danh sách ví / tài khoản;
- số dư;
- giao dịch liên quan;
- trạng thái hoạt động;
- thiết lập cơ bản.

### 4.4 Báo cáo

Chỉ hiển thị báo cáo được tính từ nguồn dữ liệu giao dịch chuẩn hóa.

### 4.5 Khác

Chứa các chức năng quản trị và mở rộng như:

- Danh mục
- Ngân sách
- Cài đặt
- Sao lưu / khôi phục
- Tài khoản người dùng
- Trợ giúp
- Các tính năng nâng cao trong tương lai.

---

# 5. Financial Domain Model

Đây là mô hình nghiệp vụ trung tâm:

```text
User
 └── Ledger / Workspace
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

Luồng dữ liệu cốt lõi:

```text
Wallet / Account
      ↓
Transaction
      ↓
Financial Engine
      ↓
Balance / Cash Flow
      ↓
Budget
      ↓
Dashboard / Report
```

**Financial Engine là nguồn sự thật về tác động tài chính.** Dashboard và Report không được tự xây dựng logic tính tiền riêng.

---

# 6. Wallet / Account — mô hình nguồn tiền

Một Wallet / Account đại diện cho một nơi hoặc một loại tài sản / nghĩa vụ tài chính mà Finora cần theo dõi.

Các loại MVP:

- Cash — tiền mặt
- Bank — tài khoản ngân hàng
- E-wallet — ví điện tử
- Other — nguồn tiền khác

Mô hình phải có khả năng mở rộng cho:

- Credit Card
- Receivable
- Payable
- các loại tài khoản đặc thù khác.

## 6.1 Thuộc tính cơ bản

- `id`
- `ledgerId`
- `name`
- `type`
- `currency`
- `openingBalance`
- `openingBalanceDate` hoặc mốc bắt đầu tương đương
- `isActive`
- `createdAt`
- `updatedAt`

## 6.2 Quy tắc số dư

Không coi `currentBalance` là một giá trị độc lập có thể tùy ý sửa trong mọi trường hợp.

Về nghiệp vụ:

`Current Balance = Opening Balance + Net Financial Effects From Valid Transactions`

Nếu hệ thống có cache số dư để tối ưu, cache chỉ là dữ liệu dẫn xuất và phải có khả năng tái tính / kiểm tra từ nguồn giao dịch.

## 6.3 Ẩn / ngừng sử dụng

Ví đã có lịch sử giao dịch không được xóa cứng tùy tiện. Ưu tiên `inactive` / archive để giữ lịch sử.

---

# 7. Transaction — mô hình giao dịch chuẩn

Ba loại giao dịch lõi:

- `INCOME`
- `EXPENSE`
- `TRANSFER`

Mọi giao dịch phải có:

- ID ổn định;
- ledger / workspace;
- loại giao dịch;
- số tiền dương theo đơn vị tiền tệ chuẩn;
- ngày giao dịch;
- thời điểm tạo;
- thời điểm cập nhật;
- trạng thái;
- nguồn / ví liên quan;
- danh mục khi nghiệp vụ yêu cầu;
- ghi chú tùy chọn.

## 7.1 Quy tắc số tiền

Không dùng số floating-point trực tiếp cho nghiệp vụ tiền.

Ưu tiên một trong hai mô hình:

- integer theo đơn vị nhỏ nhất của tiền tệ; hoặc
- Decimal / kiểu số chính xác.

Một hệ thống chỉ được chọn **một quy tắc chuẩn** và áp dụng xuyên suốt database, domain, service, repository và report.

Số tiền giao dịch phải là số dương; hướng tác động được xác định bởi loại giao dịch và tài khoản liên quan. Không dùng số âm để biểu diễn đồng thời nhiều ý nghĩa.

---

# 8. Quy tắc Thu / Chi / Chuyển

## 8.1 Expense

Ví dụ:

`Cash 1.000.000 → Chi 300.000 → Cash 700.000`

Expense:

- giảm số dư nguồn;
- thuộc một danh mục Chi;
- được đưa vào tổng Chi của kỳ;
- được tính vào Budget nếu thỏa điều kiện ngân sách.

## 8.2 Income

Ví dụ:

`Bank 5.000.000 → Thu 2.000.000 → Bank 7.000.000`

Income:

- tăng số dư nguồn;
- thuộc một danh mục Thu khi áp dụng;
- được đưa vào tổng Thu của kỳ;
- không làm tăng chi ngân sách.

## 8.3 Transfer

Ví dụ:

`Cash 2.000.000 → Transfer 500.000 → Bank +500.000`

Kết quả:

- nguồn giảm 500.000;
- đích tăng 500.000;
- tổng tài sản nội bộ không đổi;
- không tính là Income;
- không tính là Expense;
- không làm tăng / giảm tổng Chi chỉ vì chuyển tiền.

Transfer phải là một nghiệp vụ logic thống nhất, không phải hai Expense/Income độc lập.

## 8.4 Không cho phép

Không cho phép chuyển tiền:

- từ ví sang chính nó;
- số tiền <= 0;
- từ ví không hoạt động nếu nghiệp vụ không cho phép;
- vượt khả năng chi trả nếu loại tài khoản / chính sách nghiệp vụ yêu cầu chặn.

---

# 9. Transaction lifecycle

Mỗi giao dịch phải có vòng đời rõ ràng.

```text
Draft / Input
    ↓
Validate
    ↓
Create
    ↓
Persist
    ↓
Apply Financial Effects
    ↓
Refresh Derived Data
    ↓
Visible / Confirmed
```

Nếu lưu thất bại, không được để trạng thái một nửa: transaction đã tồn tại nhưng balance chưa cập nhật, hoặc balance đã đổi nhưng transaction chưa tồn tại.

Nghiệp vụ ghi giao dịch phải nằm trong một use case / service có trách nhiệm điều phối toàn bộ thay đổi cần thiết.

---

# 10. Sửa, xóa và hoàn tác giao dịch

## 10.1 Sửa

Khi sửa một giao dịch:

1. đọc trạng thái / tác động cũ;
2. loại bỏ tác động cũ khỏi các dữ liệu dẫn xuất;
3. validate dữ liệu mới;
4. áp dụng tác động mới;
5. commit thành một nghiệp vụ nhất quán.

Ví dụ đổi Expense từ 300.000 thành 450.000 thì số dư phải thay đổi thêm đúng 150.000, không được trừ 450.000 lần thứ hai.

## 10.2 Xóa

Ưu tiên soft delete / void hoặc cơ chế audit có kiểm soát đối với dữ liệu đã tham gia vào lịch sử tài chính.

Sau khi xóa / void:

- số dư phải được tính lại đúng;
- tổng Thu / Chi phải đúng;
- Budget phải đúng;
- Report phải loại giao dịch theo trạng thái chuẩn.

## 10.3 Undo

Undo là hành vi UX, không phải một quy tắc tính tiền riêng.

Undo phải gọi lại domain operation phù hợp và không tạo ra cách tính thứ hai.

---

# 11. Date / Time / Timezone

Phải phân biệt ít nhất:

- `transactionDate` — ngày tài chính người dùng chọn;
- `createdAt` — thời điểm hệ thống tạo bản ghi;
- `updatedAt` — thời điểm cập nhật.

`transactionDate` là dữ liệu nghiệp vụ và không được tự ý đổi ngày chỉ vì timezone / UTC conversion.

Ví dụ người dùng ghi một khoản lúc 23:30 ngày 01/10 theo giờ địa phương thì giao dịch phải thuộc ngày 01/10 theo lịch tài chính của người dùng.

Các truy vấn theo ngày / tháng phải dựa trên trường nghiệp vụ phù hợp, không lấy `createdAt` thay cho `transactionDate`.

---

# 12. Category

Danh mục có thể gồm:

- danh mục Chi;
- danh mục Thu;
- nhóm danh mục;
- danh mục hệ thống;
- danh mục người dùng tạo.

Quy tắc:

- Category phải có loại phù hợp với transaction.
- Không xóa cứng category đã được sử dụng nếu làm mất lịch sử.
- Đổi tên category không được làm thay đổi lịch sử giao dịch.
- Có thể inactive category.
- Category không được chứa logic tính balance riêng.

---

# 13. Budget

Budget là kế hoạch / giới hạn chi tiêu, không phải nguồn sự thật về giao dịch.

Một Budget tối thiểu gồm:

- phạm vi ledger;
- kỳ áp dụng;
- category hoặc phạm vi category;
- planned amount;
- trạng thái;
- createdAt / updatedAt.

Các chỉ số:

- `spent`
- `remaining`
- `usagePercent`
- trạng thái cảnh báo.

Công thức cơ bản:

`remaining = plannedAmount - eligibleExpense`

`usagePercent = eligibleExpense / plannedAmount × 100`

`eligibleExpense` chỉ bao gồm Expense hợp lệ thuộc đúng kỳ, đúng category / scope và trạng thái được tính.

Transfer không được tính vào Budget Expense.

Ngưỡng cảnh báo có thể cấu hình, nhưng logic phải nằm ở domain/service chứ không nằm rải rác trong UI.

---

# 14. Dashboard

Dashboard chỉ đọc dữ liệu đã được chuẩn hóa.

Không tạo một bộ công thức riêng cho Dashboard.

### 14.1 Chỉ số chuẩn

**Total Balance**

Tổng số dư của các tài khoản thuộc phạm vi hiển thị và được cấu hình để tính vào tổng tài sản.

**Income**

Tổng Income hợp lệ trong kỳ.

**Expense**

Tổng Expense hợp lệ trong kỳ.

**Net Cash Flow**

`Income - Expense`

Transfer nội bộ không làm thay đổi Net Cash Flow.

### 14.2 Empty state

Khi chưa có dữ liệu:

- không hiển thị biểu đồ giả;
- giải thích ngắn gọn;
- hướng người dùng tới hành động đầu tiên, ví dụ tạo ví hoặc ghi giao dịch.

---

# 15. Report

Report phải lấy dữ liệu từ Financial Engine / domain query chuẩn.

Các báo cáo lõi:

1. Thu / Chi theo kỳ.
2. Thu / Chi theo category.
3. Cash flow.
4. So sánh kỳ.
5. Budget vs Actual.
6. Chi tiêu theo ví / tài khoản khi có ý nghĩa.

### 15.1 Nguyên tắc đối soát

Tổng Report phải khớp với tổng giao dịch nguồn sau khi áp dụng cùng:

- kỳ;
- phạm vi ledger;
- trạng thái;
- loại giao dịch;
- category;
- timezone / ngày tài chính.

Nếu Dashboard và Report cùng trả lời một câu hỏi nhưng cho kết quả khác nhau thì đó là lỗi hệ thống, không phải hai cách tính hợp lệ.

---

# 16. Multi-currency — định hướng tương lai

MVP có thể dùng một currency chuẩn cho ledger.

Nếu mở rộng multi-currency, không được giả định cộng trực tiếp các số tiền khác currency.

Phải có:

- transaction currency;
- account / wallet currency;
- tỷ giá / exchange rate khi cần;
- quy tắc currency của ledger;
- quy tắc làm tròn;
- cách hiển thị số liệu quy đổi.

Multi-currency chỉ được triển khai sau khi mô hình tiền một currency ổn định.

---

# 17. Credit Card / Receivable / Payable

Đây là phần mở rộng của Financial Engine, không được giả định giống Cash/Bank.

Ví dụ Credit Card có thể cần mô hình hóa:

- khoản chi phát sinh;
- nghĩa vụ phải trả;
- thanh toán thẻ;
- giới hạn tín dụng;
- số dư nợ.

Receivable / Payable phải phân biệt tài sản tiền hiện có với khoản phải thu / phải trả.

**Không đưa các loại tài khoản nâng cao vào MVP nếu chưa có nghiệp vụ và test đầy đủ.**

---

# 18. Offline-first và Persistence

Core operations phải hoạt động không cần Internet:

- mở dữ liệu đã lưu;
- xem ví;
- tạo / sửa / xóa giao dịch theo quy tắc;
- xem số dư;
- xem tổng hợp có thể tính cục bộ.

Database cục bộ là nguồn dữ liệu vận hành của offline mode.

UI không được phụ thuộc vào network response để hoàn tất một giao dịch local cơ bản.

---

# 19. Backup / Restore / Sync

## 19.1 Backup

Backup phải bảo toàn:

- entity IDs;
- transaction history;
- wallet/category relationships;
- dates;
- monetary precision;
- schema/version metadata.

## 19.2 Restore

Restore phải có:

1. validation file;
2. schema/version check;
3. preview hoặc xác nhận khi cần;
4. transaction-safe import;
5. báo lỗi rõ ràng nếu không thể khôi phục.

## 19.3 Cloud Sync

Cloud sync là lớp mở rộng, không phải điều kiện của core finance.

Khi triển khai sync phải có quy tắc rõ cho:

- identity;
- created/updated timestamps;
- deletion / tombstone;
- conflict;
- retry;
- duplicate prevention;
- offline queue.

Không tự động chọn một phiên bản dữ liệu trong im lặng khi conflict có thể làm mất dữ liệu tài chính.

---

# 20. Database Design Rules

Mô hình tối thiểu định hướng:

```text
users
ledgers / workspaces
members
wallets
categories
transactions
budgets
```

Mở rộng:

```text
recurring_rules
savings_goals
debts
attachments
notifications
audit_logs
sync_metadata
```

## 20.1 Integrity

- ID ổn định.
- Foreign key/reference được kiểm soát.
- Entity quan trọng có createdAt/updatedAt.
- Transaction date không thay thế createdAt.
- Monetary precision thống nhất.
- Migration có version.
- Không phá lịch sử khi đổi tên / archive.
- Không để entity tham chiếu tới bản ghi không tồn tại.
- Unique constraints phải được xác định cho các identity cần duy nhất.
- Index phải được thiết kế cho các truy vấn nghiệp vụ thường xuyên.

## 20.2 Transaction atomicity

Các thao tác tạo / sửa / void transaction phải bảo đảm tính nhất quán giữa:

`Transaction + Financial Effects + Derived Data`

Nếu database engine hỗ trợ transaction, các thay đổi cần thiết phải được commit atomically trong cùng use case.

---

# 21. Architecture — MVVM + Modular

Chuỗi phụ thuộc chuẩn:

```text
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
Local DB / Remote Source
```

### View

Chỉ chịu trách nhiệm presentation và user interaction.

Không đặt business rules tài chính phức tạp trong component.

### ViewModel

Quản lý:

- UI state;
- loading;
- validation presentation;
- event handling;
- gọi use case.

Không trở thành nơi tính toán domain tùy tiện.

### Service / Use Case

Là nơi điều phối nghiệp vụ:

- CreateExpense
- CreateIncome
- CreateTransfer
- UpdateTransaction
- VoidTransaction
- UndoTransaction
- CalculateBalance
- CalculateBudgetStatus
- QueryDashboard
- QueryReports

### Repository

Ẩn chi tiết persistence khỏi domain/service.

Repository interface không được chứa UI concern.

---

# 22. Modular Architecture

Định hướng module:

```text
src/
  core/
    domain/
    errors/
    money/
    date-time/
    validation/
  modules/
    wallets/
    categories/
    transactions/
    budgets/
    dashboard/
    reports/
    settings/
  data/
    repositories/
    database/
    migrations/
  shared/
    components/
    hooks/
    utils/
```

Tên thư mục thực tế có thể điều chỉnh theo repo, nhưng ranh giới trách nhiệm phải giữ nguyên.

Module không được truy cập trực tiếp database của module khác để thực hiện nghiệp vụ riêng. Cross-module operation phải đi qua service / use case phù hợp.

---

# 23. Error Handling

Lỗi phải được phân loại tối thiểu:

- Validation Error
- Business Rule Error
- Persistence Error
- Sync / Network Error
- Unexpected Error

UI phải chuyển lỗi kỹ thuật thành thông báo người dùng hiểu được.

Ví dụ không hiển thị raw SQL / stack trace cho người dùng cuối.

Các lỗi tài chính quan trọng phải được fail-safe: không báo thành công khi dữ liệu chưa được commit thành công.

---

# 24. Accessibility

Finora phải hỗ trợ:

- cỡ chữ lớn;
- vùng chạm đủ rộng;
- contrast phù hợp;
- screen reader labels cho control quan trọng;
- không truyền ý nghĩa chỉ bằng màu;
- chart có số liệu / mô tả thay thế;
- trạng thái lỗi có thông báo rõ;
- focus / keyboard support khi nền tảng yêu cầu.

Accessibility là yêu cầu sản phẩm, không phải việc làm sau cùng.

---

# 25. Security và Privacy

Finora xử lý dữ liệu tài chính nên phải áp dụng nguyên tắc tối thiểu quyền truy cập.

Không lưu / log dữ liệu nhạy cảm không cần thiết.

Không đưa số tiền, nội dung giao dịch hoặc thông tin tài khoản vào debug log production nếu không cần thiết.

Các tính năng trong tương lai cần xem xét:

- app lock;
- biometric unlock;
- encrypted local storage cho dữ liệu phù hợp;
- secure backup;
- session / token security;
- data deletion.

Không được coi bảo mật là lý do để làm chậm core flow một cách không cần thiết.

---

# 26. Testing Strategy

## 26.1 Unit tests — bắt buộc cho Financial Engine

Phải có test cho:

- tạo Expense;
- tạo Income;
- tạo Transfer;
- balance;
- sửa giao dịch;
- void / delete;
- undo;
- budget;
- date boundary;
- timezone boundary;
- monetary precision;
- category filtering;
- report totals.

## 26.2 Integration tests

Ít nhất phải kiểm tra chuỗi:

`Transaction → Wallet → Balance → Budget → Dashboard → Report`

## 26.3 E2E

Các luồng quan trọng:

1. Tạo ví.
2. Ghi Chi.
3. Ghi Thu.
4. Chuyển tiền.
5. Sửa giao dịch.
6. Xóa / hoàn tác.
7. Kiểm tra Dashboard.
8. Kiểm tra Report.
9. Kiểm tra Budget.

## 26.4 Regression

Mọi thay đổi Financial Engine phải chạy lại bộ regression liên quan trước khi coi là hoàn thành.

---

# 27. Quality Gate — định nghĩa Done

Một chức năng chỉ được coi là **Done** khi đáp ứng đồng thời:

1. Đúng nghiệp vụ.
2. Đúng UX.
3. Không phá chức năng hiện có.
4. Đúng architecture.
5. Có validation cần thiết.
6. Có loading / empty / error / success state phù hợp.
7. Có test tương ứng với mức độ rủi ro.
8. Không tạo logic tính tiền trùng lặp.
9. Không làm sai dữ liệu lịch sử.
10. Đã kiểm tra trên Android; các thay đổi cross-platform phải được kiểm tra theo phạm vi phù hợp.
11. Tài liệu được cập nhật nếu thay đổi contract hoặc business rule.

Build thành công **không đồng nghĩa** với Done.

---

# 28. Roadmap xây dựng

## Milestone 1 — Foundation

- project structure;
- design system;
- database foundation;
- repository pattern;
- error / validation foundation;
- test foundation.

## Milestone 2 — Financial Core

- Wallet;
- Category;
- Transaction;
- Income;
- Expense;
- Transfer;
- Balance;
- edit / void / undo;
- Financial Engine tests.

**Đây là milestone quan trọng nhất.**

## Milestone 3 — Daily Finance

- Dashboard;
- transaction list;
- search/filter;
- quick transaction;
- empty/loading/error states.

## Milestone 4 — Planning

- Budget;
- budget alerts;
- budget vs actual.

## Milestone 5 — Understanding

- Reports;
- cash flow;
- category analysis;
- period comparison.

## Milestone 6 — Advanced Finance

Chỉ triển khai sau khi core ổn định:

- recurring transactions;
- savings goals;
- debts;
- credit card;
- receivable / payable;
- multi-currency.

## Milestone 7 — Account & Data

- account / authentication;
- backup;
- restore;
- cloud sync;
- family / household;
- permissions.

## Milestone 8 — Production

- performance;
- accessibility audit;
- security review;
- full regression;
- release build;
- store preparation.

---

# 29. Những thứ chưa được phép làm phức tạp lõi

Trước khi Financial Engine ổn định, không ưu tiên:

- AI financial advisor;
- social features;
- gamification phức tạp;
- cloud dependency;
- multi-currency đầy đủ;
- family collaboration phức tạp;
- dashboard quá nhiều biểu đồ;
- automation chưa có business rule rõ.

Các tính năng này có thể quay lại roadmap sau khi lõi chứng minh được tính chính xác và dễ dùng.

---

# 30. Git Development Rules

- `main` là nhánh ổn định.
- Không merge từng feature vào `main` trong giai đoạn xây dựng hệ thống.
- Mỗi nhóm thay đổi có feature branch riêng.
- Code phải được kiểm tra trước khi coi feature hoàn thành.
- Những thay đổi lớn về business rule phải cập nhật Core Specification trước.
- Không sửa trực tiếp `main` để thử nghiệm.
- Khi toàn bộ hệ thống lõi, business flow, build và test ổn định mới chuẩn bị merge vào `main`.

---

# 31. Quy trình thay đổi đặc tả

Khi phát hiện một yêu cầu mới hoặc vấn đề nghiệp vụ:

```text
Requirement
   ↓
Business Rule
   ↓
User Flow
   ↓
Domain Model
   ↓
Database Contract
   ↓
Architecture
   ↓
Implementation
   ↓
Tests
   ↓
Acceptance
```

Không đi thẳng từ “ý tưởng UI” sang code nếu thay đổi đó ảnh hưởng Financial Engine.

---

# 32. Nguyên tắc chống sai lệch hệ thống

Finora phải tránh 5 nguồn sự thật khác nhau cho cùng một dữ liệu.

Ví dụ không được có:

- một cách tính Balance trong Wallet;
- một cách tính khác trong Dashboard;
- một cách tính khác trong Report.

Chuẩn phải là:

```text
Domain Rules
     ↓
Financial Engine
     ↓
Queries / Derived Data
     ↓
UI
```

UI chỉ trình bày kết quả đã được chuẩn hóa.

---

# 33. Acceptance Scenarios tối thiểu

## Scenario A — Expense

Given ví có 1.000.000đ.

When người dùng ghi Expense 300.000đ.

Then:

- transaction tồn tại;
- wallet còn 700.000đ;
- Expense kỳ hiện tại tăng 300.000đ;
- category tương ứng tăng 300.000đ;
- Budget liên quan tăng đúng 300.000đ;
- Dashboard phản ánh đúng;
- Report phản ánh đúng.

## Scenario B — Income

Given ví có 1.000.000đ.

When người dùng ghi Income 500.000đ.

Then wallet có 1.500.000đ và Income kỳ tăng 500.000đ.

## Scenario C — Transfer

Given A = 1.000.000đ, B = 500.000đ.

When chuyển 300.000đ A → B.

Then:

- A = 700.000đ;
- B = 800.000đ;
- tổng tài sản nội bộ vẫn = 1.500.000đ;
- Expense không tăng;
- Income không tăng.

## Scenario D — Edit Expense

Given Expense cũ = 300.000đ.

When sửa thành 450.000đ.

Then ảnh hưởng ròng phải là -150.000đ đối với ví, không phải -450.000đ thêm lần nữa.

## Scenario E — Void Expense

Given Expense hợp lệ = 300.000đ.

When giao dịch bị void.

Then tác động tài chính của giao dịch được loại khỏi balance, budget và report theo cùng một quy tắc trạng thái.

## Scenario F — Date boundary

Given người dùng đang ở timezone địa phương.

When tạo giao dịch sát 00:00.

Then transactionDate phải đúng ngày người dùng chọn; createdAt có thể dùng timestamp hệ thống riêng.

---

# 34. Chuẩn thiết kế trải nghiệm cuối cùng

Finora phải tạo cảm giác:

**Nhanh — rõ — yên tâm — không phiền.**

Người dùng không cần nghĩ về database, repository, ledger, transaction state hay financial engine. Những thứ đó phải được hệ thống xử lý phía sau.

Người dùng chỉ cần:

`Biết tiền → Ghi tiền → Hiểu tiền → Kiểm soát tiền.`

---

# 35. Trạng thái tài liệu

**FINORA CORE SPECIFICATION v2.1** là baseline Source of Truth cho giai đoạn xây dựng Financial Core.

Mọi triển khai tiếp theo phải bám tài liệu này.

Nếu phát sinh nghiệp vụ chưa được định nghĩa, phải dừng ở mức thiết kế / đặc tả để bổ sung quy tắc trước khi đưa logic đó vào Financial Engine.

**Không bắt đầu xây Financial Engine bằng cách suy đoán các business rule còn thiếu.**
