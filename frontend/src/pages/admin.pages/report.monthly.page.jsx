import { Loader } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useReportStore } from "../../stores/report.store";
import { useParams } from "react-router-dom";
import ReportCalendar from "../../components/calendar.jsx";

const MonthlyReportPage = () => {
  const { month } = useParams();

  //* USE STORE
  const {
    isLoading,
    error,
    reports,
    monthlyReports,
    fetchReportDetailByMonth,
    downloadPDF,
  } = useReportStore();

  //* USE EFFECT - INITIAL DATA LOAD
  useEffect(() => {
    fetchReportDetailByMonth(month);
  }, [month]);

  //* FORMAT MONTH AND YEAR
  const formatMonthYear = (monthStr) => {
    const [year, month] = monthStr.split("-");
    const date = new Date(Number(year), Number(month) - 1);
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    }).format(date);
  };

  if (isLoading) {
    return <Loader className="w-6 h-6 animate-spin mx-auto" />;
  }
  return (
    <div className="flex flex-col w-full gap-5">
      <div className="flex flex-col w-full bg-white rounded-lg px-6 py-4 shadow-md gap-5">
        <div className="flex flex-row w-full justify-between gap-5 items-center">
          <h5>Monthly Report</h5>
          <p>{formatMonthYear(month)}</p>
        </div>
        <ReportCalendar reports={monthlyReports} />
      </div>
    </div>
  );
};
export default MonthlyReportPage;
