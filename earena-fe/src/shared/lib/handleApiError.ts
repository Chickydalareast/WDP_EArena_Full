import { AxiosError } from 'axios';

export interface StandardizedError {
  code: string;
  message: string;
  status: number;
}

export const handleApiError = (error: unknown): StandardizedError => {
  if (error instanceof AxiosError) {
    const status = error.response?.status || 500;
    const data = error.response?.data;

    // Bóc tách cấu trúc lỗi đặc trưng của NestJS
    const rawMessage = data?.message;
    const message = Array.isArray(rawMessage) 
      ? rawMessage[0] // Lấy lỗi validation đầu tiên nếu là mảng
      : rawMessage || error.message;

    const code = data?.code || data?.error || 'UNKNOWN_ERROR';

    switch (status) {
      case 400:
        return { status, code, message: message || 'Dữ liệu đầu vào không hợp lệ.' };
      case 401:
        return { status, code, message: 'Phiên đăng nhập hết hạn hoặc không hợp lệ.' };
      case 403:
        return { status, code, message: 'Bạn không có quyền thực hiện hành động này.' };
      case 404:
        return { status, code, message: 'Không tìm thấy tài nguyên hệ thống.' };
      case 429:
        return { status, code, message: 'Thao tác quá nhanh. Vui lòng đợi một lát.' };
      case 500:
        return { status, code, message: 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.' };
      default:
        return { status, code, message: message || 'Đã có lỗi không xác định xảy ra.' };
    }
  }

  // Fallback cho các lỗi không phải từ Axios (ví dụ lỗi runtime)
  return {
    status: 500,
    code: 'INTERNAL_CLIENT_ERROR',
    message: (error as Error).message || 'Lỗi hệ thống cục bộ.',
  };
};