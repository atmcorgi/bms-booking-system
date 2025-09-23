-- =============================================
-- Reset và Seed Province/District Data
-- Khớp với dữ liệu trong TheaterForm.tsx frontend
-- =============================================

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Backup existing theater data (update province_id and district_id references)
UPDATE theater t 
JOIN district d ON t.district_id = d.id 
JOIN province p ON d.province_id = p.id 
SET 
  t.province_id = CASE 
    WHEN p.name = 'TP.HCM' THEN 2  -- Frontend: TP.HCM = id 2
    WHEN p.name = 'Hà Nội' THEN 1  -- Frontend: Hà Nội = id 1
    ELSE t.province_id 
  END,
  t.district_id = CASE 
    WHEN d.name = 'Quận 1' THEN 1
    WHEN d.name = 'Quận 3' THEN 3
    WHEN d.name = 'Quận 7' THEN 7
    WHEN d.name = 'Quận Tân Bình' THEN 16
    WHEN d.name = 'Quận Bình Tân' THEN 19
    WHEN d.name = 'Quận Tân Phú' THEN 17
    WHEN d.name = 'Quận Bình Thạnh' THEN 15
    WHEN d.name = 'Quận Gò Vấp' THEN 14
    WHEN d.name = 'Quận Ba Đình' THEN 1
    WHEN d.name = 'Quận Hoàn Kiếm' THEN 2
    WHEN d.name = 'Quận Hai Bà Trưng' THEN 7
    WHEN d.name = 'Quận Đống Đa' THEN 6
    WHEN d.name = 'Quận Tây Hồ' THEN 3
    WHEN d.name = 'Quận Cầu Giấy' THEN 5
    WHEN d.name = 'Quận Thanh Xuân' THEN 9
    WHEN d.name = 'Quận Hà Đông' THEN 17
    WHEN d.name = 'Quận Nam Từ Liêm' THEN 13
    WHEN d.name = 'Quận Bắc Từ Liêm' THEN 15
    WHEN d.name = 'Quận Long Biên' THEN 4
    ELSE t.district_id 
  END;

-- Clear existing data
DELETE FROM district;
DELETE FROM province;

