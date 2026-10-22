# Finora - CHAT HANDOFF

> Tai lieu ban giao cong viec giua cac cuoc tro chuyen ChatGPT.
> Cap nhat tai lieu nay sau moi cot moc quan trong. Khong xem cac thong tin lich su la trang thai Git hien tai neu chua xac minh.

## 1. Thong tin du an

- Ten: Finora
- Thu muc lam viec: `D:\Projects\Finoras\Finora`
- GitHub: `congthanh1389/Finora`
- Cong nghe chinh: Expo, React Native, TypeScript, Expo Router.
- Dinh huong: ung dung tai chinh local-first; can bao toan du lieu tai chinh va luong xu ly dang hoat dong.
- Script kiem tra TypeScript: `npm run check`
- Script test: `npm run test`
- Script lint: `npm run lint`
- Lenh chay Android cua du an: `npm run android`

## 2. Trang thai Git - BAT BUOC XAC MINH

Thong tin lich su tu cuoc tro chuyen gan nhat:
- Nhanh duoc ghi nhan: `feat/appearance-brightness-slider`
- Commit duoc ghi nhan: `759bc12` - `style: match wallet heading to account list`

CAN KIEM TRA LAI tren may truoc khi sua:
- Nhanh hien tai: chua xac minh.
- HEAD hien tai: chua xac minh.
- Working tree: chua xac minh.
- Tracking branch va tinh trang dong bo GitHub: chua xac minh.

Khong tu dong checkout, reset, clean, rebase, cherry-pick, restore ZIP hoac ghi de file.
Khong commit/push khi chua kiem tra diff va chua xac nhan cac thay doi.

## 3. Cong viec giao dien gan nhat

Chu de gan nhat: man hinh "Vi cua toi", trong pham vi giao dien tai chinh.

Cac yeu cau da duoc neu:
- Tieu de "Vi cua toi" can de doc, co kich thuoc phu hop va mau xanh ngoc dam.
- Dong "Tong so du: [so tien]" phai hien thi nhan va so tien tren cung mot dong khi du khong gian.
- Tang kich thuoc chu de de doc ro hon.
- So tien dung mau do hong noi bat theo yeu cau da neu.
- Khong dung chu mau trang cho dong tong so du.
- Tranh khung trang thua bao quanh noi dung.
- Giao dien cac man hinh tai chinh can dong bo voi phong cach Finora xanh tuoi/xanh mint, the trang va goc bo tron.

Khong tu suy dien rang tat ca yeu cau tren da duoc hien thuc hoa dung. Hay xem file va chay ung dung de xac minh truoc khi sua tiep.

## 4. Nguyen tac an toan bat buoc

1. Bao toan thay doi chua commit cua nguoi dung.
2. Kiem tra `git status`, `git branch --show-current`, `git log -1 --oneline` va diff truoc khi sua.
3. Khong tu y thay doi logic xoa tai khoan hoac xoa du lieu tai chinh.
4. Chuc nang dang ky bang email OTP va xoa tai khoan da duoc nguoi dung bao cao hoat dong binh thuong sau khi kiem tra. Khong thay doi cac luong nay neu khong co yeu cau ro rang.
5. Khong go cai dat ung dung, xoa du lieu tren thiet bi, tao tai khoan moi hoac reset du lieu de thu loi neu chua duoc nguoi dung cho phep.
6. Chi sua cac file can thiet cho yeu cau cu the. Tranh refactor ngoai pham vi.
7. Sau khi sua, kiem tra diff, `git diff --check`, TypeScript va cac test phu hop.
8. Chi commit/push khi thay doi da duoc xac minh va nguoi dung dong y.
9. Neu thong tin trong file nay khac voi ma nguon/Git thuc te, uu tien trang thai thuc te va cap nhat tai lieu.
10. Neu chua ro file nao hoac hanh vi nao la nguon chinh, dung lai va kiem tra; khong doan roi ghi de.

## 5. Quy uoc PowerShell

Moi khoi lenh PowerShell danh cho Finora phai bat dau bang:

`Set-Location "D:\Projects\Finoras\Finora"`

Uu tien cung cap cac khoi lenh co the sao chep va chay mot lan.
Sau khi hoan thanh thay doi giao dien, neu can kiem tra tren Android, cung cap mot khoi lenh chay Android rieng.

## 6. Quy trinh bat dau trong chat moi

1. Doc file `docs/CHAT_HANDOFF.md`.
2. Kiem tra nhanh:
   - `git status --short --branch`
   - `git branch --show-current`
   - `git log -1 --oneline`
   - `git status -sb`
3. Neu co thay doi chua commit, bao ton va xem diff truoc khi sua.
4. Xac dinh yeu cau gan nhat cua nguoi dung va cac file lien quan.
5. Neu can, chay `npm run check` va test phu hop truoc khi sua.
6. Sua dung pham vi, kiem tra lai va cap nhat phan 7 ben duoi.

## 7. NHAT KY BAN GIAO GAN NHAT

- Ngay tao tai lieu: 2026-10-22.
- Muc tieu: duy tri mach cong viec khi chuyen sang chat ChatGPT moi.
- Cong viec giao dien gan nhat duoc ghi nhan: man hinh "Vi cua toi".
- Trang thai ma nguon hien tai: can xac minh tu Git tren may nguoi dung.
- Loi dang mo / ket qua test moi nhat: chua duoc xac minh trong lan ban giao nay.
- Buoc tiep theo: xac minh Git va mo file man hinh "Vi cua toi" de doi chieu voi yeu cau gan nhat truoc khi sua tiep.

## 8. Mau cap nhat sau moi cong viec

Khi hoan thanh mot yeu cau, cap nhat:
- Ngay gio:
- Yeu cau:
- Cac file da thay doi:
- Tom tat thay doi:
- Ket qua `npm run check`:
- Ket qua test / chay Android:
- Git branch va commit:
- Da commit/push hay chua:
- Van de con ton tai:
- Buoc tiep theo:

Khong ghi "da kiem tra thanh cong" neu chua co ket qua thuc te.
## TRANG THAI GIT MOI NHAT - 2026-10-22 22:49:11
- Nhanh hien tai: feat/financial-settings-abc
- Commit HEAD: c5c1574 test: cover budget alert preferences
- Cac thay doi Git tai thoi diem ghi nhan:  M app/(tabs)/reports.tsx;  M app/(tabs)/settings.tsx;  M app/financial-settings.tsx;  M lib/_core/auth.ts; ?? app/change-password.tsx; ?? docs/CHAT_HANDOFF.md; ?? finora-change-password-log.txt
- Cong viec can tiep tuc xac minh: cac file Bao cao, Cai dat, Cai dat tai chinh, xac thuc va doi mat khau.
- Bao toan moi thay doi chua commit. Khong tu y reset, clean, chuyen nhanh, ghi de, commit hoac push.
- Khong thay doi logic xoa tai khoan va du lieu tai chinh neu chua duoc yeu cau.
- Chat moi phai kiem tra lai Git va doc tai lieu nay truoc khi sua ma nguon.
