# Hướng dẫn sử dụng chức năng Import Excel cho Daily Log

## Tổng quan
Chức năng này cho phép import hàng loạt nhật ký thi công từ file Excel với đầy đủ thông tin về:
- Thông tin cơ bản (ngày, hạng mục, thời tiết, nhân lực)
- Máy móc thiết bị
- Ghi chú chi tiết (mô tả công việc, an toàn vệ sinh, ý kiến tư vấn giám sát, ý kiến nhà thầu)

## Các bước thực hiện

### 1. Download Template Excel
1. Mở tab "Nhật ký thi công" trong ứng dụng
2. Click nút **"Download Template"**
3. File `DailyLog_Template.xlsx` sẽ được tải xuống

### 2. Điền dữ liệu vào Template

Template gồm 2 sheets:

#### Sheet 1: DailyLog
Chứa thông tin chính của nhật ký thi công:

| Cột | Tên trường | Định dạng | Ví dụ | Bắt buộc |
|-----|------------|-----------|-------|----------|
| A | Ngày báo cáo | dd/mm/yyyy | 13/02/2026 | ✓ |
| B | Mã WBS | Text | WBS01 | ✓ |
| C | Tên hạng mục | Text | Cọc khoan nhồi T1 | ✓ |
| D | Thời tiết (Sáng) | Nắng/Mát mẻ/Mưa | Nắng | ✓ |
| E | Thời tiết (Chiều) | Nắng/Mát mẻ/Mưa | Mát mẻ | ✓ |
| F | CBKT | Số nguyên | 2 | ✓ |
| G | CN | Số nguyên | 15 | ✓ |
| H | Mô tả công việc | Text | Thi công cọc... | |
| I | Note An toàn vệ sinh | Text | Đã kiểm tra... | |
| J | Ý kiến tư vấn giám sát | Text | Đồng ý tiến độ | |
| K | Ý kiến nhà thầu | Text | Đảm bảo tiến độ | |

#### Sheet 2: Resources
Chứa thông tin máy móc thiết bị được sử dụng:

| Cột | Tên trường | Định dạng | Ví dụ |
|-----|------------|-----------|-------|
| A | Ngày báo cáo | dd/mm/yyyy | 13/02/2026 |
| B | Mã WBS | Text | WBS01 |
| C | Máy xúc | Số nguyên | 2 |
| D | Cần cẩu | Số nguyên | 1 |
| E | Búa | Số nguyên | 0 |
| F | Máy lu | Số nguyên | 0 |
| G | Cắt uốn | Số nguyên | 1 |
| H | Máy hàn | Số nguyên | 2 |
| I | Đầm dùi | Số nguyên | 4 |
| J | Ô tô | Số nguyên | 5 |

**Lưu ý quan trọng:**
- Ngày và Mã WBS ở sheet Resources phải khớp với sheet DailyLog
- Mỗi dòng trong sheet DailyLog tương ứng với 1 nhật ký thi công
- Nếu không sử dụng thiết bị nào, để trống hoặc nhập 0

### 3. Import File Excel

1. Click nút **"Import Excel"**
2. Chọn file Excel đã điền dữ liệu
3. Hệ thống sẽ đọc và hiển thị **Preview Dialog** với:
   - Bảng xem trước dữ liệu đã đọc
   - Tổng số bản ghi sẽ được import
   - Thông tin tóm tắt: Ngày, WBS, Thời tiết, Nhân lực, Máy móc

### 4. Xác nhận và Lưu

1. Kiểm tra dữ liệu trong Preview Dialog
2. Nếu đúng, click nút **"Lưu (X bản ghi)"**
3. Nếu sai, click **"Hủy"** và sửa lại file Excel

Sau khi lưu thành công, tất cả các bản ghi sẽ được thêm vào đầu danh sách Daily Log.

## Ví dụ minh họa

### Ví dụ 1: Import 1 nhật ký đơn giản

**Sheet DailyLog:**
```
13/02/2026 | WBS01 | Cọc khoan nhồi T1 | Nắng | Mát mẻ | 2 | 15 | Thi công cọc D1500 | Đã kiểm tra ATVS | Đồng ý | Đảm bảo tiến độ
```

**Sheet Resources:**
```
13/02/2026 | WBS01 | 2 | 1 | 0 | 0 | 1 | 2 | 4 | 5
```

### Ví dụ 2: Import nhiều nhật ký

Điền nhiều dòng vào cả 2 sheets, đảm bảo Ngày + Mã WBS khớp nhau.

## Xử lý lỗi thường gặp

| Lỗi | Nguyên nhân | Giải pháp |
|-----|-------------|-----------|
| "Lỗi khi đọc file Excel" | File bị lỗi hoặc không đúng định dạng | Tải lại template mới |
| "Không có dữ liệu để import" | File trống hoặc chỉ có header | Điền dữ liệu vào từ dòng 4 trở đi |
| Ngày hiển thị sai | Định dạng ngày không đúng | Sử dụng định dạng dd/mm/yyyy |
| Thời tiết không đúng | Nhập sai giá trị | Chỉ nhập: Nắng, Mát mẻ, hoặc Mưa |

## Các trường mới đã được thêm

Phiên bản này đã thêm 3 trường mới:

1. **Note An toàn vệ sinh**: Ghi chú về tình hình an toàn vệ sinh lao động tại công trường
2. **Ý kiến tư vấn giám sát**: Nhận xét, ý kiến của tư vấn giám sát về tiến độ và chất lượng
3. **Ý kiến nhà thầu**: Phản hồi, cam kết của nhà thầu thi công

Các trường này xuất hiện ở:
- Form thêm mới / sửa Daily Log
- Form Import Excel (cột I, J, K)
- Form chi tiết Daily Log

## Hỗ trợ kỹ thuật

Nếu gặp vấn đề, vui lòng liên hệ với bộ phận IT hoặc kiểm tra:
1. Browser có hỗ trợ File API không
2. File Excel có bị corrupt không
3. Thư viện XLSX đã load thành công chưa (kiểm tra Console)

---
**Phiên bản:** 1.0  
**Cập nhật:** 14/02/2026
