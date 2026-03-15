import '../App.css'


type PaginationProps = {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (newPage: number, newCachePages: number[]) => void;
};


const firstPage = 1;

function getPageWindow(page: number, lastPage: number): number[] {
  if (lastPage <= 5) {
    return [1, 2, 3, 4, 5];
  } else if (page < 3) {
    return [1, 2, 3, 4, 5];
  } else if (page >= lastPage - 2) {
    return [lastPage - 4, lastPage - 3, lastPage - 2, lastPage - 1, lastPage];
  } else {
    return [page - 2, page - 1, page, page + 1, page + 2];
  }
}

export default function Pagination({ currentPage, totalCount, pageSize, onPageChange }: PaginationProps) {

  const lastPage = Math.max(1, Math.ceil(totalCount / pageSize));
  const pages = getPageWindow(currentPage, lastPage);

  const handlePageClick = (newPage: number) => {
    const nextCachePages = getPageWindow(newPage, lastPage);
    onPageChange(newPage, nextCachePages);
  };

  return <div>
    <button disabled={currentPage === firstPage}
      onClick={() => {
        handlePageClick(firstPage);
      }}
      className="page" name="first">First</button>

    <button disabled={currentPage === firstPage}
      onClick={() => {
        handlePageClick(currentPage - 1);
      }}
      className="page"
      name="previous">Previous
    </button>

    {pages
      .filter(page => page <= lastPage)
      .map((page) => (
        <button
          disabled={currentPage === page}
          className={`page ${page === currentPage ? 'active' : ''}`}
          onClick={(e) => {
            (e.target as HTMLButtonElement).blur();
            handlePageClick(page);
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
       handlePageClick(currentPage + 1);
      }}
      className="page"
      name="next">Next</button>

    <button disabled={currentPage === lastPage}
      onClick={() => {
        handlePageClick(lastPage);
      }}
      className="page"
      name="last">Last</button>
  </div>
}
