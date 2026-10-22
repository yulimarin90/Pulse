
interface PaginationProps {
    page: number;
    totalPages: number;
    onChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onChange }: PaginationProps) {
    if (totalPages <= 1) return null;
    return (
        <nav className="pagination" aria-label="Pagination">
            <button type="button" disabled={page ===1} onClick={() => onChange(page - 1)}>Previous page</button>
            <span>Page {page} of {totalPages}</span>
            <button type="button" disabled={page === totalPages} onClick={() => onChange(page + 1)}>Next page</button>
        </nav>
    );
}