import type { Post } from "@/lib/blog";

export const vietqrBankTransfer: Post = {
  id: "vietqr-bank-transfer",
  date: "2026-10-20",
  cta: "/qr/bank",
  translations: {
    vi: {
      slug: "tao-ma-qr-chuyen-khoan-vietqr",
      title: "Cách tạo mã QR chuyển khoản ngân hàng (VietQR) miễn phí, có sẵn số tiền",
      description:
        "Hướng dẫn tạo mã QR chuyển khoản VietQR cho mọi ngân hàng: điền sẵn số tài khoản, số tiền, nội dung. Miễn phí, chèn logo, in cho cửa hàng hoặc hoá đơn.",
      body: `
Mã QR chuyển khoản giúp khách trả tiền cho bạn chỉ với một lần quét: số tài khoản, ngân hàng, số tiền và nội dung đều được điền sẵn, không lo gõ nhầm. Bài này hướng dẫn tạo mã **VietQR** miễn phí, dùng được với gần như mọi app ngân hàng tại Việt Nam.

## VietQR là gì?

**VietQR** là chuẩn mã QR thanh toán chung của Việt Nam do **NAPAS** phát triển, dựa trên chuẩn quốc tế EMVCo. Nhờ có chuẩn chung, mã tạo cho tài khoản Vietcombank vẫn quét được bằng app MB Bank, Techcombank, BIDV hay bất kỳ ngân hàng thành viên nào, và tiền được chuyển nhanh qua NAPAS 24/7.

Mã VietQR chứa các thông tin:

- **Mã ngân hàng (BIN)** của ngân hàng nhận.
- **Số tài khoản** nhận tiền.
- **Số tiền** (không bắt buộc).
- **Nội dung chuyển khoản** (không bắt buộc).

Tên chủ tài khoản **không nằm trong mã**: app ngân hàng của người chuyển sẽ tự tra cứu và hiển thị tên thật, nên khách luôn biết chính xác mình đang chuyển cho ai.

## Cách tạo mã QR chuyển khoản

1. Mở trình [tạo mã QR chuyển khoản](/vi/qr/bank).
2. Chọn **ngân hàng** của bạn trong danh sách (hơn 35 ngân hàng).
3. Nhập **số tài khoản**.
4. Nhập **số tiền** nếu muốn khách trả đúng một khoản cố định, ví dụ 50000. Để trống nếu muốn khách tự nhập.
5. Nhập **nội dung chuyển khoản**, ví dụ "THANH TOAN DON 123".
6. Tuỳ chỉnh màu sắc, khung "Quét để thanh toán", chèn logo cửa hàng rồi bấm **Tải xuống**.

> **Mẹo:** Trước khi in, hãy dùng app ngân hàng của chính bạn quét thử. Nếu app hiện đúng tên chủ tài khoản và số tiền là mã đã chính xác.

## Có số tiền hay không có số tiền?

| Loại mã | Dùng khi | Ví dụ |
| --- | --- | --- |
| Không có số tiền | Giá mỗi lần mua khác nhau | Mã dán ở quầy thu ngân, xe bán hàng |
| Có số tiền | Khoản phải trả cố định | Hoá đơn, học phí, phí thành viên, đơn hàng online |

Mã có số tiền giúp tránh việc khách chuyển thiếu hoặc thừa. Với cửa hàng bán nhiều món giá khác nhau, một mã không có số tiền đặt ở quầy là đủ.

## Lưu ý về nội dung chuyển khoản

- Viết **không dấu**: một số app ngân hàng hiển thị sai hoặc cắt chữ có dấu. Công cụ của chúng tôi tự bỏ dấu và ký tự đặc biệt cho bạn.
- Giữ **ngắn gọn**, tối đa khoảng 50 ký tự, ví dụ mã đơn hàng hoặc số điện thoại khách.
- Dùng nội dung riêng cho từng đơn để đối soát nhanh trong sao kê.

## Mã QR chuyển khoản có an toàn không?

Mã VietQR chỉ chứa thông tin **nhận tiền**, không chứa mật khẩu hay mã OTP, nên chia sẻ công khai là bình thường. Tuy nhiên:

- Thỉnh thoảng hãy kiểm tra mã dán ở quầy, tránh bị kẻ gian **dán đè mã giả** để chuyển tiền sang tài khoản khác.
- Người trả tiền nên luôn **đọc tên người nhận** trên app trước khi xác nhận.
- Ép plastic hoặc in trên chất liệu bền để mã không bị trầy, mờ.

## Vì sao không dùng mã QR động cho chuyển khoản?

[Mã QR động](/vi/blog/ma-qr-tinh-va-ma-qr-dong) thực chất là một đường link chuyển hướng. App ngân hàng chỉ đọc được mã VietQR gốc, không mở link, nên mã chuyển khoản **luôn là mã tĩnh**. Đổi tài khoản thì bạn tạo mã mới; mã cũ vẫn chuyển vào tài khoản cũ.

## In mã QR chuyển khoản sao cho dễ quét

- Kích thước tối thiểu khoảng **3 × 3 cm** cho mã dán ở quầy; lớn hơn nếu khách đứng xa.
- Màu mã tối trên nền sáng, chừa lề trắng xung quanh.
- Thêm dòng chữ như "Quét để thanh toán" bằng tính năng **Khung**.

Xem thêm [10 mẹo in mã QR để luôn quét được](/vi/blog/meo-in-ma-qr).
`,
    },
    en: {
      slug: "vietqr-bank-transfer-qr-code",
      title: "How to Create a VietQR Bank Transfer QR Code (Free, With Amount)",
      description:
        "Create a free VietQR code to receive bank transfers in Vietnam: bank, account number, amount and transfer note filled in automatically for any banking app.",
      body: `
If you sell to customers in Vietnam, a bank transfer QR code is the fastest way to get paid. The customer scans it with their banking app and the bank, account number, amount and note are filled in automatically. This guide shows you how to create a **VietQR** code for free.

## What is VietQR?

**VietQR** is Vietnam's national payment QR standard, developed by **NAPAS** on top of the international EMVCo specification. Because every member bank uses the same standard, a code made for a Vietcombank account can be paid from MB Bank, Techcombank, BIDV or any other participating bank app, and the money arrives through NAPAS's 24/7 instant transfer network.

A VietQR code contains:

- The receiving bank's **BIN** (bank identification number).
- The **account number**.
- An optional **amount** in VND.
- An optional **transfer note**.

The account holder's name is **not stored in the code**. The payer's banking app looks it up and shows the real name before they confirm, so customers always know who they are paying.

## How to create a VietQR code

1. Open the [VietQR generator](/en/qr/bank).
2. Choose your **bank** from the list of more than 35 banks.
3. Enter your **account number**.
4. Enter an **amount** if the customer should pay a fixed sum, for example 50000 VND. Leave it empty to let them type it.
5. Add a **transfer note**, such as an order number.
6. Customise colours, add a "Scan to pay" frame and your shop logo, then **download**.

> **Tip:** Scan the code with your own banking app before printing. If it shows the correct account holder name and amount, the code is right.

## With or without an amount?

| Code type | Use it when | Example |
| --- | --- | --- |
| No amount | Each payment is different | A code at the till or on a food stall |
| Fixed amount | The sum is known in advance | Invoices, tuition, membership fees, online orders |

## Tips for the transfer note

- Use **plain letters without Vietnamese accents**; some banking apps display accented text badly. Our tool removes accents and special characters automatically.
- Keep it **short**, around 50 characters at most: an order number or the customer's phone number works well.
- Use a unique note per order so you can match payments quickly on your statement.

## Is it safe to share a bank transfer QR code?

A VietQR code only contains details for **receiving** money: no passwords or one-time codes. Still:

- Check printed codes regularly so nobody **sticks a fake code** over yours.
- Payers should always **read the recipient name** in their app before confirming.
- Laminate the code or print it on durable material.

## Why bank transfer codes must be static

A [dynamic QR code](/en/blog/static-vs-dynamic-qr-codes) is really a redirect link, and banking apps only read genuine VietQR data, not links. That is why bank transfer codes are always **static**: if you change accounts, create a new code.

For sizing and contrast advice, read our [QR code printing tips](/en/blog/qr-code-printing-tips).
`,
    },
  },
};
