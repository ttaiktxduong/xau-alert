// Chỉ email này mới thấy menu Admin.
export const ADMIN_EMAILS = ["howopus1@gmail.com"];

// Đổi chuỗi này thành mật khẩu desk của bạn.
// Cần nhập lại mỗi phiên — không chỉ biết email là sửa được.
export const ADMIN_PASS = "change-this-desk-pass";

const UNLOCK_KEY = "xau-desk-unlock";

export function isAdmin(email?: string | null) {
  if (!email) return false;
  return ADMIN_EMAILS.some((item) => item.toLowerCase() === email.toLowerCase());
}

export function isAdminEmailTakenForSignup(email: string) {
  return isAdmin(email);
}

export function deskUnlocked() {
  try {
    return localStorage.getItem(UNLOCK_KEY) === "1";
  } catch {
    return false;
  }
}

export function unlockDesk(password: string) {
  if (password !== ADMIN_PASS) return false;
  try {
    localStorage.setItem(UNLOCK_KEY, "1");
  } catch {
    /* ignore */
  }
  return true;
}

export function lockDesk() {
  try {
    localStorage.removeItem(UNLOCK_KEY);
    sessionStorage.removeItem(UNLOCK_KEY);
  } catch {
    /* ignore */
  }
}
