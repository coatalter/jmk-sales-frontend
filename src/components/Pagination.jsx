import React from "react";

export default function Pagination({
  total,
  page,
  pageSize,
  onPageSizeChange,
  onPageChange,
  pageSizeOptions = [5, 10, 25, 50, 100],
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const buildPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [];
    pages.push(1);
    const left = Math.max(2, page - 1);
    const right = Math.min(totalPages - 1, page + 1);
    if (left > 2) pages.push("...");
    for (let p = left; p <= right; p++) pages.push(p);
    if (right < totalPages - 1) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  const pages = buildPages();
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = total === 0 ? 0 : Math.min(total, (page - 1) * pageSize + pageSize);

  return (
    <div className="pagination-container">
      
      {/* KIRI: Info & Page Size */}
      <div className="flex items-center gap-3 text-sm">
        <span className="hidden sm:inline text-muted font-medium">Show</span>
        
        <div className="relative">
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
            // GUNAKAN CLASS .input-field (Sudah handle warna & hapus arrow default)
            className="input-field w-20 py-2 pl-3 pr-8 font-medium cursor-pointer"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          {/* Custom Arrow SVG (Warna ikut text-muted) */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>
        
        <span className="hidden sm:inline text-muted font-medium">rows</span>
        
        <span className="h-4 w-px bg-current opacity-20 mx-2 hidden sm:block" style={{backgroundColor: 'var(--border-color)'}}></span>
        
        <span className="text-muted">
           <span className="font-bold text-main">{start}-{end}</span> of <span className="font-bold text-main">{total}</span>
        </span>
      </div>

      {/* KANAN: Tombol Navigasi */}
      <div className="flex items-center gap-1.5">
        <button 
          onClick={() => onPageChange(page - 1)} 
          disabled={page === 1} 
          className="pagination-btn px-4 w-auto"
        >
          Previous
        </button>

        <div className="hidden sm:flex items-center gap-1.5 mx-1">
          {pages.map((p, idx) =>
            p === "..." ? (
              <span key={idx} className="px-1 text-muted text-xs">•••</span>
            ) : (
              <button
                key={idx}
                onClick={() => onPageChange(p)}
                // Class ditentukan sepenuhnya di index.css
                className={p === page ? "pagination-current" : "pagination-btn"}
              >
                {p}
              </button>
            )
          )}
        </div>

        <button 
          onClick={() => onPageChange(page + 1)} 
          disabled={page === totalPages} 
          className="pagination-btn px-4 w-auto"
        >
          Next
        </button>
      </div>
    </div>
  );
}