-- Insert all 63 provinces (khớp với frontend TheaterForm.tsx)
INSERT INTO province (id, name, code, latitude, longitude) VALUES
(1, 'Hà Nội', 'HN', 21.0285, 105.8542),
(2, 'TP.HCM', 'HCM', 10.8231, 106.6297),
(3, 'Đà Nẵng', 'DN', 16.0544, 108.2022),
(4, 'Hải Phòng', 'HP', 20.8449, 106.6881),
(5, 'Cần Thơ', 'CT', 10.0452, 105.7469),
(6, 'An Giang', 'AG', 10.5216, 105.1259),
(7, 'Bà Rịa - Vũng Tàu', 'BRVT', 10.5419, 107.2421),
(8, 'Bắc Giang', 'BG', 21.2737, 106.1946),
(9, 'Bắc Kạn', 'BK', 22.1470, 105.8348),
(10, 'Bạc Liêu', 'BL', 9.2945, 105.7272),
(11, 'Bắc Ninh', 'BN', 21.1861, 106.0763),
(12, 'Bến Tre', 'BT', 10.2434, 106.3756),
(13, 'Bình Định', 'BD', 13.7759, 109.2337),
(14, 'Bình Dương', 'BDU', 11.3254, 106.4770),
(15, 'Bình Phước', 'BP', 11.6477, 106.6059),
(16, 'Bình Thuận', 'BTH', 10.9289, 108.1021),
(17, 'Cà Mau', 'CM', 9.1768, 105.1524),
(18, 'Cao Bằng', 'CB', 22.6743, 106.2590),
(19, 'Đắk Lắk', 'DL', 12.7107, 108.2377),
(20, 'Đắk Nông', 'DKN', 12.0046, 107.6909),
(21, 'Điện Biên', 'DB', 21.8042, 103.0076),
(22, 'Đồng Nai', 'DNI', 11.0686, 106.9974),
(23, 'Đồng Tháp', 'DT', 10.5604, 105.6340),
(24, 'Gia Lai', 'GL', 13.8079, 108.1094),
(25, 'Hà Giang', 'HG', 22.7662, 104.9380),
(26, 'Hà Nam', 'HNM', 20.5411, 105.9229),
(27, 'Hà Tĩnh', 'HT', 18.3559, 105.8877),
(28, 'Hải Dương', 'HD', 20.9373, 106.3146),
(29, 'Hậu Giang', 'HGI', 9.7842, 105.4706),
(30, 'Hòa Bình', 'HB', 20.6861, 105.3131),
(31, 'Hưng Yên', 'HY', 20.6534, 106.0513),
(32, 'Khánh Hòa', 'KH', 12.2388, 109.1967),
(33, 'Kiên Giang', 'KG', 9.9582, 105.1501),
(34, 'Kon Tum', 'KT', 14.3545, 108.0006),
(35, 'Lai Châu', 'LC', 22.3868, 103.4703),
(36, 'Lâm Đồng', 'LD', 11.9404, 108.4583),
(37, 'Lạng Sơn', 'LS', 21.8537, 106.7613),
(38, 'Lào Cai', 'LCA', 22.4809, 103.9755),
(39, 'Long An', 'LA', 10.6086, 106.6717),
(40, 'Nam Định', 'ND', 20.4388, 106.1621),
(41, 'Nghệ An', 'NA', 18.6792, 105.6919),
(42, 'Ninh Bình', 'NB', 20.2506, 105.9744),
(43, 'Ninh Thuận', 'NT', 11.5648, 108.9886),
(44, 'Phú Thọ', 'PT', 21.3619, 105.3131),
(45, 'Phú Yên', 'PY', 13.0889, 109.0929),
(46, 'Quảng Bình', 'QB', 17.4687, 106.6227),
(47, 'Quảng Nam', 'QN', 15.8801, 108.3380),
(48, 'Quảng Ngãi', 'QNG', 15.1214, 108.8048),
(49, 'Quảng Ninh', 'QNI', 21.0064, 107.2925),
(50, 'Quảng Trị', 'QT', 16.8171, 107.1006),
(51, 'Sóc Trăng', 'ST', 9.6025, 105.9739),
(52, 'Sơn La', 'SL', 21.3257, 103.9169),
(53, 'Tây Ninh', 'TN', 11.3675, 106.1193),
(54, 'Thái Bình', 'TB', 20.4465, 106.3421),
(55, 'Thái Nguyên', 'TNG', 21.5944, 105.8482),
(56, 'Thanh Hóa', 'TH', 19.8067, 105.7852),
(57, 'Thừa Thiên Huế', 'TT', 16.4637, 107.5909),
(58, 'Tiền Giang', 'TG', 10.3600, 106.3600),
(59, 'Trà Vinh', 'TV', 9.9349, 106.3452),
(60, 'Tuyên Quang', 'TQ', 21.7767, 105.2280),
(61, 'Vĩnh Long', 'VL', 10.2396, 105.9572),
(62, 'Vĩnh Phúc', 'VP', 21.3609, 105.5474),
(63, 'Yên Bái', 'YB', 21.6839, 104.8986);

