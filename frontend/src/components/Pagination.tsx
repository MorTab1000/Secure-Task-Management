import '../App.css'
import { useState, useEffect } from "react";


type PaginationProps = {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (newPage: number, newCachePages: [number, number, number, number, number]) => void;
};


const first_page = 1;


export default function Pagination({ currentPage, totalCount, pageSize, onPageChange }: PaginationProps) {

  const last_page = Math.max(1, Math.ceil(totalCount / pageSize));
  const [pages, setPages] = useState<[number, number, number, number, number]>([1, 2, 3, 4, 5]);

function setNewPage(pageNum: number): [number, number, number, number, number] {
    if (last_page >= 6) {
      if (pageNum < 3) {
        setPages([1, 2, 3, 4, 5]);
        return [1, 2, 3, 4, 5];
      } else if (pageNum >= 3 && pageNum <= last_page - 2) {
        const newPages: [number, number, number, number, number] = [pageNum - 2, pageNum - 1, pageNum, pageNum + 1, pageNum + 2];
        setPages(newPages);
        return newPages;
      } else {
        const newPages: [number, number, number, number, number] = [last_page - 4, last_page - 3, last_page - 2, last_page - 1, last_page];
        setPages(newPages);
        return newPages;
      }
    }
        const fallbackPages: [number, number, number, number, number] = [1, 2, 3, 4, 5];
    setPages(fallbackPages);
    return fallbackPages;
  }

  useEffect(() => {
    if (currentPage >= 3 && currentPage >= last_page - 2 && last_page >= 6) {
      setPages([last_page - 4, last_page - 3, last_page - 2, last_page - 1, last_page]);
    } else if (last_page <= 5) {
      setPages([1, 2, 3, 4, 5]);
    }
  }, [totalCount, currentPage, last_page]);

  return <> <div>
    <button disabled={currentPage === first_page}
      onClick={() => {
        onPageChange(first_page, [1, 2, 3, 4, 5]);
        setPages([1, 2, 3, 4, 5]);
      }}
      className="page" name="first">First</button>

    <button disabled={currentPage === first_page}
      onClick={() => {
        const pageNum = currentPage - 1;
        const newPages = setNewPage(pageNum);
        onPageChange(pageNum, newPages);
      }}
      className="page"
      name="previous">Previous
    </button>

    {pages
      .filter(page => page <= last_page)
      .map((page, index) => (
        <button
          disabled={currentPage === page}
          className={`page ${page === currentPage ? 'active' : ''}`}
          onClick={(e) => {
            (e.target as HTMLButtonElement).blur();
            const newPages = setNewPage(page);
            onPageChange(page, newPages);
          }}
          key={page}
          name={`page-${page}`}
        >
          {page}
        </button>
      ))}

    <button
      disabled={currentPage === last_page}
      onClick={() => {
        const pageNum = currentPage + 1;
        const newPages = setNewPage(pageNum);
        onPageChange(pageNum, newPages);
      }}
      className="page"
      name="next">Next</button>

    <button disabled={currentPage === last_page}
      onClick={() => {
        const newPages = setNewPage(last_page);
        onPageChange(last_page, newPages);
      }}
      className="page"
      name="last">Last</button>
  </div></>
}
