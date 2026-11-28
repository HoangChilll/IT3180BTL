# Từ điển dữ liệu và lược đồ quan hệ

Vũ Trọng Quốc Khánh · 28/11/2026 · WBS 3.2.

Lược đồ và kiểu dữ liệu tương ứng với [schema.sql](schema.sql).
PK = khóa chính; FK = khóa ngoại; UQ = khóa duy nhất. Định nghĩa dưới đây giữ kiểu SQL, NULL/NOT NULL, giá trị mặc định và ghi chú. Cột generated được tính bởi MySQL; biểu thức đầy đủ và CHECK nằm trong SQL gốc.

Tất cả ID là BIGINT UNSIGNED; Java dùng Long trong miền giá trị dương của Long. CCCD là chuỗi để giữ số 0 đầu. Vai trò của users là FK đến roles, không lưu danh sách quyền trong UI làm nguồn quyết định.

## `roles`

Vai trò hệ thống; mã tương ứng UI.

| Cột | Định nghĩa SQL |
| --- | --- |
| `code` | `VARCHAR(32) PRIMARY KEY` |
| `name` | `VARCHAR(100) NOT NULL` |

Khóa và quan hệ:

- PK: `code`.

## `users`

Tài khoản cán bộ, hash mật khẩu và trạng thái khóa.

| Cột | Định nghĩa SQL |
| --- | --- |
| `id` | `BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY` |
| `username` | `VARCHAR(50) COLLATE utf8mb4_0900_as_ci NOT NULL` |
| `password_hash` | `VARCHAR(255) NOT NULL COMMENT 'Hash BCrypt do ứng dụng tạo; không lưu mật khẩu gốc'` |
| `full_name` | `VARCHAR(100) NOT NULL` |
| `role_code` | `VARCHAR(32) NOT NULL` |
| `status` | `ENUM('ACTIVE', 'LOCKED') NOT NULL DEFAULT 'ACTIVE'` |
| `failed_attempts` | `TINYINT UNSIGNED NOT NULL DEFAULT 0` |
| `locked_until` | `DATETIME NULL COMMENT 'Khóa tạm 15 phút, tách khỏi khóa hành chính'` |
| `locked_reason` | `VARCHAR(255) NULL` |
| `email` | `VARCHAR(254) NULL` |
| `phone` | `VARCHAR(20) NULL` |
| `created_at` | `DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP` |
| `last_login_at` | `DATETIME NULL` |

Khóa và quan hệ:

- PK: `id`.
- UQ `uq_users_username`: `(username)`.
- FK `fk_users_role`: `(role_code)` → `roles(code)`.

## `apartments`

Hồ sơ căn hộ, diện tích hiện tại, trạng thái cư trú.

| Cột | Định nghĩa SQL |
| --- | --- |
| `id` | `BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY` |
| `code` | `VARCHAR(20) NOT NULL` |
| `floor` | `SMALLINT UNSIGNED NOT NULL` |
| `area` | `DECIMAL(7,2) NOT NULL` |
| `apartment_type` | `ENUM('1PN', '2PN', '3PN', 'Penthouse') NOT NULL` |
| `status` | `ENUM('OCCUPIED', 'VACANT') NOT NULL DEFAULT 'VACANT'` |
| `notes` | `VARCHAR(500) NULL` |
| `created_at` | `DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP` |

Khóa và quan hệ:

- PK: `id`.
- UQ `uq_apartments_code`: `(code)`.

## `residents`

Nhân khẩu; căn hộ hiện tại hoặc cuối cùng khi chuyển ra ngoài.

