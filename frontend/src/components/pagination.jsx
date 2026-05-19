import { MoveLeft, MoveRight } from "lucide-react";
import Button from "./button";

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}) => {
  const pages = [];

  const hasNoData = totalPages === 0;
  const isPrevDisabled = currentPage <= 1 || hasNoData;
  const isNextDisabled = currentPage >= totalPages || hasNoData;

  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

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
        buttonType={isPrevDisabled ? "disabled" : "primary"}
        disabled={isPrevDisabled}
        onClick={() => onPageChange(currentPage - 1)}
        icon={MoveLeft}
      />

      {/* PAGE BUTTONS */}
      {pages.map((page) => (
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
        buttonType={isNextDisabled ? "disabled" : "primary"}
        disabled={isNextDisabled}
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
