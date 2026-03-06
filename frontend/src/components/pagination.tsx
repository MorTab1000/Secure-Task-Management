import '../App.css'
import { useNotes } from "../contexts/NoteContext";
import { useState, useEffect } from "react";


type PaginationProps = {
  pageNum: number;
  pages: [number, number, number, number, number];
  setPages: (pages: [number, number, number, number, number]) => void;
  last_page: number;
};



const first_page = 1;


export default function Pagination() {
  

  function setNewPage({ pageNum, setPages, last_page }: PaginationProps) {
    dispatch({ type: "setPage", page: pageNum });
    if (last_page >= 6) {
      if (pageNum < 3) {
        dispatch({ type: "updateCachePages", pages: [1, 2, 3, 4, 5] });
        setPages([1, 2, 3, 4, 5]);
      }
      else if (pageNum >= 3 && pageNum <= last_page - 2) {
        dispatch({ type: "updateCachePages", pages: [pageNum - 2, pageNum - 1, pageNum, pageNum + 1, pageNum + 2] });
        setPages([pageNum - 2, pageNum - 1, pageNum, pageNum + 1, pageNum + 2]);
      }
      else {
        dispatch({ type: "updateCachePages", pages: [last_page - 4, last_page - 3, last_page - 2, last_page - 1, last_page] });
        setLast_page(Math.ceil(state.totalCount / state.pageSize));
        setPages([last_page - 4, last_page - 3, last_page - 2, last_page - 1, last_page]);
      }
    }
  }


  const { state, dispatch } = useNotes();
  const { currentPage } = state;
  const [last_page, setLast_page] = useState(Math.ceil(state.totalCount / state.pageSize));
  const [pages, setPages] = useState<[number, number, number, number, number]>([1, 2, 3, 4, 5]);

useEffect(() => {
  const updatedLastPage = Math.max(1, Math.ceil(state.totalCount / state.pageSize)); 
  setLast_page(updatedLastPage);
  if (currentPage >=3 && currentPage >= updatedLastPage - 2 && updatedLastPage >= 6) {
        setPages([updatedLastPage - 4, updatedLastPage - 3, updatedLastPage - 2, updatedLastPage - 1, updatedLastPage]);
    //update cache pages
    dispatch({ type: "updateCachePages", pages: [updatedLastPage - 4, updatedLastPage - 3, updatedLastPage - 2, updatedLastPage - 1, updatedLastPage] });
  }
  else if (updatedLastPage <= 5) {
    setPages([1, 2, 3, 4, 5]);
    //update cache pages
    dispatch({ type: "updateCachePages", pages: [1, 2, 3, 4, 5] });
  }
}, [state.totalCount]); 

  return <> <div>
    <button disabled={currentPage === first_page}
      onClick={() => {
        dispatch({type: 'updateCachePages', pages: [1, 2, 3, 4, 5]});
        dispatch({ type: "setPage", page: first_page });
        setPages([1, 2, 3, 4, 5]);
      }}
      className="page" name="first">First</button>

    <button disabled={currentPage === first_page}
      onClick={() => {
        const pageNum = currentPage - 1;
        setNewPage({ pageNum, pages, setPages, last_page });
      }}
      className="page"
      name="previous">Previous
    </button>

    {pages
      .filter(page => page <= last_page) // Only include valid pages
      .map((page, index) => (
        <button
          disabled={currentPage === page}
          className={`page ${page === currentPage ? 'active' : ''}`}
          onClick={(e) => {
            const pageNum = page;
            (e.target as HTMLButtonElement).blur();
            setNewPage({ pageNum, pages, setPages, last_page });
          }}
          key={index}
          name={`page-${page}`}
        >
          {page}
        </button>
      ))}

    <button
      disabled={currentPage === last_page}
      onClick={() => {
        const pageNum = currentPage + 1;
        setNewPage({ pageNum, pages, setPages, last_page });
      }}
      className="page"
      name="next">Next</button>

    <button disabled={currentPage === last_page}
      onClick={() => {
        dispatch({ type: "setPage", page: last_page });
        setNewPage({ pageNum: last_page, pages, setPages, last_page});
      }}
      className="page"
      name="last">Last</button>
  </div></>
}