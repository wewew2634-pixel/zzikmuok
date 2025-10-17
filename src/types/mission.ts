/**
 * Mission state types
 */
export type MissionState = 
  | 'applied_pending'  // 승인 대기
  | 'approved'         // 승인 완료
  | 'submitted'        // 검수 중
  | 'rejected'         // 반려됨
  | 'completed'        // 정산 진행 중
  | 'paid';            // 정산 완료

export interface Mission {
  id: string;
  state: MissionState;
  title: string;
  description?: string;
  reward: number;
  createdAt: Date;
  updatedAt: Date;
}
