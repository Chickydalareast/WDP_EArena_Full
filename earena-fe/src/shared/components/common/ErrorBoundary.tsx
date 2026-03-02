'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Cập nhật state để render fallback UI trong lần render tiếp theo
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Nơi này sau này (Phase 4) sẽ được tích hợp với Sentry hoặc Datadog để log lỗi hệ thống
    console.error('[ErrorBoundary caught an error]:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      // Cho phép truyền custom fallback UI từ bên ngoài
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default Fallback UI
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-red-50 border border-red-200 rounded-lg min-h-[200px]">
          <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
          <h2 className="text-lg font-bold text-destructive mb-2">Thành phần này gặp sự cố</h2>
          <p className="text-sm text-red-600 mb-6 text-center max-w-sm">
            {this.state.error?.message || 'Không thể tải dữ liệu tại khu vực này. Vui lòng thử lại.'}
          </p>
          <Button variant="outline" onClick={this.handleReset} className="border-red-300 text-red-700 hover:bg-red-100">
            Thử lại
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}