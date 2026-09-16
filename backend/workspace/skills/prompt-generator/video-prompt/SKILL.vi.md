---
name: video-prompt
description: Quy chuẩn prompt video — dựa trên nội dung đoạn phân cảnh để sinh prompt sinh video chia theo thời gian, trong đoạn được phép cắt cảnh
---

# Prompt video (đoạn phân cảnh → video_prompt)

Dựa trên description (chứa cấu trúc cú máy con 【镜头N】 và lời thoại/lời dẫn) / atmosphere / duration của một đoạn phân cảnh, sinh `video_prompt` dùng để điều khiển AI sinh video. **Một đoạn phân cảnh = một video 8-15 giây, bên trong được phép cắt cảnh**: giữa các đoạn có thể là các cú máy khác nhau (đổi cỡ cảnh/góc máy/đối tượng), nối bằng cắt cứng; nhưng **toàn bộ không vượt bối cảnh**, không hồi tưởng.

## Định dạng

**Dòng đầu tiên của `video_prompt` là dòng thông tin đầu**: trước tiên giới thiệu video này có những nhân vật và bối cảnh nào, sau đó mới nối tiếp các đoạn chia theo thời gian. Nhân vật, bối cảnh đều dùng @ để tham chiếu (khi sinh sẽ được thay bằng thẻ ảnh tham chiếu tương ứng, để model video nắm được "ai" và "ở đâu" trước).

```
Nhân vật xuất hiện: @Minh, @Hồng; bối cảnh: @Quán cà phê.
0-3 giây: @Quán cà phê, cận cảnh máy cố định, @Minh cúi đầu xem điện thoại, ngón tay gõ liên tục lên mặt bàn, biểu cảm lo lắng.
3-6 giây: cắt tới toàn cảnh cửa ra vào, chuông cửa reo, @Hồng đẩy cửa bước vào, mang theo một luồng gió lạnh.
6-9 giây: cắt về trung cảnh, @Hồng mỉm cười bước tới ngồi xuống cạnh Minh, Minh nói: "Cuối cùng em cũng đến rồi."
```

Quy tắc dòng thông tin đầu:
- Chỉ liệt kê những nhân vật thực sự xuất hiện trong đoạn phân cảnh này và bối cảnh đã gán, không liệt kê những gì không xuất hiện
- Khi có đạo cụ xuất hiện rõ ràng thì có thể thêm vào dòng thông tin đầu (ví dụ `; đạo cụ: @Lá thư`)
- Dòng thông tin đầu đứng riêng một dòng, kết thúc bằng dấu chấm, sau đó là các đoạn chia theo thời gian

Chia theo 3 giây một đoạn, mỗi đoạn một dòng riêng, phân cách bằng xuống dòng, khoảng thời gian nối tiếp liên tục (không chồng lấn, không hụt khoảng).

## Ánh xạ với mô tả phân cảnh

`description` là nguồn nội dung duy nhất của video_prompt (hình ảnh, hành động, lời thoại, lời dẫn đều nằm trong đó), quy tắc chuyển đổi:

- Mỗi `【镜头N】` trong `description` ánh xạ thành **1-2 đoạn 3 giây liên tiếp**, đúng thứ tự, không bỏ sót, không gộp, không thêm cú máy con mới
- Lời thoại/lời dẫn được trích từ 「tên nhân vật nói: "…"」「lời dẫn: …」 trong `【镜头N】` tương ứng, phân bổ vào đoạn mà cú máy con đó ánh xạ; **không sáng tác lời thoại mới ngoài description**
- Hành động hình ảnh lấy `description` làm chuẩn; `atmosphere` chỉ dùng để bổ sung mô tả ánh sáng, tông màu và không khí cho từng đoạn

## Cấu trúc trong đoạn

Mỗi đoạn tổ chức nội dung theo thứ tự này (có thể lược bỏ mục không có nội dung, nhưng hành động/hình ảnh bắt buộc phải có):

