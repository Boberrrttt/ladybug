import QRCode from "qrcode";

export function toDataUrl(absoluteGuestUrl: string) {
  return QRCode.toDataURL(absoluteGuestUrl, { width: 512, margin: 1 });
}
