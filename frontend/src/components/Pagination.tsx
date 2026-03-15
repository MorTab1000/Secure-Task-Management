import '../App.css'
import { useState, useEffect } from "react";


type PaginationProps = {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (newPage: number, newCachePages: [number, number, number, number, number]) => void;
};


const firstPage = 1;


export default function Pagination({ currentPage, totalCount, pageSize, onPageChange }: PaginationProps) {

  const lastPage = Math.max(1, Math.ceil(totalCount / pageSize));
  const [pages, setPages] = useState<[number, number, number, number, number]>([1, 2, 3, 4, 5]);

function setNewPage(pageNum: number): [number, number, number, number, number] {
    if (lastPage >= 6) {
      if (pageNum < 3) {
        setPages([1, 2, 3, 4, 5]);
        return [1, 2, 3, 4, 5];
      } else if (pageNum >= 3 && pageNum <= lastPage - 2) {
        const newPages: [number, number, number, number, number] = [pageNum - 2, pageNum - 1, pageNum, pageNum + 1, pageNum + 2];
        setPages(newPages);
        return newPages;
      } else {
        const newPages: [number, number, number, number, number] = [lastPage - 4, lastPage - 3, lastPage - 2, lastPage - 1, lastPage];
        setPages(newPages);
        return newPages;
      }
    }
        const fallbackPages: [number, number, number, number, number] = [1, 2, 3, 4, 5];
    setPages(fallbackPages);
    return fallbackPages;
  }

useEffect(() => {
    if (lastPage <= 5) {
      setPages([1, 2, 3, 4, 5]);
    } 
    else if (currentPage < 3) {
      setPages([1, 2, 3, 4, 5]);
    } 
    else if (currentPage >= lastPage - 2) {
      setPages([lastPage - 4, lastPage - 3, lastPage - 2, lastPage - 1, lastPage]);
    } 
    else {
      setPages([currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2]);
    }
  }, [totalCount, currentPage, lastPage]);

  return <> <div>
    <button disabled={currentPage === firstPage}
      onClick={() => {
        onPageChange(firstPage, [1, 2, 3, 4, 5]);
        setPages([1, 2, 3, 4, 5]);
      }}
      className="page" name="first">First</button>

    <button disabled={currentPage === firstPage}
      onClick={() => {
        const pageNum = currentPage - 1;
        const newPages = setNewPage(pageNum);
        onPageChange(pageNum, newPages);
      }}
      className="page"
      name="previous">Previous
    </button>

    {pages
      .filter(page => page <= lastPage)
      .map((page, _) => (
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
      disabled={currentPage === lastPage}
      onClick={() => {
        const pageNum = currentPage + 1;
        const newPages = setNewPage(pageNum);
        onPageChange(pageNum, newPages);
      }}
      className="page"
      name="next">Next</button>

    <button disabled={currentPage === lastPage}
      onClick={() => {
        const newPages = setNewPage(lastPage);
        onPageChange(lastPage, newPages);
      }}
      className="page"
      name="last">Last</button>
  </div></>
}
