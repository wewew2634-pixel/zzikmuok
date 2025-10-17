'use client';

import React, { useState, useEffect } from 'react';
import { useMissionBanners } from '../../../components/mission/useMissionBanners';
import { GuidelineDrawer } from '../../../components/guideline/GuidelineDrawer';
import { trackEvent } from '../../../lib/analytics/events';
import type { MissionState } from '../../../types/mission';

interface MissionDetailProps {
  params: {
    id: string;
  };
}

export default function MissionDetailPage({ params }: MissionDetailProps) {
  const [missionState, setMissionState] = useState<MissionState>('draft');
  const [isGuidelineOpen, setIsGuidelineOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Activate banner system based on mission state
  useMissionBanners(missionState);

  useEffect(() => {
    // Simulate fetching mission data
    const fetchMission = async () => {
      try {
        // In production, fetch from API: /api/missions/${params.id}
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock mission state (replace with actual API call)
        const mockState: MissionState = 'draft';
        setMissionState(mockState);
        setLoading(false);

        // Track page view
        trackEvent('mission_detail_viewed', {
          mission_id: params.id,
          state: mockState,
        });
      } catch (error) {
        console.error('Failed to fetch mission:', error);
        setLoading(false);
      }
    };

    fetchMission();
  }, [params.id]);

  const handleStateChange = (newState: MissionState) => {
    setMissionState(newState);
    
    // Track state change
    trackEvent('mission_state_changed', {
      mission_id: params.id,
      from_state: missionState,
      to_state: newState,
    });
  };

  const handleOpenGuideline = () => {
    setIsGuidelineOpen(true);
    trackEvent('guideline_opened', {
      mission_id: params.id,
      state: missionState,
      source: 'mission_detail',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-on-surface-variant">Loading mission...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hidden trigger for banner action button */}
      <button
        id="open-guideline"
        onClick={handleOpenGuideline}
        className="hidden"
        aria-hidden="true"
      />

      {/* Mission Header */}
      <div className="bg-surface-container rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-on-surface">
            Mission #{params.id}
          </h1>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              missionState === 'approved'
                ? 'bg-green-100 text-green-800'
                : missionState === 'rejected'
                ? 'bg-red-100 text-red-800'
                : missionState === 'applied_pending'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {missionState.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        <p className="text-on-surface-variant mb-4">
          Medical AI 크로스 검증 미션입니다. 가이드라인을 참고하여 제출해주세요.
        </p>

        {/* State Simulator (for demo purposes) */}
        <div className="border-t pt-4">
          <p className="text-sm font-medium mb-2">상태 시뮬레이터 (테스트용):</p>
          <div className="flex flex-wrap gap-2">
            {['draft', 'applied_pending', 'approved', 'submitted', 'rejected', 'completed', 'paid'].map(
              (state) => (
                <button
                  key={state}
                  onClick={() => handleStateChange(state as MissionState)}
                  className={`px-3 py-1 rounded text-sm ${
                    missionState === state
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-variant text-on-surface-variant hover:bg-primary-container'
                  }`}
                >
                  {state}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Mission Content */}
      <div className="bg-surface-container rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">미션 상세</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-on-surface mb-2">작업 설명</h3>
            <p className="text-on-surface-variant">
              FDA PCCP 규정을 준수하는 의료 AI 모델 검증 작업입니다.
              가이드라인에 따라 정확도, 안전성, 지연시간을 분리하여 측정해주세요.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-on-surface mb-2">요구사항</h3>
            <ul className="list-disc list-inside space-y-1 text-on-surface-variant">
              <li>정확도 (Accuracy) ≥ 0.95</li>
              <li>안전도 (Safety Score) ≥ 0.998</li>
              <li>지연시간 P95 ≤ 100ms</li>
              <li>PCCP 감사 로그 제출</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-on-surface mb-2">보상</h3>
            <p className="text-on-surface-variant">
              성공 시 50,000원 + 품질 보너스 최대 20,000원
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleOpenGuideline}
            className="px-4 py-2 bg-primary text-on-primary rounded hover:bg-primary-container hover:text-on-primary-container transition-colors"
          >
            가이드 보기
          </button>
          <button
            onClick={() => handleStateChange('applied_pending')}
            className="px-4 py-2 bg-secondary text-on-secondary rounded hover:opacity-90 transition-opacity"
            disabled={missionState === 'applied_pending'}
          >
            제출하기
          </button>
        </div>
      </div>

      {/* Guideline Drawer */}
      <GuidelineDrawer
        open={isGuidelineOpen}
        onClose={() => {
          setIsGuidelineOpen(false);
          trackEvent('guideline_closed', {
            mission_id: params.id,
            state: missionState,
          });
        }}
      />
    </div>
  );
}
