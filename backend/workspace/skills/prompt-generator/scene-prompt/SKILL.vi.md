---
name: scene-prompt
description: Quy cách prompt cuối cùng cho bối cảnh — cú máy thiết lập góc rộng rõ ràng: vị trí tương đối cố định của tiền cảnh/trung cảnh/hậu cảnh/lối ra vào/mặt sàn/mặt tường/bài trí chính, không gian liên tục tự nhất quán, tái sử dụng được, không có nhân vật
---

# Prompt cuối cùng cho bối cảnh (cú máy thiết lập góc rộng · cảnh trống không có nhân vật)

Tạo ra là một ảnh bối cảnh **cú máy thiết lập góc rộng (establishing shot) rõ ràng**: cảnh trống thuần bối cảnh **hoàn toàn không có nhân vật**, thể hiện đầy đủ **vị trí tương đối cố định của tiền cảnh, trung cảnh, hậu cảnh, lối ra vào, mặt sàn, mặt tường và bài trí chính**, cấu trúc không gian liên tục, tự nhất quán và tái sử dụng được.

Ảnh này sẽ làm điểm neo tham chiếu bối cảnh cho mọi cảnh quay của bối cảnh đó: cả khán giả lẫn mô hình đều phải đọc hiểu được toàn bộ bố cục không gian từ bức ảnh này——từ đâu ra vào, mặt sàn và mặt tường có chất liệu gì, các bài trí cốt lõi mỗi thứ cố định ở vị trí nào. Góc nhìn phải ổn định, phổ quát.

## Cấu trúc đầu ra (lắp ghép theo thứ tự này thành một đoạn mô tả liền mạch, ngôn ngữ theo chỉ dẫn ngôn ngữ của phiên)

```
Cú máy góc rộng vị trí máy cố định, cú máy thiết lập rõ ràng, [địa điểm + chất liệu thời đại], [khoảng thời gian],
bố cục ba lớp: tiền cảnh ([yếu tố tiền cảnh]), trung cảnh ([không gian chủ thể của trung cảnh]), hậu cảnh ([chiều sâu của hậu cảnh]),
lối ra vào ([vị trí và kiểu dáng của cửa/lối đi]), mặt sàn ([chất liệu và trạng thái của mặt sàn]), mặt tường ([chất liệu và màu sắc của mặt tường]),
[bài trí chính và vị trí tương đối cố định của chúng],
cấu trúc không gian liên tục, tự nhất quán,
[nguồn sáng + nhiệt màu + tương phản sáng tối], [không khí],
trong khung hình không có bất kỳ nhân vật nào, cảnh trống, chất lượng điện ảnh
```

## Quy tắc cấu trúc không gian

Không gian phải **đọc hiểu được, khớp được, tái sử dụng được**:

- **Tiền cảnh**: yếu tố đóng khung/che khuất (khung cửa, góc bàn, cây cối, viền thiết bị), tạo chiều sâu——viết ra 1-2 yếu tố cụ thể
- **Trung cảnh**: không gian chủ thể và bài trí cốt lõi của bối cảnh (dây chuyền sản xuất, giường ngủ, quầy hàng)
- **Hậu cảnh**: phần mở rộng của không gian (mặt tường phía xa, cửa sổ, hành lang, đường nét thành phố)
- **Lối ra vào**: vị trí và kiểu dáng của cửa, cầu thang, lối đi phải rõ ràng (như "một cánh cửa sắt ở bên trái khung hình"), đây là căn cứ để các cảnh quay sau điều phối nhân vật ra vào
- **Mặt sàn và mặt tường**: cụ thể hóa chất liệu, màu sắc, trạng thái (như "mặt sàn bê tông có vết dầu", "mặt tường vôi loang lổ")
- **Bài trí chính**: viết ra 2-4 bài trí cốt lõi và **vị trí tương đối cố định** của chúng (như "dây chuyền sản xuất xếp dọc theo tường, cuối cùng là quầy bar"), quan hệ trái phải/gần xa giữa các bài trí phải tự nhất quán, đừng chỉ liệt kê tên đồ vật

## Nhân vật (quy tắc cứng · ưu tiên cao nhất)

**Trong ảnh bối cảnh không được xuất hiện bất kỳ người nào, chỉ giữ lại bản thân bối cảnh.**

- Trong prompt không mô tả nhân vật, không đề cập bất kỳ nội dung nào liên quan đến nhân vật
- Thông tin nhân vật xuất hiện trong mô tả bối cảnh (prompt) đều bỏ qua, không viết vào prompt
- Cuối prompt bắt buộc phải có: "trong khung hình không có bất kỳ nhân vật nào, cảnh trống"

Bài trí, chất liệu thời đại, yếu tố thị giác then chốt trong `prompt` (mô tả bối cảnh) phải được triển khai toàn bộ; `lighting` (ánh sáng bối cảnh) phải cụ thể hóa: hướng nguồn sáng, nhiệt màu nóng lạnh, tương phản sáng tối (như "đèn tuýp trên đầu phát ra ánh trắng lạnh, đổ bóng gắt xuống dưới máy móc").

## Góc nhìn và không khí

- Góc rộng ngang tầm mắt hoặc hơi nhìn xuống ổn định, không dùng góc cực cao/cực thấp, mắt cá, bố cục nghiêng (phải tái sử dụng nhiều lần như bối cảnh cố định)
- Dùng `location` + `time` để xác định khoảng thời gian và tông ánh sáng (ánh sáng ban ngày/ban đêm/hoàng hôn hoàn toàn khác nhau)
- Cụ thể hóa từ chỉ không khí: "ngột ngạt" → "không khí oi bức, ánh sáng âm u thấp", đừng chỉ viết từ cảm xúc trừu tượng
- Đầu ra dùng ngôn ngữ đích do chỉ dẫn ngôn ngữ của phiên quy định, không trộn lẫn từ ngữ không liên quan

## Những điều cấm

- Bất kỳ nhân vật nào——**trong ảnh bối cảnh không được xuất hiện bất kỳ người nào, chỉ giữ lại bản thân bối cảnh**
- Chữ, chữ đọc được trên biển hiệu, watermark, chữ ký
- Nhòe chuyển động, vật thể đang chuyển động (ảnh tham chiếu bối cảnh phải tĩnh và ổn định)
- Chỉ liệt kê danh sách bài trí mà không nêu vị trí tương đối (cấu trúc không gian phải liên tục, tự nhất quán)

## Lưu

Gọi `save_scene_final_prompt`: tham số prompt không chứa từ chỉ phong cách, **phong cách thị giác của dự án do công cụ tự động chèn vào vị trí đầu tiên của prompt cuối cùng**.
