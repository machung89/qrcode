import type { Post } from "@/lib/blog";

export const wifiQrCode: Post = {
  id: "wifi-qr-code",
  date: "2026-10-23",
  cta: "/qr/wifi",
  translations: {
    vi: {
      slug: "tao-ma-qr-wifi",
      title: "Cách tạo mã QR WiFi: khách quét là kết nối, không cần nhập mật khẩu",
      description:
        "Hướng dẫn tạo mã QR WiFi miễn phí cho quán cà phê, khách sạn, văn phòng và gia đình. Cách quét trên iPhone, Android và mẹo bảo mật khi chia sẻ WiFi.",
      body: `
"Cho em xin mật khẩu WiFi" có lẽ là câu hỏi quen thuộc nhất ở quán cà phê, khách sạn hay văn phòng. Với một **mã QR WiFi**, khách chỉ cần mở camera, quét và kết nối ngay, không phải đánh vần mật khẩu dài loằng ngoằng. Bài này hướng dẫn cách tạo, cách quét và cách dùng mã QR WiFi an toàn.

## Mã QR WiFi hoạt động thế nào?

Mã QR WiFi chứa tên mạng (SSID), kiểu bảo mật và mật khẩu theo một định dạng chuẩn mà iPhone và Android đều hiểu, ví dụ:

**WIFI:T:WPA;S:CaPheSang;P:matkhau123;;**

Khi quét, điện thoại hiện thông báo "Kết nối mạng CaPheSang". Người dùng bấm một lần là vào mạng. Vì đây là [mã QR tĩnh](/vi/blog/ma-qr-tinh-va-ma-qr-dong), mã hoạt động cả khi điện thoại chưa có internet, đúng lúc khách cần nhất.

## Cách tạo mã QR WiFi

1. Mở trình [tạo mã QR WiFi](/vi/qr/wifi).
2. Nhập **tên mạng (SSID)** chính xác, phân biệt chữ hoa chữ thường.
3. Nhập **mật khẩu**.
4. Chọn **kiểu mã hoá**: WPA/WPA2/WPA3 cho hầu hết router hiện nay, WEP cho router rất cũ, hoặc "Không mật khẩu" cho mạng mở.
5. Bật **Mạng ẩn** nếu WiFi của bạn không hiển thị tên.
6. Chọn mẫu, khung "Quét để kết nối WiFi", thêm logo quán rồi tải về.

> **Mẹo:** Không chắc kiểu bảo mật? Hãy chọn WPA. Đây là lựa chọn đúng cho gần như mọi router sản xuất trong 10 năm trở lại đây.

## Cách quét mã QR WiFi

- **iPhone**: mở ứng dụng Camera, hướng vào mã, bấm thông báo "Kết nối mạng" hiện ra.
- **Android**: mở Camera hoặc Google Lens. Trên nhiều máy, vào **Cài đặt → WiFi → biểu tượng quét QR** cạnh mục Thêm mạng.
- **Samsung**: dùng Camera hoặc biểu tượng quét QR trong bảng thông báo nhanh.

Xem chi tiết từng dòng máy trong bài [cách quét mã QR trên điện thoại và máy tính](/vi/blog/cach-quet-ma-qr).

## Lấy mã QR WiFi có sẵn trên điện thoại

Nếu điện thoại của bạn đã kết nối WiFi, bạn có thể hiện mã QR để chia sẻ nhanh:

- **Android**: Cài đặt → WiFi → bấm vào mạng đang kết nối → **Chia sẻ**.
- **iPhone (iOS 18 trở lên)**: mở ứng dụng **Mật khẩu** → WiFi → chọn mạng → **Hiển thị mã QR mạng**.

Tuy nhiên mã này chỉ hiện trên màn hình. Muốn in đẹp, có logo và khung để dán ở quầy, hãy tạo mã bằng [công cụ của chúng tôi](/vi/qr/wifi) và tải về dạng SVG.

## Mẹo bảo mật khi chia sẻ WiFi bằng mã QR

- Ai cầm được mã cũng đọc được mật khẩu, nên hãy dùng **mạng khách (Guest)** riêng, tách khỏi mạng nội bộ có máy tính, camera, máy in.
- Khi **đổi mật khẩu WiFi**, nhớ tạo và in lại mã mới, nếu không khách sẽ không kết nối được.
- Ở khách sạn, mỗi phòng có thể dùng mạng riêng; ở văn phòng, đừng dán mã mạng nội bộ ở khu vực tiếp khách.

## Ý tưởng đặt mã QR WiFi

- Quầy thu ngân, mặt bàn, menu ở quán cà phê, nhà hàng.
- Thẻ phòng, bàn làm việc trong phòng khách sạn, homestay.
- Phòng họp, khu tiếp khách văn phòng.
- Cửa tủ lạnh hoặc phòng khách ở nhà khi có bạn bè đến chơi.

Đặt mã ở độ cao ngang tầm mắt, in tối thiểu **3 × 3 cm** và chừa lề trắng quanh mã. Đọc thêm [mẹo in mã QR](/vi/blog/meo-in-ma-qr) để mã luôn quét nhạy.
`,
    },
    en: {
      slug: "wifi-qr-code",
      title: "How to Create a WiFi QR Code So Guests Connect Without a Password",
      description:
        "Make a free WiFi QR code for your café, hotel, office or home. How it works, how to scan it on iPhone and Android, and security tips for sharing WiFi.",
      body: `
"What's the WiFi password?" is probably the most common question in cafés, hotels and offices. With a **WiFi QR code**, guests open their camera, scan and connect instantly, with no spelling out long passwords. Here is how to create one, how to scan it and how to share WiFi safely.

## How does a WiFi QR code work?

A WiFi QR code stores the network name (SSID), security type and password in a standard format that both iPhone and Android understand, for example:

**WIFI:T:WPA;S:SunnyCafe;P:password123;;**

When scanned, the phone shows a "Join network SunnyCafe" prompt and connects with one tap. Because it is a [static QR code](/en/blog/static-vs-dynamic-qr-codes), it works even before the phone is online, which is exactly when your guest needs it.

## How to create a WiFi QR code

1. Open the [WiFi QR code generator](/en/qr/wifi).
2. Enter the exact **network name (SSID)**; it is case-sensitive.
3. Enter the **password**.
4. Choose the **encryption**: WPA/WPA2/WPA3 for almost every modern router, WEP for very old ones, or "No password" for open networks.
5. Turn on **Hidden network** if your WiFi does not broadcast its name.
6. Pick a template, add a "Scan to join WiFi" frame and your logo, then download.

> **Tip:** Not sure which security type you use? Choose WPA. It is right for nearly every router made in the last decade.

## How to scan a WiFi QR code

- **iPhone**: open the Camera app, point it at the code and tap the "Join network" banner.
- **Android**: open the Camera or Google Lens. On many phones you can also go to **Settings → WiFi → QR icon** next to Add network.
- **Samsung**: use the Camera or the QR scanner tile in Quick Settings.

See more devices in [how to scan a QR code](/en/blog/how-to-scan-a-qr-code).

## Show a WiFi QR code from your phone

If your phone is already connected, you can display a QR code to share the network:

- **Android**: Settings → WiFi → tap the connected network → **Share**.
- **iPhone (iOS 18 and later)**: open the **Passwords** app → WiFi → choose the network → **Show Network QR Code**.

That code only lives on your screen, though. For a printable version with your logo and a frame for the counter, create one with our [WiFi QR generator](/en/qr/wifi) and download it as SVG.

## Security tips for sharing WiFi by QR code

- Anyone holding the code can read the password, so use a separate **guest network** isolated from computers, cameras and printers.
- When you **change the WiFi password**, create and print a new code, or guests will not be able to connect.
- In offices, never display the code for your internal network in the reception area.

## Where to put your WiFi QR code

- On the counter, tables or menus of cafés and restaurants.
- On key-card holders or desks in hotel rooms and holiday rentals.
- In meeting rooms and reception areas.
- On the fridge or in the living room at home for visiting friends.

Place it at eye level, print it at least **3 × 3 cm** and keep a white margin around it. Read our [QR code printing tips](/en/blog/qr-code-printing-tips) for more.
`,
    },
  },
};
