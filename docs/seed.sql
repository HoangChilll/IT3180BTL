SET NAMES utf8mb4;
SET time_zone = '+00:00';
START TRANSACTION;

INSERT INTO roles (code, name) VALUES
('ADMIN', 'Trưởng Ban quản trị'), ('ACCOUNTANT', 'Kế toán'),
('CASHIER', 'Thủ quỹ'), ('RESIDENT_OFFICER', 'Cán bộ dân cư');

INSERT INTO users (id, username, password_hash, full_name, role_code, status, locked_reason, created_at) VALUES
(1, 'demo.admin', '!DISABLED_DEMO_ACCOUNT!', 'Quản trị mẫu', 'ADMIN', 'LOCKED', 'Tài khoản dữ liệu mẫu, không dùng đăng nhập', '2026-11-01'),
(2, 'demo.accountant', '!DISABLED_DEMO_ACCOUNT!', 'Kế toán mẫu', 'ACCOUNTANT', 'LOCKED', 'Tài khoản dữ liệu mẫu, không dùng đăng nhập', '2026-11-01'),
(3, 'demo.cashier', '!DISABLED_DEMO_ACCOUNT!', 'Thủ quỹ mẫu', 'CASHIER', 'LOCKED', 'Tài khoản dữ liệu mẫu, không dùng đăng nhập', '2026-11-01'),
(4, 'demo.resident', '!DISABLED_DEMO_ACCOUNT!', 'Cán bộ dân cư mẫu', 'RESIDENT_OFFICER', 'LOCKED', 'Tài khoản dữ liệu mẫu, không dùng đăng nhập', '2026-11-01');

INSERT INTO apartments (id, code, floor, area, apartment_type, status, created_at) VALUES
(1, 'P501', 5, 75.50, '2PN', 'OCCUPIED', '2026-11-01'),
(2, 'P502', 5, 90.00, '3PN', 'OCCUPIED', '2026-11-01'),
(3, 'P601', 6, 60.00, '1PN', 'VACANT', '2026-11-01');

INSERT INTO residents (id, apartment_id, full_name, cccd, dob, gender, relationship, residency_status, created_at) VALUES
(1, 1, 'Cư dân mẫu A', '000000000001', '1990-01-01', 'MALE', 'HEAD', 'PERMANENT', '2026-11-01'),
(2, 1, 'Cư dân mẫu B', '000000000002', '1992-02-02', 'FEMALE', 'SPOUSE', 'ABSENT', '2026-11-01'),
(3, 2, 'Cư dân mẫu C', '000000000003', '1988-03-03', 'OTHER', 'HEAD', 'PERMANENT', '2026-11-01');

INSERT INTO representative_history
(apartment_id, resident_name, cccd, phone, effective_date, end_date, updated_by) VALUES
(1, 'Đại diện mẫu trước', '000000000004', '0000000000', '2026-10-01', '2026-11-01', 4),
(1, 'Cư dân mẫu A', '000000000001', '0000000001', '2026-11-01', NULL, 4),
(2, 'Cư dân mẫu C', '000000000003', '0000000003', '2026-11-01', NULL, 4);

INSERT INTO residency_events (resident_id, apartment_id, event_type, from_date, to_date, reason, recorded_by, created_at)
VALUES (2, 1, 'ABSENT', '2026-11-20', '2026-11-28', 'Khai báo tạm vắng mẫu', 4, '2026-11-20');

INSERT INTO fee_rates (id, category, unit_price, effective_date, decision_no, updated_by, updated_at) VALUES
(1, 'SERVICE', 10000, '2026-11-01', 'DEMO-QD-01', 1, '2026-11-01'),
(2, 'MANAGEMENT', 7000, '2026-11-01', 'DEMO-QD-01', 1, '2026-11-01'),
(3, 'MOTORBIKE', 70000, '2026-11-01', 'DEMO-QD-01', 1, '2026-11-01'),
(4, 'CAR', 1200000, '2026-11-01', 'DEMO-QD-01', 1, '2026-11-01');

INSERT INTO fee_invoices (id, apartment_id, period, fee_type, title, area_snapshot, amount, paid_amount, generated_by, generated_at) VALUES
(1, 1, '2026-11-01', 'SERVICE', 'Phí dịch vụ tháng 11/2026', 75.50, 755000, 755000, 2, '2026-11-01'),
(2, 1, '2026-11-01', 'MANAGEMENT', 'Phí quản lý tháng 11/2026', 75.50, 528500, 200000, 2, '2026-11-01'),
(3, 2, '2026-11-01', 'SERVICE', 'Phí dịch vụ tháng 11/2026', 90.00, 900000, 0, 2, '2026-11-01');

INSERT INTO fee_invoice_lines (invoice_id, rate_id, description, quantity, unit_price, unit_label) VALUES
(1, 1, 'Dịch vụ theo diện tích', 75.50, 10000, 'm²'),
(2, 2, 'Quản lý theo diện tích', 75.50, 7000, 'm²'),
(3, 1, 'Dịch vụ theo diện tích', 90.00, 10000, 'm²');

INSERT INTO donation_campaigns (id, name, purpose, organizer, start_date, end_date, created_by, created_at)
VALUES (1, 'Quỹ hỗ trợ mẫu', 'Minh họa khoản tự nguyện', 'BQT BlueMoon', '2026-11-01', '2026-11-28', 2, '2026-11-01');

INSERT INTO receipts (id, receipt_no, request_key, apartment_id, apartment_code_snapshot, payer_name,
    payment_method, payment_date, total_amount, cashier_id, cashier_name_snapshot, allow_public_disclosure) VALUES
(1, 'PT-202611-0001', '00000000-0000-4000-8000-000000000001', 1, 'P501', 'Cư dân mẫu A', 'CASH', '2026-11-15 02:30:00', 855000, 3, 'Thủ quỹ mẫu', TRUE),
(2, 'PT-202611-0002', '00000000-0000-4000-8000-000000000002', 1, 'P501', 'Cư dân mẫu A', 'BANK_TRANSFER', '2026-11-26 03:00:00', 200000, 3, 'Thủ quỹ mẫu', FALSE);

INSERT INTO receipt_items (receipt_id, apartment_id, source_kind, invoice_id, campaign_id, description, period, amount) VALUES
(1, 1, 'INVOICE', 1, NULL, 'Phí dịch vụ tháng 11/2026', '2026-11-01', 755000),
(1, 1, 'DONATION', NULL, 1, 'Ủng hộ quỹ hỗ trợ mẫu', '2026-11-01', 100000),
(2, 1, 'INVOICE', 2, NULL, 'Nộp một phần phí quản lý tháng 11/2026', '2026-11-01', 200000);

COMMIT;
