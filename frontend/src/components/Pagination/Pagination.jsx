import React, { useMemo, useEffect } from "react";

const Pagination = ({ currentPage, totalPages, handlePageChange }) => {
  useEffect(() => {
    if (currentPage < 1) handlePageChange(1);
    if (currentPage > totalPages) handlePageChange(totalPages);
  }, [currentPage, totalPages, handlePageChange]);

  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxPages = 5;

    if (totalPages <= maxPages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        endPage = 4;
      }

      if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3;
      }

      if (startPage > 2) {
        pages.push("...");
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages - 1) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center flex-wrap gap-2 py-6">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium min-w-[80px] ${
          currentPage === 1
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-600 text-white transition-colors"
        }`}
        aria-label="Previous page"
      >
        ← Previous
      </button>

      <div className="flex items-center gap-1 mx-2">
        {pageNumbers.map((number, index) =>
          number === "..." ? (
            <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">
              ...
            </span>
          ) : (
            <button
              key={`page-${number}`}
              onClick={() => handlePageChange(number)}
              aria-label={`Go to page ${number}`}
              aria-current={currentPage === number ? "page" : undefined}
              className={`flex items-center justify-center w-10 h-10 rounded-md text-sm font-medium ${
                currentPage === number
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              }`}
            >
              {number}
            </button>
          )
        )}
      </div>

      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium min-w-[80px] ${
          currentPage === totalPages
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-600 text-white transition-colors"
        }`}
        aria-label="Next page"
      >
        Next →
      </button>

      <div className="ml-4 text-sm text-gray-600 hidden md:block">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
};

export default Pagination;
