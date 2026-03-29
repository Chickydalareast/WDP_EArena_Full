export interface ApiError {
  statusCode: number;
  message: string;
  code?: string;
  details?: any;
}

export const parseApiError = (error: any): ApiError => {
  if (error && error.statusCode !== undefined && error.message !== undefined) {
    return error as ApiError;
  }

  const defaultError: ApiError = {
    statusCode: 500,
    message: 'Lỗi hệ thống không xác định. Vui lòng thử lại sau.',
    code: 'UNKNOWN_ERROR',
  };

  if (error?.response) {
    const data = error.response.data;
    const status = error.response.status;

    let errorMessage = defaultError.message;

    if (data && typeof data === 'object') {
      // 1. Trả về là mảng (Validation Errors)
      if (Array.isArray(data.message) && data.message.length > 0) {
        errorMessage = data.message[0];
      } 
      // 2. Trả về là chuỗi trực tiếp
      else if (typeof data.message === 'string') {
        errorMessage = data.message;
      } 
      // 3. (BẢN VÁ) Trả về là một Object bọc bên trong (Trường hợp của bạn hiện tại)
      else if (typeof data.message === 'object' && data.message !== null) {
        const nestedMessage = data.message.message || data.message.error;
        if (Array.isArray(nestedMessage)) {
            errorMessage = nestedMessage[0];
        } else if (typeof nestedMessage === 'string') {
            errorMessage = nestedMessage;
        }
      } 
      // 4. Fallback đọc field error
      else if (typeof data.error === 'string') {
        errorMessage = data.error;
      }
    }

    return {
      statusCode: status,
      message: errorMessage,
      code: data?.code || data?.error || 'API_ERROR',
      details: data,
    };
  }

  if (error?.request) {
    return {
      statusCode: 0,
      message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra đường truyền mạng.',
      code: 'NETWORK_ERROR',
    };
  }

  return {
    ...defaultError,
    message: error?.message || defaultError.message,
  };
};