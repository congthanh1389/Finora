# Finora — Design brief

## 1. Các hướng stylistic đã cân nhắc

- **Quiet Ledger** — giao diện tài chính điềm tĩnh, nền sáng, xanh ngọc làm màu hành động, ưu tiên độ rõ của con số. Xác suất chọn: **0.08**.
- **Midnight Flow** — nền xanh đêm, các lớp thẻ tương phản và màu xanh lá cho dòng tiền dương. Xác suất chọn: **0.06**.
- **Warm Household** — trung tính ấm, các màu thu/chi được tiết chế để phù hợp tài chính cá nhân và gia đình. Xác suất chọn: **0.05**.

## 2. Hướng được chọn

**Quiet Ledger** là hướng chính của Finora.

Finora cần tạo cảm giác chính xác, bình tĩnh và đáng tin cậy; giao diện không được biến quản lý tài chính thành trải nghiệm quá sặc sỡ hoặc mang tính trò chơi. Con số, trạng thái ngân sách và thay đổi số dư phải là trung tâm thị giác.

## 3. Nguyên tắc thiết kế

- Ưu tiên khả năng đọc số tiền, ngày tháng, số dư và trạng thái ngân sách.
- Một màn hình tập trung vào một quyết định chính.
- Dùng màu có ý nghĩa: xanh ngọc cho hành động chính và tín hiệu tích cực; đỏ/cam chỉ dùng cho cảnh báo hoặc chi tiêu cần chú ý.
- Card và khoảng trắng tạo cấu trúc, không dùng trang trí làm nhiễu thông tin.
- Điều hướng và vùng chạm phù hợp màn hình dọc, thao tác một tay.
- Trạng thái loading, empty và error phải rõ ràng.
- Không dùng giao diện desktop thu nhỏ cho mobile.

## 4. Hệ màu và typography

- Nền chính: trắng ngà/xám rất nhạt.
- Bề mặt: trắng, đường viền xám xanh nhạt.
- Chữ chính: xanh đêm gần đen.
- Màu thương hiệu: xanh ngọc đậm, dùng cho CTA và điểm nhấn.
- Thu nhập: xanh lá dịu.
- Chi tiêu/cảnh báo: đỏ đất hoặc cam dịu, chỉ dùng khi có ngữ nghĩa.
- Chữ số tiền lớn dùng weight cao; metadata dùng weight thường và kích thước nhỏ hơn.
- Giữ typography nhất quán với theme tokens của starter, không tạo hệ font riêng trong Foundation.

## 5. Màn hình và nội dung chính

- **Dashboard:** số dư tổng quan, thu/chi kỳ hiện tại, giao dịch gần đây, trạng thái ngân sách.
- **Transactions:** danh sách giao dịch theo ngày, filter/tìm kiếm, nút thêm giao dịch.
- **Wallets:** danh sách ví/tài khoản, số dư từng ví, mở chi tiết ví.
- **Categories:** nhóm danh mục thu/chi và khả năng tùy chỉnh.
- **Budgets:** ngân sách theo tháng/danh mục, kế hoạch so với thực tế.
- **Reports:** tổng hợp thu/chi, dòng tiền, phân bổ theo danh mục và biểu đồ.
- **More/Settings:** các thiết lập dùng chung; không đưa module mở rộng vào MVP khi chưa triển khai.

## 6. Luồng thao tác chính

### Thêm giao dịch

1. Từ Dashboard hoặc Transactions, chạm nút thêm.
2. Chọn loại: thu nhập, chi tiêu hoặc chuyển tiền.
3. Nhập số tiền.
4. Chọn ví/tài khoản.
5. Chọn danh mục nếu nghiệp vụ yêu cầu.
6. Chọn ngày và nhập ghi chú tùy chọn.
7. Xác nhận; chỉ hiển thị thành công sau khi Service/Repository xử lý xong.
8. Quay về danh sách và hiển thị số dư đã cập nhật.

### Xem ví

1. Mở Wallets.
2. Chạm một ví.
3. Xem số dư và các giao dịch liên quan.
4. Dùng thao tác chỉnh sửa theo nghiệp vụ đã được chốt.

### Kiểm tra ngân sách

1. Mở Budgets.
2. Chọn tháng hoặc danh mục.
3. Xem kế hoạch, thực tế và phần còn lại/vượt.
4. Truy cập dữ liệu chi tiết qua module contract, không truy cập database trực tiếp.

## 7. Chuyển động và giọng thương hiệu

- Animation ngắn, kín đáo, chỉ hỗ trợ chuyển trạng thái hoặc xác nhận thao tác.
- Không dùng hiệu ứng gây phân tán khi số dư hoặc giao dịch thay đổi.
- Giọng chữ: rõ ràng, trung tính, khuyến khích người dùng kiểm soát tài chính; không phán xét việc chi tiêu.
- Logo/icon dùng biểu tượng hình học đơn giản, không phụ thuộc vào wordmark nhỏ khó đọc ở kích thước launcher.
