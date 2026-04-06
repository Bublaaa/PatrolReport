import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";

const ReportCalendar = ({ reportsByDate }) => {
  const [tooltip, setTooltip] = useState(null);

  const handleMouseMove = (e, date) => {
    const count = reportsByDate?.[date] || 0;

    setTooltip({
      x: e.pageX,
      y: e.pageY,
      content:
        count > 0 ? `${count} report${count > 1 ? "s" : ""}` : "No reports",
    });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  return (
    <div className="relative">
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        height="auto"
        headerToolbar={false}
        dayCellDidMount={(info) => {
          const date = info.date.toISOString().split("T")[0];
          const count = reportsByDate?.[date] || 0;

          // Highlight days with reports
          if (count > 0) {
            info.el.classList.add(
              "bg-blue-50",
              "hover:bg-blue-100",
              "transition",
              "cursor-pointer",
            );
          }

          // Hover behaviour
          info.el.addEventListener("mousemove", (e) =>
            handleMouseMove(e, date),
          );

          info.el.addEventListener("mouseleave", handleMouseLeave);
        }}
      />

      {tooltip && (
        <div
          className="fixed z-50 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg pointer-events-none transition-all duration-75"
          style={{
            top: tooltip.y + 12,
            left: tooltip.x + 12,
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
};

export default ReportCalendar;
