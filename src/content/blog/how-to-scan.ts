import type { Post } from "@/lib/blog";

export const howToScan: Post = {
  id: "how-to-scan",
  date: "2026-10-26",
  cta: "/scanner",
  translations: {
    vi: {
      slug: "cach-quet-ma-qr",
      title: "Cách quét mã QR trên iPhone, Android và máy tính (kể cả mã trong ảnh)",
      description:
        "Cách quét mã QR bằng camera iPhone, Android, Zalo, Google Lens và trên máy tính không cần cài app. Quét mã trong ảnh chụp màn hình, tránh lừa đảo.",
      body: `
Hầu hết điện thoại hiện nay đều quét được mã QR mà không cần cài thêm ứng dụng. Bài này tổng hợp cách quét nhanh nhất trên từng thiết bị, cách đọc mã QR nằm trong ảnh hoặc ảnh chụp màn hình, và những điều cần chú ý để không bị lừa.

## Quét mã QR trên iPhone

1. Mở ứng dụng **Camera** (chế độ chụp ảnh).
2. Hướng camera vào mã QR, giữ yên khoảng 1–2 giây.
3. Bấm vào thông báo hiện ở phía dưới khung hình để mở link, kết nối WiFi, lưu danh bạ...

Nếu không thấy thông báo, vào **Cài đặt → Camera** và bật **Quét mã QR**. Bạn cũng có thể thêm nút **Trình quét mã** vào Trung tâm điều khiển để mở nhanh từ màn hình khoá.

## Quét mã QR trên Android

Tuỳ hãng máy, bạn có vài cách:

- **Camera**: phần lớn máy Samsung, Xiaomi, Oppo, Pixel đọc mã QR ngay trong ứng dụng Camera.
- **Ô quét mã QR trong bảng cài đặt nhanh**: kéo thanh thông báo xuống, tìm biểu tượng **Quét mã QR** (có sẵn từ Android 13 trên nhiều máy).
- **Google Lens**: mở ứng dụng Google, bấm biểu tượng camera Lens trong ô tìm kiếm.

## Quét bằng Zalo và app ngân hàng

- **Zalo**: bấm biểu tượng quét mã QR cạnh ô tìm kiếm. Tiện để kết bạn, đăng nhập Zalo trên máy tính hoặc mở link.
- **App ngân hàng**: với [mã chuyển khoản VietQR](/vi/blog/tao-ma-qr-chuyen-khoan-vietqr), hãy quét bằng chính app ngân hàng. Camera thường không mở được lệnh chuyển tiền.

## Quét mã QR trên máy tính

Bạn không cần điện thoại để đọc mã QR:

1. Mở [công cụ quét mã QR trực tuyến](/vi/scanner).
2. **Kéo thả ảnh** chứa mã vào khung, **dán ảnh** bằng Ctrl+V, hoặc bấm **Quét bằng camera** để dùng webcam.
3. Nội dung hiện ngay, kèm nút sao chép hoặc mở link.

Mọi xử lý diễn ra ngay trong trình duyệt, ảnh của bạn không được tải lên máy chủ.

## Quét mã QR trong ảnh hoặc ảnh chụp màn hình

Ai đó gửi mã QR qua tin nhắn và bạn đang xem trên chính điện thoại đó? Có ba cách:

- **iPhone**: mở ảnh trong ứng dụng Ảnh, nhấn giữ vào mã QR rồi chọn mở link (tính năng Văn bản trực tiếp).
- **Android**: mở ảnh trong Google Photos và bấm **Lens**.
- **Mọi thiết bị**: tải ảnh lên [trang quét mã QR](/vi/scanner) của chúng tôi.

## Không quét được mã QR? Kiểm tra những điều sau

- **Lau ống kính camera**, tăng sáng, tránh chói đèn trên bề mặt bóng.
- **Lùi ra hoặc tiến lại gần**: mã phải nằm trọn trong khung hình, kể cả lề trắng xung quanh.
- **Mã quá nhỏ hoặc quá dày ô**: người tạo mã nên in to hơn hoặc dùng link ngắn. Xem [mẹo in mã QR](/vi/blog/meo-in-ma-qr).
- **Mã màu sáng trên nền tối** hoặc độ tương phản thấp: một số camera không đọc được.

## Quét mã QR an toàn, tránh lừa đảo

Lừa đảo qua mã QR (còn gọi là "quishing") ngày càng phổ biến. Hãy nhớ:

- **Đọc kỹ địa chỉ trang** hiện ra trước khi mở. Cẩn thận với tên miền na ná ngân hàng hoặc cơ quan nhà nước.
- **Không nhập mật khẩu, mã OTP** trên trang mở từ mã QR lạ.
- Kiểm tra mã QR dán ở nơi công cộng xem có bị **dán đè** lên mã gốc không.
- Khi chuyển khoản, luôn **đối chiếu tên người nhận** trên app ngân hàng.

> **Mẹo:** Muốn biết mã chứa gì mà chưa mở? Dùng [trình quét trực tuyến](/vi/scanner): nó chỉ hiển thị nội dung, không tự mở link.
`,
    },
    en: {
      slug: "how-to-scan-a-qr-code",
      title: "How to Scan a QR Code on iPhone, Android and PC (Even From a Screenshot)",
      description:
        "Scan QR codes with your iPhone camera, Android, Google Lens or a computer, no app needed. Read codes in screenshots and avoid QR scams.",
      body: `
Almost every phone today can scan QR codes without installing anything. This guide covers the quickest way on each device, how to read a QR code that is inside a photo or screenshot, and how to stay safe from QR scams.

## Scan a QR code on iPhone

1. Open the **Camera** app in photo mode.
2. Point it at the QR code and hold steady for a second or two.
3. Tap the banner that appears to open the link, join WiFi, save a contact and so on.

No banner? Go to **Settings → Camera** and turn on **Scan QR Codes**. You can also add the **Code Scanner** button to Control Center to open it straight from the lock screen.

## Scan a QR code on Android

Depending on your phone, you have several options:

- **Camera**: most Samsung, Xiaomi, Oppo and Pixel phones read QR codes directly in the Camera app.
- **Quick Settings tile**: swipe down and look for **Scan QR code**, built into many phones since Android 13.
- **Google Lens**: open the Google app and tap the Lens camera icon in the search bar.

## Scan a QR code on a computer

You do not need a phone to read a QR code:

1. Open our [online QR code scanner](/en/scanner).
2. **Drag and drop** an image, **paste** a screenshot with Ctrl+V, or click **Scan with camera** to use your webcam.
3. The content appears instantly, with buttons to copy it or open the link.

Everything is processed in your browser; your image is never uploaded to a server.

## Scan a QR code from a photo or screenshot

Someone sent you a QR code and you are viewing it on the same phone? Try one of these:

- **iPhone**: open the image in Photos, then touch and hold the QR code to open it (Live Text).
- **Android**: open the image in Google Photos and tap **Lens**.
- **Any device**: upload the image to our [QR scanner page](/en/scanner).

## QR code not scanning? Check these

- **Clean the camera lens**, add light and avoid glare on glossy surfaces.
- **Move back or closer**: the whole code, including its white margin, must fit in the frame.
- **The code is too small or too dense**: the creator should print it larger or use a shorter link. See our [QR code printing tips](/en/blog/qr-code-printing-tips).
- **Light code on a dark background** or low contrast: some cameras cannot read it.

## Scan QR codes safely

QR phishing, or "quishing", is on the rise. Keep these rules in mind:

- **Read the web address** your phone shows before opening it, and watch for look-alike domains of banks or government sites.
- **Never enter passwords or one-time codes** on a page opened from an unknown QR code.
- Check public QR codes for **stickers placed over the original**, especially on parking meters and payment stands.
- When paying, always **confirm the recipient's name** in your banking or payment app.

> **Tip:** Want to see what a code contains without opening it? Use our [online scanner](/en/scanner): it only shows the content and never opens links automatically.
`,
    },
  },
};
