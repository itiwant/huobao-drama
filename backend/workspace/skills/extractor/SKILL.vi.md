---
name: extractor
description: Quy tắc và phương pháp trích xuất nhân vật, bối cảnh và đạo cụ
---

# Hướng dẫn trích xuất nhân vật, bối cảnh và đạo cụ

## Quy tắc trích xuất nhân vật

Các field của nhân vật được trích xuất (tương ứng một-một với tham số của công cụ `save_dedup_characters`):
- **name** (bắt buộc): tên đầy đủ của nhân vật
- **role**: vị trí nhân vật — nhân vật chính/nhân vật phụ/vai quần chúng
- **appearance**: mô tả ngoại hình (300-500 chữ) — giới tính, cảm giác tuổi tác, ngũ quan, vóc dáng, khí chất. **Không xuất riêng đặc điểm tính cách của nhân vật, mà phải chuyển hoá thành khí chất và thần thái bên ngoài hoà vào phần mô tả ngoại hình** (ví dụ "tính cách lạnh lùng" nên viết thành "ánh mắt lạnh lùng, biểu cảm tiết chế, ít khi cười")
- **styling**: tạo hình — kiểu tóc, trang phục, trang điểm, phụ kiện...
- **description**: câu chuyện nền và quan hệ nhân vật (bổ sung tuỳ chọn)

## Quy tắc trích xuất bối cảnh

Các field của bối cảnh được trích xuất (tương ứng một-một với tham số của công cụ `save_dedup_scenes`):
- **location** (bắt buộc): tên địa điểm cụ thể
- **time**: khoảng thời gian (như ban ngày/hoàng hôn/đêm khuya), cùng một địa điểm khác khoảng thời gian được coi là bối cảnh mới
- **prompt**: mô tả bối cảnh — không gian, bài trí, chất liệu thời đại, các yếu tố thị giác then chốt (thuần nền, không có nhân vật)
- **lighting**: ánh sáng và bóng đổ của bối cảnh — nguồn sáng, tông màu, sáng tối, không khí

## Quy tắc trích xuất đạo cụ

**Nguyên tắc cốt lõi: thà trích xuất ít còn hơn trích xuất nhiều.** Đạo cụ là tài sản chi phí cao dùng để tạo ảnh sản phẩm nền trắng, được video tham chiếu ở cảnh đặc tả, chỉ những đạo cụ then chốt với cốt truyện mới đáng trích xuất. Một tập thường có **0-3** đạo cụ then chốt, khi vượt quá 3 thì sắp xếp theo mức độ quan trọng với cốt truyện và chỉ giữ 3 cái đầu.

Phải **đồng thời thoả mãn** hai điều sau, không thể thiếu điều nào:
1. **Trực tiếp đẩy cốt truyện**: sự xuất hiện, trao tay, hư hỏng hoặc phát hiện của vật phẩm đó sẽ tạo ra bước ngoặt tình tiết (như hung khí, tín vật, tài liệu then chốt, quà định tình, chứng cứ then chốt).
2. **Đáng để tạo ảnh riêng**: các phân cảnh sau sẽ cho nó cú máy đặc tả hoặc nó xuất hiện lặp lại, cần ngoại hình cố định.

**Ba câu hỏi phán định** (tự hỏi tự trả lời với mỗi đạo cụ ứng viên, chỉ cần một câu trả lời "không" là bỏ):
- ① Xoá nó đi thì cốt truyện có còn đứng vững không? → Còn đứng vững thì **không trích xuất** (nó chỉ là phông nền kiểu đạo cụ)
- ② Nó có chỉ là đồ vật thường ngày mà nhân vật tiện tay dùng không (điện thoại, đũa, cốc nước, thuốc lá, ô)? → Phải thì **không trích xuất**
- ③ Nó có phải là một phần bài trí của bối cảnh không (bàn ghế, đèn, cửa ra vào và cửa sổ, tranh treo, bát đĩa)? → Phải thì **không trích xuất** (những thứ này thuộc mô tả bối cảnh)

**Điển hình không tính là đạo cụ**: đồ vật thông thường dùng tiện tay nhưng không ảnh hưởng đến hướng đi của cốt truyện; bài trí bối cảnh và đồ nội thất; vật phẩm chỉ được nhắc một lần rồi không xuất hiện nữa; trang phục thường ngày của nhân vật (thuộc về tạo hình nhân vật).

Nếu không có đạo cụ nào thoả mãn điều kiện, **đừng cố trích xuất**, chỉ cần truyền mảng rỗng khi gọi `save_dedup_props`.

Các field của đạo cụ được trích xuất (tương ứng một-một với tham số của công cụ `save_dedup_props`):
- **name** (bắt buộc): tên đạo cụ
- **type**: loại — thường ngày/vũ khí/giao thông/trang trí/tài liệu...
- **description**: ngoại hình vật phẩm — chỉ mô tả ngoại quan vật lý của bản thân vật phẩm (chất liệu, màu sắc, hình dạng, kích thước, mức độ mới cũ, dấu vết hao mòn...), không viết mục đích trong cốt truyện, không liên quan đến nhân vật hay sự vật khác

Đạo cụ **không cần xuất prompt hình ảnh** — prompt cuối cùng của đạo cụ do Agent tạo prompt chuyên tạo trước khi tạo ảnh (quy chuẩn sản phẩm nền trắng).

## Các bước sử dụng

1. Gọi `read_script_for_extraction` để đọc kịch bản tập hiện tại
2. Gọi `read_existing_characters` để xem các nhân vật đã có trong dự án và các nhân vật đã liên kết với tập hiện tại
3. Gọi `read_existing_scenes` để xem các bối cảnh đã có trong dự án và các bối cảnh đã liên kết với tập hiện tại
4. Gọi `read_existing_props` để xem các đạo cụ đã có trong dự án và các đạo cụ đã liên kết với tập hiện tại
5. Chỉ trích xuất những nhân vật, bối cảnh và đạo cụ thực sự xuất hiện trong tập hiện tại
6. Gọi `save_dedup_characters` để lưu nhân vật và tự động liên kết với tập hiện tại
7. Gọi `save_dedup_scenes` để lưu bối cảnh và tự động liên kết với tập hiện tại
8. Gọi `save_dedup_props` để lưu đạo cụ và tự động liên kết với tập hiện tại

## Quy tắc tập hiện tại

- Mục tiêu là bổ sung đủ nhân vật, bối cảnh và đạo cụ mà "tập hiện tại" cần, không phải quét lại toàn bộ dự án
- Nếu đã tồn tại trong dự án nhưng tập hiện tại chưa liên kết, vẫn nên tái sử dụng và liên kết với tập hiện tại
- Quy tắc khử trùng lặp: nhân vật/đạo cụ khớp chính xác theo tên, bối cảnh khớp chính xác theo 【địa điểm + khoảng thời gian】, khi trúng thì ưu tiên tái sử dụng, không tạo trùng lặp
- Khử trùng lặp tên gần giống: khi tên có dấu ngoặc định vị hoặc bí danh thì so sánh theo phần chính trước dấu ngoặc (ví dụ 「Lâm Tiểu Vũ (nhân vật chính)」 và 「Lâm Tiểu Vũ」 được coi là cùng một nhân vật/đạo cụ, tái sử dụng cái đã có); normalized_name mà read_existing_characters / read_existing_props trả về chính là tên sau khi chuẩn hoá, normalized_location của bối cảnh cũng tương tự, cứ dựa vào đó để phán định