| Cột | Định nghĩa SQL |
| --- | --- |
| `id` | `BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY` |
| `apartment_id` | `BIGINT UNSIGNED NOT NULL` |
| `full_name` | `VARCHAR(100) NOT NULL` |
| `cccd` | `CHAR(12) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `dob` | `DATE NOT NULL` |
| `gender` | `ENUM('MALE', 'FEMALE', 'OTHER') NOT NULL` |
| `relationship` | `ENUM('HEAD', 'SPOUSE', 'CHILD', 'PARENT', 'OTHER') NOT NULL` |
| `phone` | `VARCHAR(20) NULL` |
| `occupation` | `VARCHAR(100) NULL` |
| `residency_status` | `ENUM('PERMANENT', 'TEMPORARY', 'ABSENT', 'MOVED_OUT') NOT NULL` |
| `created_at` | `DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP` |

Khóa và quan hệ:

- PK: `id`.
- UQ `uq_residents_cccd`: `(cccd)`.
- FK `fk_residents_apartment`: `(apartment_id)` → `apartments(id)`.

## `representative_history`

Snapshot đại diện và khoảng hiệu lực; không xóa lịch sử.

| Cột | Định nghĩa SQL |
| --- | --- |
| `id` | `BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY` |
| `apartment_id` | `BIGINT UNSIGNED NOT NULL` |
| `resident_name` | `VARCHAR(100) NOT NULL COMMENT 'Snapshot người đại diện, có thể là chủ sở hữu không cư trú'` |
| `cccd` | `CHAR(12) CHARACTER SET ascii COLLATE ascii_bin NOT NULL` |
| `phone` | `VARCHAR(20) NOT NULL` |
| `effective_date` | `DATE NOT NULL` |
| `end_date` | `DATE NULL COMMENT 'Khoảng hiệu lực [effective_date, end_date); NULL = chưa kết thúc'` |
| `note` | `VARCHAR(255) NULL` |
| `updated_by` | `BIGINT UNSIGNED NOT NULL` |
| `active_apartment_id` | `BIGINT UNSIGNED GENERATED ALWAYS AS` |

Khóa và quan hệ:

- PK: `id`.
- UQ `uq_representative_active`: `(active_apartment_id)`.
- FK `fk_representative_apartment`: `(apartment_id)` → `apartments(id)`.
- FK `fk_representative_user`: `(updated_by)` → `users(id)`.

## `residency_events`

Biến động cư trú, lưu căn hộ tại thời điểm phát sinh.

| Cột | Định nghĩa SQL |
| --- | --- |
| `id` | `BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY` |
| `resident_id` | `BIGINT UNSIGNED NOT NULL` |
| `apartment_id` | `BIGINT UNSIGNED NOT NULL COMMENT 'Căn hộ tại thời điểm ghi nhận; giữ nguyên khi cư dân chuyển đi'` |
| `destination_apartment_id` | `BIGINT UNSIGNED NULL COMMENT 'Đích chuyển nội bộ; NULL nếu chuyển ra ngoài'` |
| `event_type` | `ENUM('TEMPORARY', 'ABSENT', 'MOVE') NOT NULL` |
| `from_date` | `DATE NOT NULL` |
| `to_date` | `DATE NULL` |
| `reason` | `VARCHAR(500) NOT NULL` |
| `recorded_by` | `BIGINT UNSIGNED NOT NULL` |
| `created_at` | `DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP` |

Khóa và quan hệ:

- PK: `id`.
- FK `fk_events_resident`: `(resident_id)` → `residents(id)`.
- FK `fk_events_apartment`: `(apartment_id)` → `apartments(id)`.
- FK `fk_events_destination`: `(destination_apartment_id)` → `apartments(id)`.
- FK `fk_events_user`: `(recorded_by)` → `users(id)`.

## `fee_rates`

Phiên bản đơn giá theo ngày hiệu lực và quyết định BQT.

| Cột | Định nghĩa SQL |
| --- | --- |
| `id` | `BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY` |
| `category` | `ENUM('SERVICE', 'MANAGEMENT', 'MOTORBIKE', 'CAR') NOT NULL` |
| `unit_price` | `DECIMAL(15,2) NOT NULL` |
| `effective_date` | `DATE NOT NULL` |
| `decision_no` | `VARCHAR(100) NOT NULL` |
| `note` | `VARCHAR(255) NULL` |
| `updated_by` | `BIGINT UNSIGNED NOT NULL` |
| `updated_at` | `DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP` |

Khóa và quan hệ:

- PK: `id`.
- UQ `uq_fee_rates_effective`: `(category, effective_date)`.
- FK `fk_rates_user`: `(updated_by)` → `users(id)`.

## `fee_invoices`

Công nợ theo căn hộ/kỳ/loại phí và diện tích đã chốt.

| Cột | Định nghĩa SQL |
| --- | --- |
| `id` | `BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY` |
| `apartment_id` | `BIGINT UNSIGNED NOT NULL` |
| `period` | `DATE NOT NULL COMMENT 'Ngày đầu tháng, ví dụ 2026-11-01'` |
| `fee_type` | `ENUM('SERVICE', 'MANAGEMENT', 'PARKING') NOT NULL` |
| `title` | `VARCHAR(255) NOT NULL` |
| `area_snapshot` | `DECIMAL(7,2) NOT NULL` |
| `amount` | `DECIMAL(15,0) NOT NULL COMMENT 'VND, tổng các dòng chi tiết đã làm tròn'` |
| `paid_amount` | `DECIMAL(15,0) NOT NULL DEFAULT 0` |
| `status` | `VARCHAR(7) GENERATED ALWAYS AS` |
| `generated_by` | `BIGINT UNSIGNED NOT NULL` |
| `generated_at` | `DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP` |

Khóa và quan hệ:

- PK: `id`.
- UQ `uq_invoices_period`: `(apartment_id, period, fee_type)`.
- UQ `uq_invoices_apartment`: `(id, apartment_id)`.
- FK `fk_invoices_apartment`: `(apartment_id)` → `apartments(id)`.
- FK `fk_invoices_user`: `(generated_by)` → `users(id)`.

## `fee_invoice_lines`

Dòng tính phí; snapshot đơn giá và số lượng.

| Cột | Định nghĩa SQL |
| --- | --- |
| `id` | `BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY` |
| `invoice_id` | `BIGINT UNSIGNED NOT NULL` |
| `rate_id` | `BIGINT UNSIGNED NOT NULL` |
| `description` | `VARCHAR(255) NOT NULL` |
| `quantity` | `DECIMAL(10,2) NOT NULL` |
| `unit_price` | `DECIMAL(15,2) NOT NULL COMMENT 'Snapshot đơn giá, không sửa theo bảng giá mới'` |
| `unit_label` | `VARCHAR(20) NOT NULL` |
| `amount` | `DECIMAL(15,0) GENERATED ALWAYS AS (ROUND(quantity * unit_price, 0)) STORED` |

Khóa và quan hệ:

- PK: `id`.
- UQ `uq_invoice_lines_rate`: `(invoice_id, rate_id)`.
- FK `fk_lines_invoice`: `(invoice_id)` → `fee_invoices(id)`.
- FK `fk_lines_rate`: `(rate_id)` → `fee_rates(id)`.

## `donation_campaigns`

Đợt vận động; không có định mức công nợ bắt buộc.

| Cột | Định nghĩa SQL |
| --- | --- |
| `id` | `BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY` |
| `name` | `VARCHAR(255) NOT NULL` |
| `purpose` | `VARCHAR(500) NOT NULL` |
| `organizer` | `VARCHAR(255) NOT NULL` |
| `start_date` | `DATE NOT NULL` |
| `end_date` | `DATE NOT NULL` |
| `status` | `ENUM('ACTIVE', 'CLOSED') NOT NULL DEFAULT 'ACTIVE'` |
| `created_by` | `BIGINT UNSIGNED NOT NULL` |
| `created_at` | `DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP` |

Khóa và quan hệ:

- PK: `id`.
- FK `fk_campaigns_user`: `(created_by)` → `users(id)`.

## `vehicles`

Dự phòng v2.0: phương tiện gắn với căn hộ.

| Cột | Định nghĩa SQL |
| --- | --- |
| `id` | `BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY` |
| `apartment_id` | `BIGINT UNSIGNED NOT NULL` |
| `vehicle_type` | `ENUM('MOTORBIKE', 'CAR') NOT NULL` |
| `license_plate` | `VARCHAR(20) NOT NULL` |
| `brand_model` | `VARCHAR(100) NULL` |
| `owner_name` | `VARCHAR(100) NOT NULL` |
| `registered_date` | `DATE NOT NULL` |
| `end_date` | `DATE NULL` |
| `status` | `ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE'` |

