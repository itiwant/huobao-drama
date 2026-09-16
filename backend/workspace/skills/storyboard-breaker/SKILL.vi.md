---
name: storyboard-breaker
description: Quy chuẩn chuyên môn chia phân cảnh — chia kịch bản thành các đoạn phân cảnh có thể chứa nhiều cú máy con
---

# Hướng dẫn chia phân cảnh

## Định nghĩa cốt lõi: đoạn phân cảnh

Một phân cảnh = một **đoạn phân cảnh** (segment) = một tác vụ sinh video.

- Mỗi đoạn dài **8-15 giây**, bên trong chứa **2-4 cú máy con**
- Giữa các cú máy con **được phép cắt cảnh**: đổi cỡ cảnh, đổi góc máy, đổi đối tượng quay, nối bằng cắt cứng
- Giữa các cú máy con **không vượt bối cảnh**: một đoạn chỉ diễn ra trong một bối cảnh (`scene_id` là gán ở cấp đoạn)
- Mỗi cú máy con 2-6 giây, tập trung vào một đơn vị hình ảnh (một hành động, một phản ứng, một cận cảnh)

## Quy trình chia (bốn bước)

1. Gọi `read_storyboard_context` để đọc kịch bản, nhân vật, bối cảnh, đạo cụ và tóm tắt phân cảnh đã có
2. **Nhận diện nhịp kể**: trước tiên nhận diện nhịp kể của kịch bản — các dấu như [Mở đầu] [Kích hoạt] [Cao trào] [Kết thúc] trong kịch bản, hoặc các điểm ngoặt tường thuật (chuyển địa điểm, tiết lộ quy tắc, bùng nổ cảm xúc, đảo chiều). **Ranh giới nhịp kể buộc phải cắt đoạn**; các cú máy con trong cùng một nhịp kể ưu tiên gom vào cùng một đoạn, không cắt rời một chuỗi nhân quả (dẫn dắt - xảy ra - phản ứng) sang các đoạn khác nhau
3. **Neo tổng lượng**: tổng thời lượng mục tiêu = số chữ kịch bản ÷ 500 chữ/phút; số đoạn ≈ tổng thời lượng mục tiêu ÷ 12 giây, cho phép dao động ±20%. Không được vượt quá hoặc thiếu hụt rõ rệt
4. **Chia cú máy con trong đoạn**: cắt cú máy con theo điểm chuyển hành động, điểm chuyển góc nhìn, điểm chuyển đối tượng; sau khi điền đầy đủ toàn bộ field cho mỗi đoạn thì gọi `save_storyboards` để lưu một lần

## Thời lượng phân tầng theo nhịp độ

Xác định thời lượng theo chức năng của đoạn, không cắt đồng loạt:

| Loại đoạn | Thời lượng | Ghi chú |
|---|---|---|
| Đoạn chuyển tiếp | 8-10 giây | Đi đường, cảnh trống, thiết lập môi trường, chuyển cảnh |
| Đoạn tường thuật | 10-15 giây | Đẩy cốt truyện thông thường, đối thoại |
| Đoạn cao trào | 12-15 giây | Cận cảnh, tiết lộ quy tắc, bùng nổ cảm xúc, đảo chiều; nhịp cú máy con chậm lại, một cú máy con đơn lẻ có thể dừng 4-6 giây |

## Giới hạn dưới thời lượng lời thoại (quy tắc cứng)

**Thời lượng đoạn ≥ tổng số chữ lời thoại và lời dẫn trong đoạn (phần viết trong description) ÷ 4.5 chữ/giây + 2 giây dư cho diễn xuất**

Lời thoại không chứa đủ phải tách sang đoạn kế tiếp, không được nhồi lời thoại không diễn hết vào một đoạn.

## Các yếu tố của cú máy

