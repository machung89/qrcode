import type { Post } from "@/lib/blog";
import { howToScan } from "./how-to-scan";
import { printingTips } from "./printing-tips";
import { staticVsDynamic } from "./static-vs-dynamic";
import { vietqrBankTransfer } from "./vietqr-bank-transfer";
import { whatIsAQrCode } from "./what-is-a-qr-code";
import { wifiQrCode } from "./wifi-qr-code";

// Thêm bài mới: tạo file trong thư mục này rồi thêm vào danh sách dưới đây
export const posts: Post[] = [whatIsAQrCode, staticVsDynamic, vietqrBankTransfer, wifiQrCode, howToScan, printingTips];