Khóa và quan hệ:

- PK: `id`.
- UQ `uq_vehicles_plate`: `(license_plate)`.
- FK `fk_vehicles_apartment`: `(apartment_id)` → `apartments(id)`.

## `utility_bills`

Dự phòng v2.0: công nợ thu hộ nhà cung cấp.

| Cột | Định nghĩa SQL |
| --- | --- |
| `id` | `BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY` |
| `apartment_id` | `BIGINT UNSIGNED NOT NULL` |
| `period` | `DATE NOT NULL` |
| `utility_type` | `ENUM('ELECTRICITY', 'WATER', 'INTERNET') NOT NULL` |
| `provider` | `VARCHAR(100) NOT NULL` |
| `amount` | `DECIMAL(15,0) NOT NULL` |
| `paid_amount` | `DECIMAL(15,0) NOT NULL DEFAULT 0` |
| `status` | `VARCHAR(7) GENERATED ALWAYS AS` |
| `note` | `VARCHAR(255) NULL` |
| `created_at` | `DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP` |

Khóa và quan hệ:

- PK: `id`.
- UQ `uq_utility_period`: `(apartment_id, period, utility_type, provider)`.
- UQ `uq_utility_apartment`: `(id, apartment_id)`.
- FK `fk_utility_apartment`: `(apartment_id)` → `apartments(id)`.