1. **Tiêu đề cú máy**: 3-5 chữ tóm tắt nội dung cốt lõi của đoạn (ví dụ "Tỉnh giấc sau ác mộng")
2. **Thời gian**: giờ cụ thể + mô tả ánh sáng
3. **Địa điểm**: mô tả đầy đủ bối cảnh + bố cục không gian + chi tiết môi trường
4. **Cỡ cảnh**: cỡ cảnh chủ đạo trong đoạn; đoạn nhiều cỡ cảnh thì viết kết hợp, ví dụ "trung cảnh + cận cảnh"
5. **Góc máy**: ngang tầm / ngước lên / nhìn xuống / mặt bên / phía sau
6. **Chuyển động máy**: cố định / đẩy máy / kéo máy / lia máy / theo máy / di chuyển máy (các cú máy con khác nhau trong đoạn có thể khác nhau)
7. **Mô tả hình ảnh** `description`: mô tả theo từng cú máy con dạng `【镜头1】…【镜头2】…` những gì khán giả thực sự nhìn thấy và nghe thấy — hình ảnh (ai + hành động cụ thể + chi tiết cơ thể + biểu cảm) viết trước; khi cú máy con đó có lời thoại thì viết 「tên nhân vật nói: "lời thoại"」 trong `【镜头N】` tương ứng, lời dẫn viết 「lời dẫn: nội dung」
8. **Kết quả hình ảnh** `result`: hậu quả tức thời ở cuối đoạn + chi tiết hình ảnh
9. **Không khí** `atmosphere`: ánh sáng + tông màu + âm thanh + không khí tổng thể
10. **Thời lượng** `duration`: tổng thời lượng đoạn 8-15 giây, và phải thoả giới hạn dưới thời lượng lời thoại
11. **Liên kết bối cảnh**: nếu khớp được với bối cảnh đã có thì bắt buộc điền `scene_id`
12. **Liên kết nhân vật**: điền `character_ids`, gán 0 đến nhiều nhân vật mà đoạn này liên quan
13. **Liên kết đạo cụ**: điền `prop_ids`, gán 0 đến nhiều đạo cụ then chốt xuất hiện trong đoạn này

## Quy tắc liên kết bối cảnh

- Ưu tiên dùng `scenes` do `read_storyboard_context` trả về
- Khi `location + time` khớp rõ ràng thì bắt buộc điền đúng `scene_id`
- Không tạo ra ID bối cảnh không tồn tại
- Nếu nội dung kịch bản rõ ràng nằm trong bối cảnh đã có, không tạo thêm mô tả bối cảnh mới trùng lặp

## Quy tắc gán nhân vật

- `character_ids` bắt buộc chọn từ danh sách nhân vật do `read_storyboard_context` trả về
- Một đoạn có thể không có nhân vật, cũng có thể gán nhiều nhân vật
- Chỉ cần đoạn có nhân vật xuất hiện rõ ràng, bị nhìn thấy, có hành động hoặc nói thì đều phải gán vào
- Đoạn thuần môi trường, cảnh trống, cận cảnh đồ vật có thể truyền mảng rỗng

## Quy tắc gán đạo cụ

- `prop_ids` bắt buộc chọn từ danh sách đạo cụ (`props`) do `read_storyboard_context` trả về
- Khi đạo cụ được nhân vật sử dụng, trao tay, đặc tả cận cảnh, hoặc hiện rõ trong khung hình và có ý nghĩa với tường thuật thì bắt buộc gán vào đoạn đó
- Đoạn cận cảnh đạo cụ (không có nhân vật) cũng phải gán đạo cụ, `character_ids` có thể để rỗng
- Không gán các vật trang trí nền, đồ bày trí bối cảnh không liên quan cốt truyện; đoạn không có đạo cụ xuất hiện thì truyền mảng rỗng
- Đạo cụ được gán sẽ làm ảnh tham chiếu cho sinh video (ảnh đơn trên nền trắng), đảm bảo ngoại hình đạo cụ nhất quán xuyên suốt các đoạn

## Yêu cầu chất lượng

- `description` phải phù hợp cho người đọc, mô tả chi tiết theo từng cú máy con những gì khán giả thực sự nhìn thấy và nghe thấy; lời thoại/lời dẫn viết trực tiếp trong `【镜头N】` tương ứng
- `image_prompt` phải làm nổi bật bố cục khung hình đơn, ngoại hình nhân vật, môi trường và ánh sáng (tương ứng cú máy con đầu tiên của đoạn)
- `bgm_prompt` và `sound_effect` dùng cụm từ ngắn gọn là đủ, nhưng không được chung chung đến mức chỉ có "căng thẳng" "buồn"
- Nếu cần điều chỉnh, gọi `update_storyboard` để sửa đoạn cụ thể
