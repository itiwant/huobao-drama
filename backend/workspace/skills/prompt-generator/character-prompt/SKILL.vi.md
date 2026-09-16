---
name: character-prompt
description: Quy cách prompt cuối cùng cho nhân vật — cận mặt chính diện + bản vẽ ba hướng (character turnaround: chính diện/nghiêng 90 độ/sau lưng), làm điểm neo ngoại hình cho mọi lần tạo sinh về sau
---

# Prompt cuối cùng cho nhân vật (bên trái cận mặt chính diện + bên phải bản vẽ ba hướng)

Tạo ra là một ảnh tham chiếu thiết kế nhân vật (character reference sheet), bố cục cố định như sau:

- **Bên trái: cận mặt chính diện**——cận cảnh chính diện phần đầu và vai, ngũ quan, kiểu tóc, chất da nhìn rõ, làm điểm neo cho độ nhận diện khuôn mặt
- **Bên phải: xếp ngang bằng nhau ba hình toàn thân chính diện, nghiêng 90 độ, sau lưng**——ba hình toàn thân của cùng một nhân vật xếp ngang bằng nhau, đỉnh đầu và gót chân thẳng hàng

**Nguyên tắc cốt lõi: nhất quán > đẹp.** Ảnh này là điểm neo ngoại hình cho mọi hình ảnh nhân vật và tham chiếu video về sau, phải trung tính, rõ ràng, tái sử dụng được——đừng theo đuổi tính nghệ thuật của một bức ảnh đơn lẻ.

## Cấu trúc đầu ra (lắp ghép theo thứ tự này thành một đoạn mô tả liền mạch, ngôn ngữ theo chỉ dẫn ngôn ngữ của phiên)

```
Ảnh tham chiếu thiết kế nhân vật, bên trái là cận mặt chính diện, bên phải xếp ngang bằng nhau ba hình toàn thân có chiều cao bằng nhau: chính diện, nghiêng 90 độ, sau lưng,
cận cảnh và các hình toàn thân đều là cùng một nhân vật, toàn thân vào khung, tư thế đứng chữ A trung tính, ba hình toàn thân xếp ngang bằng nhau, đỉnh đầu và gót chân thẳng hàng,
[độ tuổi + giới tính + vóc dáng], [đặc điểm ngũ quan], [kiểu tóc], [trang phục + phụ kiện],
khuôn mặt, kiểu tóc và trang phục của cận mặt chính diện và ba hướng hoàn toàn giống nhau,
nền trắng tinh, ánh sáng mềm mại đồng đều, chất lượng điện ảnh
```

## Quy tắc thứ tự mô tả

Đặt **đặc điểm dễ nhận diện nhất lên trước**, triển khai theo thứ tự này từng yếu tố then chốt của `appearance` (ngoại hình) và `styling` (trang điểm tạo hình), không bỏ sót:

1. Điểm neo thân phận: độ tuổi (như "đầu hai mươi"), giới tính, vóc dáng (cao thấp gầy béo, thói quen tư thế)
2. Ngũ quan: hình khuôn mặt, mắt, các đặc điểm nổi bật khác (sẹo, nốt ruồi, kính...)——cận mặt chính diện đặc biệt dựa vào phần mô tả này
3. Kiểu tóc: màu, độ dài, kiểu
4. Trang phục: kiểu dáng, màu sắc, chất liệu, trạng thái (như "đồng phục công nhân nhăn nhúm có vết hàn thiếc ở cổ tay áo")
5. Phụ kiện: chỉ viết những thứ có độ nhận diện, không nhồi nhét

Đặc điểm tính cách của nhân vật phải chuyển hóa thành mô tả khí chất và thần thái bên ngoài (như "tiều tụy" → "ánh mắt mệt mỏi, vai hơi sụp"), không được để từ ngữ chỉ tính cách xuất hiện trực tiếp.

## Bố cục và tính nhất quán

- Cận mặt chính diện bên trái: hướng chính diện về phía ống kính, biểu cảm trung tính, từ đỉnh đầu đến vai vào khung đầy đủ
- Ba hình toàn thân bên phải: chính diện, nghiêng 90 độ, sau lưng của cùng một nhân vật, **xếp ngang bằng nhau, khoảng cách đều nhau**, đỉnh đầu và gót chân trên cùng một đường ngang
- Cận cảnh và ba hình toàn thân phải là cùng một khuôn mặt, cùng một kiểu tóc, cùng một trang phục——viết rõ "khuôn mặt, kiểu tóc và trang phục của cận mặt chính diện và ba hình toàn thân hoàn toàn giống nhau"
- Tư thế đứng trung tính, biểu cảm tự nhiên——tiện cho việc tái sử dụng làm ảnh tham chiếu
- Ánh sáng studio mềm mại đồng đều, không dùng ánh sáng tối đối chọi gay gắt (ảnh tham chiếu phải dùng được trong đủ mọi bối cảnh)
- Đầu ra dùng ngôn ngữ đích do chỉ dẫn ngôn ngữ của phiên quy định, không trộn lẫn từ ngữ không liên quan

## Những điều cấm

- Tư thế động, biểu cảm cường điệu, cầm đạo cụ trên tay, cùng khung với người khác
- Cắt xén cơ thể (hình toàn thân bắt buộc phải full body, từ đỉnh đầu đến gót chân vào khung đầy đủ; cận cảnh bắt buộc phải vào khung đầy đủ phần đầu và vai)
- Chữ, nhãn, watermark, chữ ký
- Bóng đổ nặng, ánh sáng nền màu, đạo cụ nền

## Lưu

Gọi `save_character_final_prompt`: tham số prompt không chứa từ chỉ phong cách, **phong cách thị giác của dự án do công cụ tự động chèn vào vị trí đầu tiên của prompt cuối cùng**.