## `receipts`

Chứng từ thu tiền và thông tin người nộp/người lập đã chốt.

| Cột | Định nghĩa SQL |
| --- | --- |
| `id` | `BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY` |
| `receipt_no` | `VARCHAR(40) NOT NULL` |
| `request_key` | `CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'UUID chống gửi lặp yêu cầu thanh toán'` |
| `apartment_id` | `BIGINT UNSIGNED NOT NULL` |
| `apartment_code_snapshot` | `VARCHAR(20) NOT NULL` |
| `payer_name` | `VARCHAR(100) NOT NULL` |
| `payment_method` | `ENUM('CASH', 'BANK_TRANSFER') NOT NULL` |
| `payment_date` | `DATETIME NOT NULL` |
| `total_amount` | `DECIMAL(15,0) NOT NULL` |
| `cashier_id` | `BIGINT UNSIGNED NOT NULL` |
| `cashier_name_snapshot` | `VARCHAR(100) NOT NULL` |
| `note` | `VARCHAR(255) NULL` |
| `allow_public_disclosure` | `BOOLEAN NOT NULL DEFAULT FALSE` |

Khóa và quan hệ:

- PK: `id`.
- UQ `uq_receipts_no`: `(receipt_no)`.
- UQ `uq_receipts_request`: `(request_key)`.
- UQ `uq_receipts_apartment`: `(id, apartment_id)`.
- FK `fk_receipts_apartment`: `(apartment_id)` → `apartments(id)`.
- FK `fk_receipts_cashier`: `(cashier_id)` → `users(id)`.

## `receipt_items`

Khoản tiền phân bổ cho đúng một nguồn thu, cùng căn hộ với phiếu.

| Cột | Định nghĩa SQL |
| --- | --- |
| `id` | `BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY` |
| `receipt_id` | `BIGINT UNSIGNED NOT NULL` |
| `apartment_id` | `BIGINT UNSIGNED NOT NULL COMMENT 'Khóa ghép chống thu nhầm công nợ căn hộ khác'` |
| `source_kind` | `ENUM('INVOICE', 'UTILITY', 'DONATION') NOT NULL` |
| `invoice_id` | `BIGINT UNSIGNED NULL` |
| `utility_bill_id` | `BIGINT UNSIGNED NULL` |
| `campaign_id` | `BIGINT UNSIGNED NULL` |
| `description` | `VARCHAR(255) NOT NULL` |
| `period` | `DATE NULL` |
| `provider` | `VARCHAR(100) NULL` |
| `amount` | `DECIMAL(15,0) NOT NULL` |

Khóa và quan hệ:

- PK: `id`.
- UQ `uq_items_invoice`: `(receipt_id, invoice_id)`.
- UQ `uq_items_utility`: `(receipt_id, utility_bill_id)`.
- UQ `uq_items_campaign`: `(receipt_id, campaign_id)`.
- FK `fk_items_receipt`: `(receipt_id, apartment_id)` → `receipts(id, apartment_id)`.
- FK `fk_items_invoice`: `(invoice_id, apartment_id)` → `fee_invoices(id, apartment_id)`.
- FK `fk_items_utility`: `(utility_bill_id, apartment_id)` → `utility_bills(id, apartment_id)`.
- FK `fk_items_campaign`: `(campaign_id)` → `donation_campaigns(id)`.
