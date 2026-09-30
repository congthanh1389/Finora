# Contributing to Finora

## Branches

```text
main
feature/<ten-chuc-nang>
fix/<ten-loi>
```

Không commit trực tiếp chức năng lớn vào `main`. Mỗi thay đổi cần giữ hướng phụ thuộc của Finora và tránh dependency vòng giữa các module.

## Pull Request checklist

- [ ] Nêu mục tiêu và phạm vi thay đổi.
- [ ] Nêu module bị ảnh hưởng.
- [ ] Nêu thay đổi schema/migration nếu có.
- [ ] Nêu thay đổi public interface nếu có.
- [ ] Có test cho business rules bị ảnh hưởng.
- [ ] `pnpm check` đạt.
- [ ] `pnpm lint` đạt.
- [ ] `pnpm test` đạt.
- [ ] `pnpm build` đạt.
- [ ] Không có secret hoặc thông tin nhạy cảm.
- [ ] Cập nhật tài liệu kiến trúc nếu thay đổi lớn.

## Quy tắc module

Module không truy cập trực tiếp database của module khác. Khi phối hợp nghiệp vụ, sử dụng service hoặc public interface. Transaction cập nhật số dư thông qua Wallet service/interface, không truy cập Wallet database.
