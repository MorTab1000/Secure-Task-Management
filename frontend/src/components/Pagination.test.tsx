/// <reference types="@testing-library/jest-dom" />
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Pagination from './Pagination';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Collect the text of every rendered page-number button (excludes First/Previous/Next/Last). */
function getPageButtons(): string[] {
  return screen
    .getAllByRole('button')
    .map(b => b.textContent ?? '')
    .filter(t => /^\d+$/.test(t));
}

function renderPagination(
  currentPage: number,
  totalCount: number,
  pageSize: number,
  onPageChange = jest.fn(),
) {
  render(
    <Pagination
      currentPage={currentPage}
      totalCount={totalCount}
      pageSize={pageSize}
      onPageChange={onPageChange}
    />,
  );
  return { onPageChange };
}

// ---------------------------------------------------------------------------
// Page-window rendering
// ---------------------------------------------------------------------------

describe('page window rendering', () => {
  test('small dataset (≤5 pages): shows all pages, filters out pages beyond lastPage', () => {
    // 3 pages → lastPage=3; window is [1,2,3,4,5] but filtered to ≤3
    renderPagination(1, 30, 10);
    expect(getPageButtons()).toEqual(['1', '2', '3']);
  });

  test('exactly 5 pages: shows pages 1–5', () => {
    renderPagination(1, 50, 10);
    expect(getPageButtons()).toEqual(['1', '2', '3', '4', '5']);
  });

  test('large dataset, page 1 (page < 3): window is [1,2,3,4,5]', () => {
    renderPagination(1, 200, 10);
    expect(getPageButtons()).toEqual(['1', '2', '3', '4', '5']);
  });

  test('large dataset, page 2 (page < 3): window is [1,2,3,4,5]', () => {
    renderPagination(2, 200, 10);
    expect(getPageButtons()).toEqual(['1', '2', '3', '4', '5']);
  });

  test('large dataset, page 3 (just left of threshold): window is [1,2,3,4,5]', () => {
    // page=3: page-2=1, page-1=2, page=3, page+1=4, page+2=5
    renderPagination(3, 200, 10);
    expect(getPageButtons()).toEqual(['1', '2', '3', '4', '5']);
  });

  test('large dataset, page in middle (not near start or end): centred window', () => {
    // lastPage=20, page=10 → window [8,9,10,11,12]
    renderPagination(10, 200, 10);
    expect(getPageButtons()).toEqual(['8', '9', '10', '11', '12']);
  });

  test('large dataset, page at lastPage - 2 (end threshold): tail window', () => {
    // lastPage=20, page=18 → 18 >= 20-2=18 → [16,17,18,19,20]
    renderPagination(18, 200, 10);
    expect(getPageButtons()).toEqual(['16', '17', '18', '19', '20']);
  });

  test('large dataset, page at lastPage - 1: tail window', () => {
    // lastPage=20, page=19 → [16,17,18,19,20]
    renderPagination(19, 200, 10);
    expect(getPageButtons()).toEqual(['16', '17', '18', '19', '20']);
  });

  test('large dataset, page at lastPage: tail window', () => {
    // lastPage=20, page=20 → [16,17,18,19,20]
    renderPagination(20, 200, 10);
    expect(getPageButtons()).toEqual(['16', '17', '18', '19', '20']);
  });

  test('single page (totalCount ≤ pageSize): only page 1 is shown', () => {
    renderPagination(1, 5, 10);
    expect(getPageButtons()).toEqual(['1']);
  });
});

// ---------------------------------------------------------------------------
// Active / disabled button states
// ---------------------------------------------------------------------------