-- Insert districts for Hà Nội (ID = 1)
INSERT INTO district (id, name, code, latitude, longitude, province_id) VALUES
(1, 'Ba Đình', 'BD', 21.0341, 105.8372, 1),
(2, 'Hoàn Kiếm', 'HK', 21.0285, 105.8542, 1),
(3, 'Tây Hồ', 'TH', 21.0697, 105.8194, 1),
(4, 'Long Biên', 'LB', 21.0387, 105.8889, 1),
(5, 'Cầu Giấy', 'CG', 21.0285, 105.8006, 1),
(6, 'Đống Đa', 'DD', 21.0177, 105.8340, 1),
(7, 'Hai Bà Trưng', 'HBT', 21.0123, 105.8594, 1),
(8, 'Hoàng Mai', 'HM', 20.9819, 105.8631, 1),
(9, 'Thanh Xuân', 'TX', 21.0031, 105.8044, 1),
(10, 'Sóc Sơn', 'SS', 21.2578, 105.8497, 1),
(11, 'Đông Anh', 'DA', 21.1422, 105.8469, 1),
(12, 'Gia Lâm', 'GL', 21.0183, 105.9389, 1),
(13, 'Nam Từ Liêm', 'NTL', 21.0433, 105.7731, 1),
(14, 'Thanh Trì', 'TT', 20.9622, 105.8497, 1),
(15, 'Bắc Từ Liêm', 'BTL', 21.0731, 105.7539, 1),
(16, 'Mê Linh', 'ML', 21.1833, 105.7167, 1),
(17, 'Hà Đông', 'HD', 20.9719, 105.7781, 1),
(18, 'Sơn Tây', 'ST', 21.1367, 105.5042, 1),
(19, 'Ba Vì', 'BV', 21.2000, 105.4333, 1),
(20, 'Phúc Thọ', 'PT', 21.1167, 105.5833, 1),
(21, 'Đan Phượng', 'DP', 21.0833, 105.6833, 1),
(22, 'Hoài Đức', 'HD', 21.0500, 105.7000, 1),
(23, 'Quốc Oai', 'QO', 21.0167, 105.6500, 1),
(24, 'Thạch Thất', 'TT', 21.0000, 105.6167, 1),
(25, 'Chương Mỹ', 'CM', 20.9167, 105.7167, 1),
(26, 'Thanh Oai', 'TO', 20.8667, 105.7667, 1),
(27, 'Thường Tín', 'TT', 20.8167, 105.8667, 1),
(28, 'Phú Xuyên', 'PX', 20.7667, 105.9167, 1),
(29, 'Ứng Hòa', 'UH', 20.7167, 105.9667, 1),
(30, 'Mỹ Đức', 'MD', 20.6667, 105.7167, 1);

-- Insert districts for TP.HCM (ID = 2)
INSERT INTO district (id, name, code, latitude, longitude, province_id) VALUES
(31, 'Quận 1', 'Q1', 10.7769, 106.7009, 2),
(32, 'Quận 2', 'Q2', 10.7872, 106.7498, 2),
(33, 'Quận 3', 'Q3', 10.7829, 106.6929, 2),
(34, 'Quận 4', 'Q4', 10.7403, 106.7019, 2),
(35, 'Quận 5', 'Q5', 10.7540, 106.6654, 2),
(36, 'Quận 6', 'Q6', 10.7465, 106.6352, 2),
(37, 'Quận 7', 'Q7', 10.7329, 106.7229, 2),
(38, 'Quận 8', 'Q8', 10.7403, 106.6654, 2),
(39, 'Quận 9', 'Q9', 10.8428, 106.8281, 2),
(40, 'Quận 10', 'Q10', 10.7679, 106.6669, 2),
(41, 'Quận 11', 'Q11', 10.7679, 106.6438, 2),
(42, 'Quận 12', 'Q12', 10.8633, 106.6547, 2),
(43, 'Thủ Đức', 'TD', 10.8494, 106.7539, 2),
(44, 'Gò Vấp', 'GV', 10.8431, 106.6853, 2),
(45, 'Bình Thạnh', 'BT', 10.8106, 106.7092, 2),
(46, 'Tân Bình', 'TB', 10.8019, 106.6525, 2),
(47, 'Tân Phú', 'TP', 10.7903, 106.6281, 2),
(48, 'Phú Nhuận', 'PN', 10.7931, 106.6753, 2),
(49, 'Bình Tân', 'BT', 10.7656, 106.6033, 2),
(50, 'Hóc Môn', 'HM', 10.8794, 106.5953, 2),
(51, 'Củ Chi', 'CC', 11.0614, 106.4931, 2),
(52, 'Bình Chánh', 'BC', 10.6878, 106.5881, 2),
(53, 'Nhà Bè', 'NB', 10.6939, 106.7489, 2),
(54, 'Cần Giờ', 'CG', 10.4114, 106.9547, 2);

