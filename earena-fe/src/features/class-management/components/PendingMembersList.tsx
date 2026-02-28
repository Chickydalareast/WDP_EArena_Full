'use client';

import { useState } from 'react';
import { Check, X, Users, UserCheck, Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { ClassMemberStatus } from '../types/class.schema';
import { useClassMembers } from '../hooks/useClassMembers';
import { useReviewMember } from '../hooks/useReviewMember';

interface PendingMembersListProps {
  classId: string;
}

export function PendingMembersList({ classId }: PendingMembersListProps) {
  const [activeTab, setActiveTab] = useState<ClassMemberStatus>('PENDING');

  const { data: members = [], isLoading } = useClassMembers(classId, activeTab);
  
  const { mutate: reviewMember, isPending: isReviewing } = useReviewMember(classId);

  const handleReview = (studentId: string, status: 'APPROVED' | 'REJECTED') => {
    reviewMember({ studentId, status });
  };

  return (
    <div className="space-y-6 bg-card p-6 rounded-xl border shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Quản lý Thành viên
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Duyệt yêu cầu tham gia và xem danh sách học sinh trong lớp.
          </p>
        </div>
      </div>

      <div className="flex gap-2 border-b pb-2">
        <Button
          variant={activeTab === 'PENDING' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('PENDING')}
          className="relative"
        >
          Chờ phê duyệt
          {activeTab === 'PENDING' && members.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-destructive text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-in zoom-in">
              {members.length}
            </span>
          )}
        </Button>
        <Button
          variant={activeTab === 'APPROVED' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('APPROVED')}
        >
          <UserCheck className="w-4 h-4 mr-2" />
          Đã tham gia
        </Button>
      </div>

      <div className="min-h-[200px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-2 text-primary" />
            <p>Đang tải danh sách...</p>
          </div>
        ) : members.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
            <Users className="w-8 h-8 mb-2 opacity-50" />
            <p>Không có học sinh nào trong danh sách này.</p>
          </div>
        ) : (
          <ul className="divide-y border rounded-lg overflow-hidden bg-background">
            {members.map((member) => (
              <li key={(member as any).joinRequestId} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {member.student.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold">{member.student.fullName}</p>
                    <p className="text-sm text-muted-foreground">{member.student.email}</p>
                  </div>
                </div>

                {activeTab === 'PENDING' && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:bg-destructive hover:text-white"
                      disabled={isReviewing}
                      onClick={() => handleReview(member.studentId, 'REJECTED')}
                    >
                      <X className="w-4 h-4 mr-1" /> Từ chối
                    </Button>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      disabled={isReviewing}
                      onClick={() => handleReview(member.studentId, 'APPROVED')}
                    >
                      <Check className="w-4 h-4 mr-1" /> Phê duyệt
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}