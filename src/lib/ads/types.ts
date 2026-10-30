export const placements = [
  "head",
  "body_end",
  "header_banner",
  "below_generator",
  "sidebar",
  "in_content",
  "footer_banner",
  "sticky_bottom",
] as const;
export type Placement = (typeof placements)[number];

export type Device = "all" | "desktop" | "mobile";

export type AdUnit = {
  id: string;
  name: string;
  /** Tên mạng quảng cáo, chỉ để ghi nhớ (AdSense, Adsterra, ...) */
  network: string;
  placement: Placement;
  /** Mã HTML/JS do mạng quảng cáo cung cấp */
  code: string;
  enabled: boolean;
  device: Device;
  /** Danh sách locale hiển thị; rỗng = mọi ngôn ngữ */
  locales: string[];
  updatedAt: string;
};

export type AdsConfig = {
  /** Công tắc tổng bật/tắt toàn bộ quảng cáo */
  enabled: boolean;
  units: AdUnit[];
  /** Nội dung file /ads.txt */
  adsTxt: string;
};

/** Dữ liệu tối thiểu gửi xuống trình duyệt */
export type PublicAdUnit = Pick<AdUnit, "id" | "placement" | "code" | "device">;

export const emptyConfig: AdsConfig = { enabled: true, units: [], adsTxt: "" };
