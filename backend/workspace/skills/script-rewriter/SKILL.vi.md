---
name: script-rewriter
description: Phương pháp luận và quy tắc chuyển thể tiểu thuyết thành kịch bản có định dạng
---

# Hướng dẫn chuyển thể kịch bản

## Nguyên tắc chuyển thể

1. **Giữ nguyên cốt truyện chính**: không thay đổi tuyến truyện chính và quan hệ nhân vật
2. **Tăng tính hình ảnh**: chuyển lời kể thành mô tả bối cảnh có thể hình dung được
3. **Lấy lời thoại làm trục**: dùng đối thoại đẩy cốt truyện, giảm lời dẫn
4. **Kiểm soát nhịp kể**: mỗi cảnh giữ trong 30-60 giây, phù hợp với video ngắn
5. **Không viết ngôn ngữ cú máy**: không đề cập cỡ cảnh, góc máy, chuyển động máy — những thứ này thuộc bước phân cảnh

## Định dạng kịch bản

```
## S01 | nội cảnh · quán cà phê | hoàng hôn

Ánh hoàng hôn xuyên qua cửa kính sát đất tràn vào quán cà phê, hơi nóng từ những tách cà phê trên quầy bốc lên nghi ngút.

Minh ngồi một mình ở góc booth, cúi đầu nhìn điện thoại, vẻ mặt có chút lo lắng.

Chuông cửa vang lên, Hồng đẩy cửa bước vào. Cô nhìn thấy Minh, mỉm cười đi tới.

Hồng: (mỉm cười) Đợi lâu chưa?
Minh: (ngẩng đầu) Cũng không, vừa mới tới.
```

### Quy tắc định dạng

- `## S编号 | nội cảnh/ngoại cảnh · địa điểm | khoảng thời gian` — tiêu đề cảnh
- Đoạn văn mô tả hành động — không chứa bất kỳ ngôn ngữ cú máy nào
- `Tên nhân vật: (trạng thái/biểu cảm) nội dung lời thoại` — định dạng lời thoại

### Tham chiếu lượng nội dung

Kịch bản định dạng dài hơn nội dung gốc khoảng 20-30%, phần tăng chủ yếu là ký hiệu tiêu đề cảnh và định dạng lời thoại, không phải viết mở rộng.

## Các bước chuyển thể

1. Trước tiên gọi `read_episode_script` để đọc nội dung gốc
2. Phân tích cấu trúc nội dung (tỷ lệ đối thoại, lời kể, mô tả tâm lý)
3. Gọi `rewrite_to_screenplay` để thực hiện chuyển thể
4. Kiểm tra kết quả chuyển thể, xác nhận đúng định dạng kịch bản
5. Gọi `save_script` để lưu kết quả cuối cùng

## Lưu ý

- Mô tả tâm lý có thể chuyển thành biểu cảm/hành động của nhân vật hoặc lời bình ngoài hình
- Chia đoạn kể dài thành nhiều cảnh ngắn
- Đảm bảo mỗi cảnh có điểm chuyển biến cảm xúc rõ ràng
- Giữ phong cách ngôn ngữ của nhân vật nhất quán
- Số cảnh tăng liên tục (S01, S02, S03...)
- Khoảng thời gian phải cụ thể (hoàng hôn, đêm khuya, sáng sớm), không viết chung chung "ban ngày"
