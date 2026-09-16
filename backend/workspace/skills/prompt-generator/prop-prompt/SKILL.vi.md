---
name: prop-prompt
description: Quy cách prompt cuối cùng cho đạo cụ — tĩnh vật sản phẩm nền trắng, góc nhìn chụp ảnh sản phẩm tiêu chuẩn: tỷ lệ chính xác, viền nguyên vẹn, nền không mang tính tự sự
---

# Prompt cuối cùng cho đạo cụ (sản phẩm nền trắng · chụp ảnh sản phẩm tiêu chuẩn)

Tạo ra là một ảnh sản phẩm nền trắng (product shot): **dùng góc nhìn chụp ảnh sản phẩm tiêu chuẩn**, trong khung hình chỉ có bản thân đạo cụ, đặt cô lập trên nền trắng tinh, **không pha lẫn bất kỳ yếu tố nào khác**——không có đồ vật khác, không có nhân vật, không có môi trường bối cảnh, không có tay cầm giữ.

Ba yêu cầu cứng:
1. **Tỷ lệ các phần của vật thể chính xác**——không cường điệu, biến dạng hay kéo giãn theo phong cách, quan hệ kích thước tương đối của đạo cụ phải chân thực
2. **Viền nguyên vẹn**——đạo cụ vào khung trọn vẹn toàn bộ, bốn phía có khoảng trắng, không phần nào bị viền khung hình cắt
3. **Nền không mang bất kỳ nội dung tự sự nào**——nền trắng tinh chỉ là lớp lót, không có cảm giác bối cảnh, không gợi ý tình tiết, không có yếu tố trang trí

## Cấu trúc đầu ra (lắp ghép theo thứ tự này thành một đoạn mô tả liền mạch, ngôn ngữ theo chỉ dẫn ngôn ngữ của phiên)

```
Ảnh sản phẩm đơn, góc nhìn chụp ảnh sản phẩm tiêu chuẩn, [tên đạo cụ + chất liệu/màu sắc/hình dạng/kích thước + mức độ mới cũ và chi tiết mài mòn],
tỷ lệ các phần của vật thể chính xác, đặt cô lập trên nền trắng tinh, căn giữa vào khung trọn vẹn, viền nguyên vẹn không bị cắt,
nền thuần khiết không mang bất kỳ nội dung tự sự nào, không có đồ vật khác, không có nhân vật, không có bối cảnh,
ánh sáng studio mềm mại đồng đều, bóng đổ nhẹ nhạt, chi tiết cao
```

## Quy tắc tạo sinh

- Lấy `name` (tên) và `description` (ngoại hình vật thể) của đạo cụ làm cốt lõi: chất liệu, màu sắc, hình dạng, kích thước, mức độ mới cũ, dấu vết mài mòn và các chi tiết vật lý khác **triển khai từng mục**, đây là nguồn gốc độ nhận diện của đạo cụ
- Góc nhìn chụp ảnh sản phẩm tiêu chuẩn: góc 3/4 hơi nhìn xuống (đồng thời nhìn rõ mặt trên và mặt bên, có tính lập thể nhất); đạo cụ dẹt (giấy tờ, giấy tờ tùy thân, ảnh) dùng nhìn thẳng từ trên xuống
- Sản phẩm đơn căn giữa trọn vẹn, bốn phía có khoảng trắng, tỷ lệ chính xác, viền nguyên vẹn, không cắt vào chủ thể đạo cụ
- Ánh sáng studio mềm mại đồng đều, bóng đổ nhẹ nhạt, chi tiết cao
- Chỉ mô tả bản thân vật thể, không đề cập cốt truyện, nhân vật hay công dụng (cả nền lẫn khung hình đều không mang nội dung tự sự)
- Đầu ra dùng ngôn ngữ đích do chỉ dẫn ngôn ngữ của phiên quy định, không trộn lẫn từ ngữ không liên quan; **không** dùng các từ kiểu "chất lượng điện ảnh" (ảnh đạo cụ là ảnh sản phẩm, không phải ảnh phim)

## Những điều cấm

- Tay cầm giữ, nhân vật, đồ vật khác, môi trường bối cảnh vào khung
- Bao bì, đế, giá trưng bày (trừ khi chúng là một phần của bản thân đạo cụ)
- Chữ, watermark, chữ ký (chữ và họa tiết in trên bản thân đạo cụ có thể giữ lại và mô tả)
- Phản xạ môi trường, ánh sáng màu
- Phối cảnh cường điệu, biến dạng, tỷ lệ sai lệch, cắt xén viền

## Lưu

Gọi `save_prop_final_prompt`: tham số prompt không chứa từ chỉ phong cách, **phong cách thị giác của dự án do công cụ tự động chèn vào vị trí đầu tiên của prompt cuối cùng**.
