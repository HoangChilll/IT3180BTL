SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE TABLE roles (
    code VARCHAR(32) PRIMARY KEY,
    name VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) COLLATE utf8mb4_0900_as_ci NOT NULL,
    password_hash VARCHAR(255) NOT NULL COMMENT 'Hash BCrypt do ứng dụng tạo; không lưu mật khẩu gốc',
    full_name VARCHAR(100) NOT NULL,
    role_code VARCHAR(32) NOT NULL,
    status ENUM('ACTIVE', 'LOCKED') NOT NULL DEFAULT 'ACTIVE',
    failed_attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
    locked_until DATETIME NULL COMMENT 'Khóa tạm 15 phút, tách khỏi khóa hành chính',
    locked_reason VARCHAR(255) NULL,
    email VARCHAR(254) NULL,
    phone VARCHAR(20) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_at DATETIME NULL,
    UNIQUE KEY uq_users_username (username),
    CONSTRAINT fk_users_role FOREIGN KEY (role_code) REFERENCES roles(code),
    CONSTRAINT ck_users_username CHECK (CHAR_LENGTH(TRIM(username)) >= 3),
    CONSTRAINT ck_users_attempts CHECK (failed_attempts <= 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE apartments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL,
    floor SMALLINT UNSIGNED NOT NULL,
    area DECIMAL(7,2) NOT NULL,
    apartment_type ENUM('1PN', '2PN', '3PN', 'Penthouse') NOT NULL,
    status ENUM('OCCUPIED', 'VACANT') NOT NULL DEFAULT 'VACANT',
    notes VARCHAR(500) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_apartments_code (code),
    KEY ix_apartments_floor_type (floor, apartment_type),
    CONSTRAINT ck_apartments_code CHECK (CHAR_LENGTH(TRIM(code)) > 0),
    CONSTRAINT ck_apartments_area CHECK (area BETWEEN 30 AND 250),
    CONSTRAINT ck_apartments_floor CHECK (floor BETWEEN 1 AND 30)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE residents (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    apartment_id BIGINT UNSIGNED NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    cccd CHAR(12) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    dob DATE NOT NULL,
    gender ENUM('MALE', 'FEMALE', 'OTHER') NOT NULL,
    relationship ENUM('HEAD', 'SPOUSE', 'CHILD', 'PARENT', 'OTHER') NOT NULL,
    phone VARCHAR(20) NULL,
    occupation VARCHAR(100) NULL,
    residency_status ENUM('PERMANENT', 'TEMPORARY', 'ABSENT', 'MOVED_OUT') NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_residents_cccd (cccd),
    CONSTRAINT fk_residents_apartment FOREIGN KEY (apartment_id) REFERENCES apartments(id),
    CONSTRAINT ck_residents_cccd CHECK (REGEXP_LIKE(cccd, '^[0-9]{12}$')),
    CONSTRAINT ck_residents_name CHECK (CHAR_LENGTH(TRIM(full_name)) > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE representative_history (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    apartment_id BIGINT UNSIGNED NOT NULL,
    resident_name VARCHAR(100) NOT NULL COMMENT 'Snapshot người đại diện, có thể là chủ sở hữu không cư trú',
    cccd CHAR(12) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    phone VARCHAR(20) NOT NULL,
    effective_date DATE NOT NULL,
    end_date DATE NULL COMMENT 'Khoảng hiệu lực [effective_date, end_date); NULL = chưa kết thúc',
    note VARCHAR(255) NULL,
    updated_by BIGINT UNSIGNED NOT NULL,
    active_apartment_id BIGINT UNSIGNED GENERATED ALWAYS AS
        (CASE WHEN end_date IS NULL THEN apartment_id ELSE NULL END) STORED,
    UNIQUE KEY uq_representative_active (active_apartment_id),
    KEY ix_representative_history (apartment_id, effective_date),
    CONSTRAINT fk_representative_apartment FOREIGN KEY (apartment_id) REFERENCES apartments(id),
    CONSTRAINT fk_representative_user FOREIGN KEY (updated_by) REFERENCES users(id),
    CONSTRAINT ck_representative_cccd CHECK (REGEXP_LIKE(cccd, '^[0-9]{12}$')),
    CONSTRAINT ck_representative_dates CHECK (end_date IS NULL OR end_date > effective_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE residency_events (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    resident_id BIGINT UNSIGNED NOT NULL,
    apartment_id BIGINT UNSIGNED NOT NULL COMMENT 'Căn hộ tại thời điểm ghi nhận; giữ nguyên khi cư dân chuyển đi',
    destination_apartment_id BIGINT UNSIGNED NULL COMMENT 'Đích chuyển nội bộ; NULL nếu chuyển ra ngoài',
    event_type ENUM('TEMPORARY', 'ABSENT', 'MOVE') NOT NULL,
    from_date DATE NOT NULL,
    to_date DATE NULL,
    reason VARCHAR(500) NOT NULL,
    recorded_by BIGINT UNSIGNED NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY ix_events_resident_date (resident_id, from_date),
    KEY ix_events_type_date (event_type, from_date),
    CONSTRAINT fk_events_resident FOREIGN KEY (resident_id) REFERENCES residents(id),
    CONSTRAINT fk_events_apartment FOREIGN KEY (apartment_id) REFERENCES apartments(id),
    CONSTRAINT fk_events_destination FOREIGN KEY (destination_apartment_id) REFERENCES apartments(id),
    CONSTRAINT fk_events_user FOREIGN KEY (recorded_by) REFERENCES users(id),
    CONSTRAINT ck_events_dates CHECK (to_date IS NULL OR to_date >= from_date),
    CONSTRAINT ck_events_destination CHECK
        (destination_apartment_id IS NULL OR (event_type = 'MOVE' AND destination_apartment_id <> apartment_id))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE fee_rates (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category ENUM('SERVICE', 'MANAGEMENT', 'MOTORBIKE', 'CAR') NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    effective_date DATE NOT NULL,
    decision_no VARCHAR(100) NOT NULL,
    note VARCHAR(255) NULL,
    updated_by BIGINT UNSIGNED NOT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_fee_rates_effective (category, effective_date),
    CONSTRAINT fk_rates_user FOREIGN KEY (updated_by) REFERENCES users(id),
    CONSTRAINT ck_rates_price CHECK (
        (category = 'SERVICE' AND unit_price BETWEEN 2500 AND 16500)
        OR (category = 'MANAGEMENT' AND unit_price >= 7000)
        OR (category IN ('MOTORBIKE', 'CAR') AND unit_price > 0)
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE fee_invoices (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    apartment_id BIGINT UNSIGNED NOT NULL,
    period DATE NOT NULL COMMENT 'Ngày đầu tháng, ví dụ 2026-11-01',
    fee_type ENUM('SERVICE', 'MANAGEMENT', 'PARKING') NOT NULL,
    title VARCHAR(255) NOT NULL,
    area_snapshot DECIMAL(7,2) NOT NULL,
    amount DECIMAL(15,0) NOT NULL COMMENT 'VND, tổng các dòng chi tiết đã làm tròn',
    paid_amount DECIMAL(15,0) NOT NULL DEFAULT 0,
    status VARCHAR(7) GENERATED ALWAYS AS
        (CASE WHEN paid_amount = 0 THEN 'UNPAID' WHEN paid_amount < amount THEN 'PARTIAL' ELSE 'PAID' END) STORED,
    generated_by BIGINT UNSIGNED NOT NULL,
    generated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_invoices_period (apartment_id, period, fee_type),
    UNIQUE KEY uq_invoices_apartment (id, apartment_id),
    KEY ix_invoices_period_status (period, status),
    CONSTRAINT fk_invoices_apartment FOREIGN KEY (apartment_id) REFERENCES apartments(id),
    CONSTRAINT fk_invoices_user FOREIGN KEY (generated_by) REFERENCES users(id),
    CONSTRAINT ck_invoices_period CHECK (DAYOFMONTH(period) = 1),
    CONSTRAINT ck_invoices_area CHECK (area_snapshot BETWEEN 30 AND 250),
    CONSTRAINT ck_invoices_amount CHECK (amount > 0),
    CONSTRAINT ck_invoices_paid CHECK (paid_amount BETWEEN 0 AND amount)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE fee_invoice_lines (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    invoice_id BIGINT UNSIGNED NOT NULL,
    rate_id BIGINT UNSIGNED NOT NULL,
    description VARCHAR(255) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL COMMENT 'Snapshot đơn giá, không sửa theo bảng giá mới',
    unit_label VARCHAR(20) NOT NULL,
    amount DECIMAL(15,0) GENERATED ALWAYS AS (ROUND(quantity * unit_price, 0)) STORED,
    UNIQUE KEY uq_invoice_lines_rate (invoice_id, rate_id),
    CONSTRAINT fk_lines_invoice FOREIGN KEY (invoice_id) REFERENCES fee_invoices(id),
    CONSTRAINT fk_lines_rate FOREIGN KEY (rate_id) REFERENCES fee_rates(id),
    CONSTRAINT ck_lines_quantity CHECK (quantity > 0),
    CONSTRAINT ck_lines_price CHECK (unit_price > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE donation_campaigns (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    purpose VARCHAR(500) NOT NULL,
    organizer VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('ACTIVE', 'CLOSED') NOT NULL DEFAULT 'ACTIVE',
    created_by BIGINT UNSIGNED NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_campaigns_user FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT ck_campaigns_dates CHECK (end_date >= start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE vehicles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    apartment_id BIGINT UNSIGNED NOT NULL,
    vehicle_type ENUM('MOTORBIKE', 'CAR') NOT NULL,
    license_plate VARCHAR(20) NOT NULL,
    brand_model VARCHAR(100) NULL,
    owner_name VARCHAR(100) NOT NULL,
    registered_date DATE NOT NULL,
    end_date DATE NULL,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    UNIQUE KEY uq_vehicles_plate (license_plate),
    CONSTRAINT fk_vehicles_apartment FOREIGN KEY (apartment_id) REFERENCES apartments(id),
    CONSTRAINT ck_vehicles_dates CHECK (end_date IS NULL OR end_date >= registered_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE utility_bills (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    apartment_id BIGINT UNSIGNED NOT NULL,
    period DATE NOT NULL,
    utility_type ENUM('ELECTRICITY', 'WATER', 'INTERNET') NOT NULL,
    provider VARCHAR(100) NOT NULL,
    amount DECIMAL(15,0) NOT NULL,
    paid_amount DECIMAL(15,0) NOT NULL DEFAULT 0,
    status VARCHAR(7) GENERATED ALWAYS AS
        (CASE WHEN paid_amount = 0 THEN 'UNPAID' WHEN paid_amount < amount THEN 'PARTIAL' ELSE 'PAID' END) STORED,
    note VARCHAR(255) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_utility_period (apartment_id, period, utility_type, provider),
    UNIQUE KEY uq_utility_apartment (id, apartment_id),
    CONSTRAINT fk_utility_apartment FOREIGN KEY (apartment_id) REFERENCES apartments(id),
    CONSTRAINT ck_utility_period CHECK (DAYOFMONTH(period) = 1),
    CONSTRAINT ck_utility_amount CHECK (amount > 0),
    CONSTRAINT ck_utility_paid CHECK (paid_amount BETWEEN 0 AND amount)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE receipts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    receipt_no VARCHAR(40) NOT NULL,
    request_key CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'UUID chống gửi lặp yêu cầu thanh toán',
    apartment_id BIGINT UNSIGNED NOT NULL,
    apartment_code_snapshot VARCHAR(20) NOT NULL,
    payer_name VARCHAR(100) NOT NULL,
    payment_method ENUM('CASH', 'BANK_TRANSFER') NOT NULL,
    payment_date DATETIME NOT NULL,
    total_amount DECIMAL(15,0) NOT NULL,
    cashier_id BIGINT UNSIGNED NOT NULL,
    cashier_name_snapshot VARCHAR(100) NOT NULL,
    note VARCHAR(255) NULL,
    allow_public_disclosure BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE KEY uq_receipts_no (receipt_no),
    UNIQUE KEY uq_receipts_request (request_key),
    UNIQUE KEY uq_receipts_apartment (id, apartment_id),
    KEY ix_receipts_apartment_date (apartment_id, payment_date),
    KEY ix_receipts_date (payment_date),
    CONSTRAINT fk_receipts_apartment FOREIGN KEY (apartment_id) REFERENCES apartments(id),
    CONSTRAINT fk_receipts_cashier FOREIGN KEY (cashier_id) REFERENCES users(id),
    CONSTRAINT ck_receipts_amount CHECK (total_amount > 0),
    CONSTRAINT ck_receipts_disclosure CHECK (allow_public_disclosure IN (0, 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE receipt_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    receipt_id BIGINT UNSIGNED NOT NULL,
    apartment_id BIGINT UNSIGNED NOT NULL COMMENT 'Khóa ghép chống thu nhầm công nợ căn hộ khác',
    source_kind ENUM('INVOICE', 'UTILITY', 'DONATION') NOT NULL,
    invoice_id BIGINT UNSIGNED NULL,
    utility_bill_id BIGINT UNSIGNED NULL,
    campaign_id BIGINT UNSIGNED NULL,
    description VARCHAR(255) NOT NULL,
    period DATE NULL,
    provider VARCHAR(100) NULL,
    amount DECIMAL(15,0) NOT NULL,
    UNIQUE KEY uq_items_invoice (receipt_id, invoice_id),
    UNIQUE KEY uq_items_utility (receipt_id, utility_bill_id),
    UNIQUE KEY uq_items_campaign (receipt_id, campaign_id),
    CONSTRAINT fk_items_receipt FOREIGN KEY (receipt_id, apartment_id) REFERENCES receipts(id, apartment_id),
    CONSTRAINT fk_items_invoice FOREIGN KEY (invoice_id, apartment_id) REFERENCES fee_invoices(id, apartment_id),
    CONSTRAINT fk_items_utility FOREIGN KEY (utility_bill_id, apartment_id) REFERENCES utility_bills(id, apartment_id),
    CONSTRAINT fk_items_campaign FOREIGN KEY (campaign_id) REFERENCES donation_campaigns(id),
    CONSTRAINT ck_items_amount CHECK (amount > 0),
    CONSTRAINT ck_items_period CHECK (period IS NULL OR DAYOFMONTH(period) = 1),
    CONSTRAINT ck_items_source CHECK (
        (source_kind = 'INVOICE' AND invoice_id IS NOT NULL AND utility_bill_id IS NULL AND campaign_id IS NULL)
        OR (source_kind = 'UTILITY' AND invoice_id IS NULL AND utility_bill_id IS NOT NULL AND campaign_id IS NULL)
        OR (source_kind = 'DONATION' AND invoice_id IS NULL AND utility_bill_id IS NULL AND campaign_id IS NOT NULL)
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