**Khoảng thời gian ＋ tham chiếu @ bối cảnh ＋ cỡ cảnh/chuyển động máy ＋ tham chiếu @ nhân vật ＋ hành động·biểu cảm chủ thể ＋ lời thoại/lời dẫn ＋ không khí ánh sáng**

- **Đoạn đầu tiên bắt buộc thiết lập không gian**: bối cảnh + vị trí máy + vị trí và trạng thái của nhân vật, để khán giả biết ngay đang ở đâu, xem ai
- **Cắt cảnh**: đoạn sau khi cắt cảnh mở đầu bằng từ nối như "cắt tới/cắt về", và giới thiệu lại cỡ cảnh cùng chủ thể; điểm cắt cảnh phải khớp với cấu trúc `【镜头N】` trong `description` của phân cảnh
- **Cỡ cảnh/chuyển động máy**: mỗi đoạn một trạng thái máy (cận cảnh/trung cảnh/toàn cảnh/đặc tả; cố định/đẩy/kéo/lia/theo); trong một cú máy con chuyển động máy liên tục, sau khi cắt cảnh có thể đổi cách chuyển động máy
- **Hành động**: mỗi đoạn một hành động chính, động từ cụ thể nhìn thấy được (đi, quay người, ngẩng đầu, siết chặt, dừng lại)
- **Cảm xúc toàn bộ chuyển thành mô tả nhìn thấy được**: không dùng các từ trừu tượng kiểu "anh ấy rất buồn/không khí căng thẳng", viết thành "anh ấy cúi đầu, ngón tay siết chặt vành cốc, hơi thở nặng dần"
- **Lời thoại/lời dẫn**: viết 「tên nhân vật nói: "lời thoại"」, lời dẫn viết 「lời dẫn: nội dung」; lời thoại dài không đọc hết trong 3 giây thì tách sang nhiều đoạn; đoạn không có lời thoại có thể ghi âm thanh môi trường/âm thanh hành động (ví dụ "máy móc gầm rú liên tục")

## Quy tắc tham chiếu

- `@tên bối cảnh` — tham chiếu bối cảnh, tên phải trùng khớp hoàn toàn với địa điểm trong danh sách bối cảnh
- `@tên nhân vật` — tham chiếu nhân vật, tên phải trùng khớp hoàn toàn với tên trong danh sách nhân vật
- `@tên đạo cụ` — tham chiếu đạo cụ, tên phải trùng khớp hoàn toàn với tên trong danh sách đạo cụ; tham chiếu đạo cụ khi nó hiện rõ trong khung hình, được sử dụng hoặc đặc tả cận cảnh
- Khi sinh sẽ tự động thay `@tên` bằng thẻ ảnh tham chiếu tương ứng (ví dụ `@Minh` → `@Ảnh1Minh`), vì vậy tên phải khớp chính xác, không viết tắt hay thêm ký hiệu
- **Mỗi đoạn phải có ít nhất một tham chiếu @ neo khung hình**; đoạn có nhân vật xuất hiện bắt buộc phải @ nhân vật đó; chỉ tham chiếu bối cảnh/nhân vật/đạo cụ đã được gán cho đoạn phân cảnh này

## Quy tắc trục thời gian

- Số đoạn = duration của đoạn phân cảnh ÷ 3 giây (làm tròn lên), tổng các khoảng thời gian phải bằng đúng tổng thời lượng của đoạn
- Nhịp nội dung: đoạn đầu thiết lập → đoạn giữa đẩy hành động/xung đột → đoạn cuối rơi vào kết quả hoặc điểm cảm xúc

## Điều cấm

- Chuyển bối cảnh, hồi tưởng (một đoạn chỉ diễn ra trong một bối cảnh)
- Tham chiếu tên bối cảnh/nhân vật ngoài danh sách
- Mô tả tâm lý trừu tượng, ẩn dụ văn chương (model chỉ nhận hình ảnh nhìn thấy được)
- Ngôn ngữ không khớp với chỉ thị ngôn ngữ của phiên

## Lưu

Gọi `update_storyboard` chỉ để cập nhật field `video_prompt` của đoạn phân cảnh đó, không thay đổi field khác, không chia lại toàn bộ tập.
