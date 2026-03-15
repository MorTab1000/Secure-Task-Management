import NotesList from '../components/NotesList';
import Pagination from '../components/Pagination';
import { useNotes } from '../contexts/NoteContext';

export default function HomePage() {
  const { state, dispatch } = useNotes();

  function handlePageChange(newPage: number, newCachePages: number[]) {
    dispatch({ type: 'updateCachePages', pages: newCachePages });
    dispatch({ type: 'setPage', page: newPage });
  }

  return (
    <main>
      <h1>My Notes</h1>
      <NotesList />
      <Pagination
        currentPage={state.currentPage}
        totalCount={state.totalCount}
        pageSize={state.pageSize}
        onPageChange={handlePageChange}
      />
    </main>
  );
}