-- Insert districts for Đà Nẵng (ID = 3)
INSERT INTO district (id, name, code, latitude, longitude, province_id) VALUES
(55, 'Hải Châu', 'HC', 16.0471, 108.2068, 3),
(56, 'Thanh Khê', 'TK', 16.0747, 108.1911, 3),
(57, 'Sơn Trà', 'ST', 16.1061, 108.2481, 3),
(58, 'Ngũ Hành Sơn', 'NHS', 16.0150, 108.2581, 3),
(59, 'Liên Chiểu', 'LC', 16.0678, 108.1481, 3),
(60, 'Cẩm Lệ', 'CL', 16.0147, 108.2081, 3),
(61, 'Hòa Vang', 'HV', 16.0147, 108.1481, 3),
(62, 'Hoàng Sa', 'HS', 16.8000, 112.2000, 3);

-- Insert districts for Hải Phòng (ID = 4)
INSERT INTO district (id, name, code, latitude, longitude, province_id) VALUES
(63, 'Hồng Bàng', 'HB', 20.8597, 106.6825, 4),
(64, 'Ngô Quyền', 'NQ', 20.8449, 106.6881, 4),
(65, 'Lê Chân', 'LC', 20.8297, 106.6931, 4),
(66, 'Hải An', 'HA', 20.8147, 106.6981, 4),
(67, 'Kiến An', 'KA', 20.7997, 106.7031, 4),
(68, 'Đồ Sơn', 'DS', 20.7847, 106.7081, 4),
(69, 'Dương Kinh', 'DK', 20.7697, 106.7131, 4),
(70, 'Thuỷ Nguyên', 'TN', 20.7547, 106.7181, 4),
(71, 'An Dương', 'AD', 20.7397, 106.7231, 4),
(72, 'An Lão', 'AL', 20.7247, 106.7281, 4),
(73, 'Kiến Thuỵ', 'KT', 20.7097, 106.7331, 4),
(74, 'Tiên Lãng', 'TL', 20.6947, 106.7381, 4),
(75, 'Vĩnh Bảo', 'VB', 20.6797, 106.7431, 4),
(76, 'Cát Hải', 'CH', 20.6647, 106.7481, 4),
(77, 'Bạch Long Vĩ', 'BLV', 20.6497, 106.7531, 4);

-- Insert districts for Cần Thơ (ID = 5)
INSERT INTO district (id, name, code, latitude, longitude, province_id) VALUES
(78, 'Ninh Kiều', 'NK', 10.0452, 105.7469, 5),
(79, 'Ô Môn', 'OM', 10.0952, 105.7969, 5),
(80, 'Bình Thuỷ', 'BT', 10.0352, 105.7469, 5),
(81, 'Cái Răng', 'CR', 10.0252, 105.7369, 5),
(82, 'Thốt Nốt', 'TN', 10.0152, 105.7269, 5),
(83, 'Vĩnh Thạnh', 'VT', 10.0052, 105.7169, 5),
(84, 'Cờ Đỏ', 'CD', 9.9952, 105.7069, 5),
(85, 'Phong Điền', 'PD', 9.9852, 105.6969, 5),
(86, 'Thới Lai', 'TL', 9.9752, 105.6869, 5);

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Reset auto increment for provinces and districts
ALTER TABLE province AUTO_INCREMENT = 64;
ALTER TABLE district AUTO_INCREMENT = 87;

-- Verify data
SELECT 'Province Count' as info, COUNT(*) as count FROM province
UNION ALL
SELECT 'District Count' as info, COUNT(*) as count FROM district
UNION ALL
SELECT 'Theater Count' as info, COUNT(*) as count FROM theater;
