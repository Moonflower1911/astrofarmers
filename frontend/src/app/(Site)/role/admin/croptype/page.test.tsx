// src/app/(Site)/role/admin/croptype/page.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import CropPage from './page';

// Mock the AdminLayout component to simplify testing
jest.mock('@/components/Layouts/AdminLayout', () => {
  const MockAdminLayout = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="admin-layout">{children}</div>
  );
  MockAdminLayout.displayName = 'AdminLayout'; // Add this line
  return MockAdminLayout;
});

// Mock any hooks that might be causing issues
jest.mock('@/hooks/useLocalStorage', () => ({
  __esModule: true,
  default: () => ['mock-token', jest.fn()],
}));

describe('CropPage', () => {
  beforeEach(() => {
    // Mock fetch globally
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    ) as jest.Mock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders without crashing', async () => {
    render(<CropPage />);

    // Basic test that just checks if the component renders
    await waitFor(() => {
      expect(screen.getByTestId('admin-layout')).toBeInTheDocument();
    });
  });


  // Example: Test error handling
  test('shows error message when API fails', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API failed'));
    render(<CropPage />);
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  test('displays crops data', async () => {
    const mockCrops = [{ id: 1, name: 'Wheat' }];
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockCrops),
    });

    render(<CropPage />);
    await waitFor(() => {
      expect(screen.getByText('Wheat')).toBeInTheDocument();
    });
  });



});