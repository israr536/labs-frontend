import { ChevronLeft, ChevronRight } from 'lucide-react';

type Props = { page: number; pageSize: number; total: number; onPageChange: (page: number) => void; label?: string };

export default function Pagination({ page, pageSize, total, onPageChange, label = 'records' }: Props) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  if (total <= pageSize) return null;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const pages = Array.from(new Set([1, page - 1, page, page + 1, pageCount].filter((value) => value >= 1 && value <= pageCount)));
  return <nav className="workspace-pagination" aria-label={`${label} pagination`}><span>Showing <strong>{start}–{end}</strong> of <strong>{total}</strong> {label}</span><div className="workspace-pagination-controls"><button type="button" onClick={() => onPageChange(page - 1)} disabled={page === 1} aria-label="Previous page"><ChevronLeft size={15} /> Previous</button>{pages.map((item, index) => <span key={item}>{index > 0 && item > pages[index - 1] + 1 && <i aria-hidden="true">…</i>}<button type="button" className={item === page ? 'is-current' : ''} onClick={() => onPageChange(item)} aria-current={item === page ? 'page' : undefined} aria-label={`Page ${item}`}>{item}</button></span>)}<button type="button" onClick={() => onPageChange(page + 1)} disabled={page === pageCount} aria-label="Next page">Next <ChevronRight size={15} /></button></div></nav>;
}
