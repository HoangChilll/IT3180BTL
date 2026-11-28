# Cơ sở dữ liệu và UML — BlueMoon

**Vũ Trọng Quốc Khánh — Nhóm 27, IT3180 — 28/11/2026**

Thư mục này gồm thiết kế cơ sở dữ liệu và các sơ đồ của BlueMoon. Nội dung dựa trên SRS, User Story và giao diện hiện có của nhóm. Phần kết nối JDBC và đăng nhập phía backend sẽ được triển khai theo thiết kế này.

## Cơ sở dữ liệu

| File | Nội dung |
| --- | --- |
| [schema.sql](schema.sql) | Tạo 14 bảng MySQL, khóa chính/ngoại, ràng buộc và chỉ mục |
| [seed.sql](seed.sql) | Dữ liệu mẫu về căn hộ, cư dân, hóa đơn và phiếu thu |
| [DATA_DICTIONARY.md](DATA_DICTIONARY.md) | Lược đồ quan hệ, kiểu dữ liệu và ý nghĩa các bảng |

Dùng **MySQL 8.0.16 trở lên** với InnoDB và strict SQL mode. Từ thư mục gốc dự án, mở MySQL bằng lệnh `mysql -u root -p --default-character-set=utf8mb4`, sau đó chạy:

```sql
CREATE DATABASE bluemoon_design CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE bluemoon_design;
SOURCE docs/schema.sql;
SOURCE docs/seed.sql;
```

Nạp `schema.sql` vào một cơ sở dữ liệu mới. Nếu cần dữ liệu để chạy thử, nạp thêm `seed.sql`. Các tài khoản mẫu đều bị khóa; cần đặt mật khẩu qua ứng dụng trước khi sử dụng.

Một số lưu ý khi viết phần xử lý:

- Dùng `BigDecimal` cho tiền và diện tích; làm tròn từng dòng phí về đồng trước khi cộng tổng. `period` là ngày đầu tháng; `DATETIME` lưu UTC, hiển thị theo giờ Việt Nam.
- Lưu diện tích, đơn giá và thông tin phiếu thu tại thời điểm lập chứng từ. Đơn giá được thêm phiên bản mới; không sửa đè lịch sử.
- Người đại diện có khoảng hiệu lực `[effective_date, end_date)`. UNIQUE chỉ cho một bản ghi chưa kết thúc; Service vẫn phải kiểm tra chồng lấn lịch sử khi thay đại diện.
- Thu tiền cần `SELECT ... FOR UPDATE`, lưu phiếu/chi tiết/cập nhật công nợ trong cùng transaction. `request_key` chống gửi lặp; mã phiếu dựa trên ID tự tăng, không dùng `COUNT(*) + 1`.
- Tầng Service cần kiểm tra tổng phiếu, tổng các dòng hóa đơn và `paid_amount` trước khi hoàn tất giao dịch. In lại sử dụng phiếu đã lưu.
- `vehicles`, `utility_bills` và phí gửi xe dành cho phần mở rộng v2.0. Sơ đồ thu phí và báo cáo mô tả luồng xử lý để nhóm triển khai sau.

## Sơ đồ

Các sơ đồ được lưu dưới dạng ảnh **SVG**, có thể mở trực tiếp trên GitHub hoặc phóng to để xem chi tiết.

| Sơ đồ | Ảnh |
| --- | --- |
| Kiến trúc phân tầng | [SVG](01-kien-truc.svg) |
| Phân rã chức năng (FDD) | [SVG](02-fdd.svg) |
| Use case tổng quan | [SVG](03-use-case-tong-quan.svg) |
| Use case dân cư | [SVG](04-use-case-dan-cu.svg) |
| Use case tài chính | [SVG](05-use-case-tai-chinh.svg) |
| Lớp miền dân cư | [SVG](06-class-dan-cu.svg) |
| Lớp miền tài chính | [SVG](07-class-tai-chinh.svg) |
| Lớp Controller/Service/Repository | [SVG](08-class-service.svg) |
| Sequence đăng nhập | [SVG](09-sequence-dang-nhap.svg) |
| Sequence thêm nhân khẩu | [SVG](10-sequence-nhan-khau.svg) |
| Sequence lập bảng kê | [SVG](11-sequence-lap-bang-ke.svg) |
| Sequence thu phí | [SVG](12-sequence-thu-phi.svg) |
| Sequence báo cáo | [SVG](13-sequence-bao-cao.svg) |
| Sequence đổi đại diện | [SVG](14-sequence-doi-dai-dien.svg) |
| ERD tài khoản và dân cư | [SVG](15-erd-dan-cu.svg) |
| ERD tài chính | [SVG](16-erd-tai-chinh.svg) |

## Lưu ý về yêu cầu

SRS ghi giao diện Java Desktop, còn mã nguồn hiện dùng React và Spring Boot. Nhóm cần thống nhất lại phần này khi nối giao diện với backend.

Thiết kế đang cho kế toán cấu hình giá theo US-08 và hỗ trợ nộp phí một phần theo US-12. Hai điểm này khác với SRS §4.1 và UC004, nên cần chốt trước khi viết phần xử lý. Tài khoản sai mật khẩu 5 lần sẽ bị khóa tạm 15 phút; việc công khai tên người đóng góp cần có sự đồng ý.