describe('button disabled states', () => {
  test('First and Previous are disabled on first page', () => {
    renderPagination(1, 200, 10);
    expect(screen.getByRole('button', { name: 'First' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
  });

  test('Last and Next are disabled on last page', () => {
    renderPagination(20, 200, 10);
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Last' })).toBeDisabled();
  });

  test('no navigation button is disabled in the middle of pagination', () => {
    renderPagination(10, 200, 10);
    expect(screen.getByRole('button', { name: 'First' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Last' })).toBeEnabled();
  });

  test('the current page button is disabled', () => {
    renderPagination(5, 200, 10);
    expect(screen.getByRole('button', { name: '5' })).toBeDisabled();
  });

  test('non-current page buttons are enabled', () => {
    renderPagination(5, 200, 10);
    ['3', '4', '6', '7'].forEach(label =>
      expect(screen.getByRole('button', { name: label })).toBeEnabled(),
    );
  });
});

// ---------------------------------------------------------------------------
// onPageChange callback — correct newPage (clamping) and newCachePages
// ---------------------------------------------------------------------------

describe('onPageChange callback', () => {
  test('clicking a page button calls onPageChange with that page and its window', async () => {
    const user = userEvent.setup();
    const { onPageChange } = renderPagination(1, 200, 10);

    await user.click(screen.getByRole('button', { name: '3' }));

    // page=3, lastPage=20 → centred window [1,2,3,4,5]
    expect(onPageChange).toHaveBeenCalledTimes(1);
    expect(onPageChange).toHaveBeenCalledWith(3, [1, 2, 3, 4, 5]);
  });

  test('clicking Next advances page and passes correct window', async () => {
    const user = userEvent.setup();
    const { onPageChange } = renderPagination(5, 200, 10);

    await user.click(screen.getByRole('button', { name: 'Next' }));

    // newPage=6, lastPage=20 → window [4,5,6,7,8]
    expect(onPageChange).toHaveBeenCalledWith(6, [4, 5, 6, 7, 8]);
  });

  test('clicking Previous decrements page and passes correct window', async () => {
    const user = userEvent.setup();
    const { onPageChange } = renderPagination(10, 200, 10);

    await user.click(screen.getByRole('button', { name: 'Previous' }));

    // newPage=9, lastPage=20 → window [7,8,9,10,11]
    expect(onPageChange).toHaveBeenCalledWith(9, [7, 8, 9, 10, 11]);
  });

  test('clicking First goes to page 1 and passes window [1,2,3,4,5]', async () => {
    const user = userEvent.setup();
    const { onPageChange } = renderPagination(10, 200, 10);

    await user.click(screen.getByRole('button', { name: 'First' }));

    expect(onPageChange).toHaveBeenCalledWith(1, [1, 2, 3, 4, 5]);
  });

  test('clicking Last goes to lastPage and passes tail window', async () => {
    const user = userEvent.setup();
    const { onPageChange } = renderPagination(5, 200, 10);

    await user.click(screen.getByRole('button', { name: 'Last' }));

    // lastPage=20 → tail window [16,17,18,19,20]
    expect(onPageChange).toHaveBeenCalledWith(20, [16, 17, 18, 19, 20]);
  });

  test('clicking Last on a small dataset goes to lastPage with filtered window', async () => {
    const user = userEvent.setup();
    // totalCount=30, pageSize=10 -> lastPage=3
    const { onPageChange } = renderPagination(1, 30, 10);

    await user.click(screen.getByRole('button', { name: 'Last' }));

    expect(onPageChange).toHaveBeenCalledWith(3, [1, 2, 3]);
  });
});

// ---------------------------------------------------------------------------
// Clamping: newPage must always be within [1, lastPage]
// ---------------------------------------------------------------------------

describe('clamping via keyboard / programmatic edge cases', () => {
  test('clicking Previous from page 2 calls onPageChange with page 1 (clamped and valid)', async () => {
    // Previous is disabled at page 1, so this tests the clamp directly by calling
    // a page-1 click while lastPage>1 — we verify the safePage guard is consistent.
    const user = userEvent.setup();
    const onPageChange = jest.fn();
    // Render with currentPage=2 so Previous is enabled; it will request page 1
    render(
      <Pagination
        currentPage={2}
        totalCount={200}
        pageSize={10}
        onPageChange={onPageChange}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Previous' }));
    const [calledPage] = onPageChange.mock.calls[0] as [number, number[]];
    expect(calledPage).toBeGreaterThanOrEqual(1);
  });

  test('clamping keeps newPage ≤ lastPage when navigating at the end', async () => {
    const user = userEvent.setup();
    const onPageChange = jest.fn();
    // currentPage = lastPage - 1 = 19; clicking Next requests 20 = lastPage
    render(
      <Pagination
        currentPage={19}
        totalCount={200}
        pageSize={10}
        onPageChange={onPageChange}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Next' }));
    const [calledPage] = onPageChange.mock.calls[0] as [number, number[]];
    expect(calledPage).toBeLessThanOrEqual(20);
  });

 test('newCachePages returned from onPageChange only contains pages ≤ lastPage', async () => {
    const user = userEvent.setup();
    const onPageChange = jest.fn();
    
    render(
      <Pagination
        currentPage={1}
        totalCount={20}
        pageSize={10}
        onPageChange={onPageChange}
      />,
    );

    await user.click(screen.getByRole('button', { name: '2' }));

    const [, cachePages] = onPageChange.mock.calls[0] as [number, number[]];
    
    expect(cachePages.every((p: number) => p <= 2)).toBe(true);
    expect(cachePages).toEqual([1, 2]); 
  });
});
