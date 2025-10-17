/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BannerProvider, useBanner } from '@/components/system/BannerProvider';

function DemoComponent() {
  const b = useBanner();
  return (
    <>
      <button onClick={()=>b.push({id:'test-info', kind:'info', title:'Hello', sticky:true})}>
        push info
      </button>
      <button onClick={()=>b.push({id:'test-success', kind:'success', title:'Success!', ttlMs:3000})}>
        push success
      </button>
      <button onClick={()=>b.dismiss('test-info')}>
        dismiss
      </button>
      <button onClick={()=>b.clear()}>
        clear all
      </button>
    </>
  );
}

describe('BannerProvider', () => {
  it('shows persistent banner when pushed', async () => {
    render(
      <BannerProvider>
        <DemoComponent />
      </BannerProvider>
    );
    
    fireEvent.click(screen.getByText('push info'));
    
    const banner = await screen.findByRole('region', {name: '알림 배너'});
    expect(banner).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
  
  it('dismisses banner when close button clicked', async () => {
    render(
      <BannerProvider>
        <DemoComponent />
      </BannerProvider>
    );
    
    fireEvent.click(screen.getByText('push success'));
    
    const banner = await screen.findByRole('region', {name: '알림 배너'});
    expect(banner).toBeInTheDocument();
    
    const closeButton = screen.getByLabelText('배너 닫기');
    fireEvent.click(closeButton);
    
    expect(screen.queryByRole('region', {name: '알림 배너'})).not.toBeInTheDocument();
  });
  
  it('clears all banners when clear() called', async () => {
    render(
      <BannerProvider>
        <DemoComponent />
      </BannerProvider>
    );
    
    fireEvent.click(screen.getByText('push info'));
    await screen.findByRole('region', {name: '알림 배너'});
    
    fireEvent.click(screen.getByText('clear all'));
    
    expect(screen.queryByRole('region', {name: '알림 배너'})).not.toBeInTheDocument();
  });
  
  it('shows only 1 banner at a time (anti-spam)', async () => {
    render(
      <BannerProvider>
        <DemoComponent />
      </BannerProvider>
    );
    
    fireEvent.click(screen.getByText('push info'));
    fireEvent.click(screen.getByText('push success'));
    
    const banners = screen.queryAllByRole('region', {name: '알림 배너'});
    expect(banners.length).toBe(1);
  });
  
  it('throws error when useBanner used outside provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<DemoComponent />);
    }).toThrow('useBanner must be used inside <BannerProvider/>');
    
    consoleError.mockRestore();
  });
});
