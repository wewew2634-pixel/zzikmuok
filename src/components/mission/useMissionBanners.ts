'use client';
import { useEffect } from 'react';
import { useBanner } from '@/components/system/BannerProvider';
import type { MissionState } from '@/types/mission';

export function useMissionBanners(state: MissionState) {
  const banner = useBanner();

  useEffect(() => {
    banner.clear();
    const avg = {
      approveMin: 15,   // 평균 승인 15분
      reviewMin: 120,   // 평균 검수 2시간
      payoutHr: 24,     // P95 T+0(24h 내)
    };

    if (state === 'applied_pending') {
      banner.push({
        id: 'pending', kind: 'progress',
        title: '승인 대기 중', body: `평균 ${avg.approveMin}분 내 검토됩니다.`,
        sticky: true
      });
    }
    if (state === 'approved') {
      banner.push({
        id: 'approved', kind: 'success',
        title: '승인 완료', body: '지금 시작하면 더 빨리 정산돼요.',
        actions: [{label:'시작하기', onClick: ()=>document?.getElementById('start-mission')?.click()}]
      });
    }
    if (state === 'submitted') {
      banner.push({
        id: 'review', kind: 'info',
        title: '검수 중', body: `평균 ${avg.reviewMin}분 소요됩니다.`
      });
    }
    if (state === 'rejected') {
      banner.push({
        id: 'rejected', kind: 'warning',
        title: '반려됨', body: '가이드를 확인하고 재제출 해주세요.',
        actions: [{label:'가이드 보기', variant:'ghost',
          onClick: ()=>document?.getElementById('open-guideline')?.click()}]
      });
    }
    if (state === 'completed') {
      banner.push({
        id: 'payout', kind: 'progress',
        title: '정산 진행 중', body: 'T+0 당일 정산(최대 24h) 예상입니다.', sticky: true
      });
    }
    if (state === 'paid') {
      banner.push({ id:'paid', kind:'success', title:'정산 완료', body:'수고하셨어요! 내역은 지갑에서 확인.'});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);
}
