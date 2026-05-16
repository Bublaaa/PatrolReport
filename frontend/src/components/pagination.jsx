import { MoveLeft, MoveRight } from "lucide-react";
import Button from "./button";

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}) => {
  const generatePages = () => {
    const pages = [];

    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    // for (let i = startPage; i <= endPage; i++) {
    //   pages.push(i);
    // }
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div
      className={`
        flex flex-wrap items-center gap-2 md:gap-5 mt-5
        ${className}
      `}
    >
      {/* PREV BUTTON */}
      <Button
        buttonSize="icon"
        buttonType={currentPage === 1 ? "disabled" : "primary"}
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        icon={MoveLeft}
      />

      {/* PAGE BUTTONS */}
      {generatePages().map((page) => (
        <Button
          key={page}
          buttonType={currentPage === page ? "primary" : "secondary"}
          onClick={() => onPageChange(page)}
        >
          {page}
        </Button>
      ))}

      {/* NEXT BUTTON */}
      <Button
        buttonSize="icon"
        buttonType={currentPage === totalPages ? "disabled" : "primary"}
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        icon={MoveRight}
      />
    </div>
  );
};

export default Pagination;

// HOW TO USE:

{
  /* <Pagination
  currentPage={currentPage}
  totalPages={pagination.totalPages}
  onPageChange={setCurrentPage}
/>; */
}
