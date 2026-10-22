import { useState } from 'react'

export const PAGE_SIZE = 10;

export default function usePagination<T>(items: T[], pageSize: number = PAGE_SIZE) {
    const [page, setPage] = useState(1);
    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
    const current = Math.min(page, totalPages);
    const pageItems = items.slice((current - 1) * pageSize, current * pageSize);
    return { page: current, totalPages, pageItems, setPage };
}
