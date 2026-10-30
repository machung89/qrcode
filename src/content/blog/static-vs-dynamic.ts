import type { Post } from "@/lib/blog";

export const staticVsDynamic: Post = {
  id: "static-vs-dynamic",
  date: "2026-10-16",
  cta: "/dashboard/new",
  translations: {
    vi: {
      slug: "ma-qr-tinh-va-ma-qr-dong",
      title: "Mã QR tĩnh và mã QR động: khác nhau thế nào, nên chọn loại nào?",
      description:
        "So sánh mã QR tĩnh và mã QR động: khả năng sửa nội dung sau khi in, thống kê lượt quét, độ bền và chi phí. Kèm gợi ý chọn loại phù hợp cho từng trường hợp.",
      body: `
Khi tạo mã QR, bạn sẽ gặp hai lựa chọn: **mã QR tĩnh** và **mã QR động**. Nhìn bề ngoài chúng giống hệt nhau, nhưng cách hoạt động rất khác, và chọn sai có thể khiến bạn phải in lại hàng nghìn tờ rơi. Bài này giúp bạn hiểu rõ và chọn đúng ngay từ đầu.

## Mã QR tĩnh là gì?

Mã QR tĩnh lưu **nội dung trực tiếp bên trong mã**: đường link, mật khẩu WiFi, số tài khoản, danh bạ... Điện thoại quét là đọc được ngay, không cần đi qua máy chủ trung gian nào.

- **Ưu điểm**: miễn phí, không bao giờ hết hạn, hoạt động cả khi không có internet (với văn bản, WiFi, vCard), không phụ thuộc vào bên tạo mã.
- **Nhược điểm**: in ra rồi là **không sửa được**. Nội dung dài thì mã dày ô, khó quét. Không biết có bao nhiêu người đã quét.

## Mã QR động là gì?

Mã QR động chỉ chứa **một đường link ngắn**, ví dụ qrcode-ge.com/r/AbC1234. Khi được quét, link ngắn này chuyển người dùng tới nội dung thật mà bạn cài đặt trong bảng điều khiển.

- **Ưu điểm**: **đổi nội dung bất cứ lúc nào** kể cả sau khi in; xem **thống kê lượt quét** theo ngày, thiết bị, quốc gia; tạm dừng mã khi hết chương trình; mã luôn thoáng, dễ quét vì link rất ngắn.
- **Nhược điểm**: cần tài khoản; mã chỉ hoạt động khi dịch vụ còn chạy và cần có internet khi quét.

## Bảng so sánh nhanh

| Tiêu chí | Mã QR tĩnh | Mã QR động |
| --- | --- | --- |
| Sửa nội dung sau khi in | Không | Có |
| Thống kê lượt quét | Không | Có |
| Cần tài khoản | Không | Có |
| Cần internet khi quét | Tuỳ nội dung | Có |
| Độ dày của mã | Tăng theo nội dung | Luôn gọn |
| Tạm dừng / bật lại | Không | Có |
| Chi phí | Miễn phí | Miễn phí 3 mã, gói trả phí để dùng nhiều hơn |

## Khi nào nên dùng mã QR tĩnh?

- **Mật khẩu WiFi** dán ở quầy, phòng khách sạn: nội dung ít khi đổi, quét được cả khi chưa có mạng.
- **Chuyển khoản ngân hàng (VietQR)**: app ngân hàng chỉ đọc được mã VietQR gốc, không đọc được link chuyển hướng, nên bắt buộc dùng [mã tĩnh](/vi/qr/bank). Xem [hướng dẫn tạo mã QR chuyển khoản](/vi/blog/tao-ma-qr-chuyen-khoan-vietqr).
- **Danh thiếp vCard, văn bản, số serial** cố định.
- Khi bạn không muốn mã phụ thuộc vào bất kỳ dịch vụ nào.

## Khi nào nên dùng mã QR động?

- **Tờ rơi, poster, bao bì in số lượng lớn**: link khuyến mãi đổi theo mùa mà không phải in lại.
- **Menu nhà hàng dạng PDF**: đổi giá, thêm món chỉ cần tải file mới lên.
- **Chiến dịch quảng cáo** cần đo hiệu quả: biết kênh nào, ngày nào có nhiều lượt quét.
- **Danh thiếp** khi bạn có thể đổi số điện thoại hoặc chức danh.
- Khi lỡ in sai link: với mã động, chỉ cần sửa trong bảng điều khiển.

> **Mẹo:** Nếu bạn chưa chắc nội dung có thay đổi hay không, hãy chọn mã QR động. Chi phí in lại luôn đắt hơn chi phí một mã động.

## Mã QR động có hết hạn không?

Tại qrcode-ge.com, mã QR động **không hết hạn theo thời gian** và không giới hạn lượt quét. Nếu gói trả phí của bạn hết hạn, các mã đã in **vẫn tiếp tục hoạt động**, bạn chỉ không tạo thêm được mã mới vượt giới hạn của gói miễn phí. Xem chi tiết tại [bảng giá](/vi/pricing).

## Cách tạo mã QR động

1. [Đăng nhập bằng Google](/vi/login) (miễn phí, không cần mật khẩu).
2. Vào bảng điều khiển, chọn **Tạo mã QR động**.
3. Chọn loại: link, file PDF, WiFi, vCard, vị trí, mạng xã hội, ứng dụng...
4. Nhập nội dung, đặt tên để dễ quản lý rồi bấm tạo.
5. Thiết kế màu sắc, logo, khung và tải mã về để in.

Từ đó, mỗi khi cần đổi nội dung hoặc xem có bao nhiêu người quét, bạn chỉ cần mở bảng điều khiển.
`,
    },
    en: {
      slug: "static-vs-dynamic-qr-codes",
      title: "Static vs Dynamic QR Codes: What's the Difference and Which Should You Use?",
      description:
        "Static vs dynamic QR codes compared: editing after printing, scan analytics, reliability and cost, with clear advice on which type to use for each job.",
      body: `
When you create a QR code you usually get two options: **static** or **dynamic**. They look identical, but they work very differently, and choosing the wrong one can mean reprinting thousands of flyers. This guide helps you pick the right one from the start.

## What is a static QR code?

A static QR code stores **the content directly inside the pattern**: a link, a WiFi password, contact details and so on. The phone reads it instantly, with no server in between.

- **Pros**: free, never expires, works offline for text, WiFi and vCard content, and does not depend on any provider.
- **Cons**: once printed it **cannot be changed**. Long content makes the code dense and harder to scan, and you cannot tell how many people scanned it.

## What is a dynamic QR code?

A dynamic QR code contains only **a short link**, for example qrcode-ge.com/r/AbC1234. When scanned, that short link forwards people to the real content you set in your dashboard.

- **Pros**: **change the destination any time**, even after printing; see **scan statistics** by day, device and country; pause the code when a campaign ends; the pattern stays clean and easy to scan because the link is short.
- **Cons**: requires an account, works only while the service is running, and needs an internet connection when scanned.

## Quick comparison

| Feature | Static QR code | Dynamic QR code |
| --- | --- | --- |
| Edit after printing | No | Yes |
| Scan statistics | No | Yes |
| Account required | No | Yes |
| Internet needed to scan | Depends on content | Yes |
| Code density | Grows with content | Always compact |
| Pause / resume | No | Yes |
| Cost | Free | 3 free codes, paid plans for more |

## When to use a static QR code

- **WiFi passwords** at the counter or in hotel rooms: the content rarely changes and it works before the guest is online.
- **vCard business cards, plain text, serial numbers** that never change.
- **Payments** that wallet or banking apps must read directly, such as crypto addresses.
- When you do not want the code to depend on any service.

## When to use a dynamic QR code

- **Flyers, posters and packaging** printed in large runs: swap the promotion link each season without reprinting.
- **PDF restaurant menus**: update prices or dishes by uploading a new file.
- **Marketing campaigns** you need to measure: see which channel and which day brings the most scans.
- **Business cards** when your phone number or job title might change.
- Whenever you might have made a mistake: with a dynamic code you simply fix it in the dashboard.

> **Tip:** If you are not sure whether the content will ever change, choose dynamic. Reprinting always costs more than a dynamic code.

## Do dynamic QR codes expire?

On qrcode-ge.com, dynamic QR codes **do not expire over time** and have no scan limit. If your paid plan ends, printed codes **keep working**; you just cannot create new codes beyond the free plan limit. See the [pricing page](/en/pricing) for details.

## How to create a dynamic QR code

1. [Sign in with Google](/en/login): free, no password needed.
2. In the dashboard, choose **Create dynamic QR**.
3. Pick a type: link, PDF file, WiFi, vCard, location, social media, app and more.
4. Enter the content, give it a name so you can find it later, and create it.
5. Design colours, logo and frame, then download the code for print.

From then on, open the dashboard whenever you want to change the content or see how many people scanned it.
`,
    },
  },
};
