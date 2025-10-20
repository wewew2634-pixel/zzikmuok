/**
 * Instagram API (RapidAPI 우회)
 * 
 * 공식 Instagram Graph API 대신 RapidAPI의 서드파티 API 사용
 * 로그인 없이 공개 프로필 정보 조회 가능
 * 
 * @endpoint GET /api/social/instagram?username=qetta_t
 * @endpoint GET /api/social/instagram?username=qetta_t&type=posts&count=20
 * @endpoint GET /api/social/instagram?query=fashion&type=search
 */

import { NextRequest, NextResponse } from 'next/server';
import { rapidAPI } from '@/lib/api-clients';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const query = searchParams.get('query');
    const type = searchParams.get('type') || 'profile'; // profile, posts, search
    const count = parseInt(searchParams.get('count') || '12');

    // RapidAPI 키 확인
    if (!rapidAPI.apiKey) {
      return NextResponse.json(
        {
          error: 'RapidAPI key not configured',
          message: '환경변수에 RAPIDAPI_KEY를 설정해주세요.',
          setup_guide: 'https://rapidapi.com/ 에서 무료 계정 생성 후 API 키 발급',
        },
        { status: 500 }
      );
    }

    // 검색 요청
    if (query && type === 'search') {
      const searchType = searchParams.get('searchType') as 'user' | 'hashtag' | 'place' || 'user';
      const result = await rapidAPI.searchInstagram(query, searchType);
      
      return NextResponse.json({
        success: true,
        type: 'search',
        searchType,
        query,
        data: result,
      });
    }

    // username 필수 확인
    if (!username) {
      return NextResponse.json(
        {
          error: 'Missing username parameter',
          message: 'username 파라미터가 필요합니다.',
          example: '/api/social/instagram?username=qetta_t',
        },
        { status: 400 }
      );
    }

    // 프로필 조회
    if (type === 'profile') {
      const profile = await rapidAPI.getInstagramProfile(username);
      
      return NextResponse.json({
        success: true,
        type: 'profile',
        username,
        data: profile,
      });
    }

    // 포스트 조회
    if (type === 'posts') {
      const posts = await rapidAPI.getInstagramPosts(username, count);
      
      return NextResponse.json({
        success: true,
        type: 'posts',
        username,
        count,
        data: posts,
      });
    }

    return NextResponse.json(
      {
        error: 'Invalid type parameter',
        message: 'type은 profile, posts, search 중 하나여야 합니다.',
      },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('Instagram API error:', error);
    
    return NextResponse.json(
      {
        error: 'Instagram API failed',
        message: error.message || '인스타그램 데이터를 가져오는데 실패했습니다.',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
