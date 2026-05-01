import { useEffect, useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  DownloadIcon,
  Loader,
  Search,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { DateInput, DropdownInput } from "../../components/inputs.jsx";
import { useReportStore } from "../../stores/report.store.js";
import { toTitleCase } from "../../utils/toTitleCase.js";
import { buildDropdownOptions } from "../../utils/constants.js";
import { useTranslation } from "react-i18next";
import {
  formatDateToString,
  formatTime,
} from "../../utils/dateTimeFormatter.js";
import Button from "../../components/button.jsx";

const ReportPageDashboard = () => {
  // * USE STATE
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    return wib.toISOString().split("T")[0];
  });

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    const wib = new Date(now.getTime() + 1);
    return wib.toISOString().split("T")[0].slice(0, 7);
  });
  // * USE STORE
  const {
    isLoading,
    error,
    reports,
    monthlyReports,
    fetchReportDetailByDate,
    fetchReportDetailByMonth,
    downloadPDF,
  } = useReportStore();

  // * USE EFFECT - INITIAL DATA LOAD
  useEffect(() => {
    fetchReportDetailByDate(selectedDate);
  }, [selectedDate]);

  // * GENERATE PDF TO DOWNLOAD
  const handleGeneratePDF = async (reports) => {
    try {
      if (reports.length !== 0) {
        const res = await downloadPDF(reports);

        const disposition = res.headers["content-disposition"];
        const filenameMatch = disposition?.match(/filename="?(.+)"?/);
        const filename = filenameMatch?.[1] || "patrol-report.pdf";

        const blob = new Blob([res.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) {
    return <Loader className="w-6 h-6 animate-spin mx-auto" />;
  }
  return (
    <div className="flex flex-col w-full gap-5">
      <MonthlyReport
        monthlyReports={monthlyReports}
        fetchReportDetailByMonth={fetchReportDetailByMonth}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        handleGeneratePDF={handleGeneratePDF}
        error={error}
      />

      <DailyReport
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        downloadPDF={downloadPDF}
        handleGeneratePDF={handleGeneratePDF}
        reports={reports}
      />
    </div>
  );
};

const MonthlyReport = ({
  monthlyReports = [],
  fetchReportDetailByMonth,
  selectedMonth,
  setSelectedMonth,
  handleGeneratePDF,
  error,
}) => {
  const { t } = useTranslation();
  // * HANDLE CHANGE MONTH
  const addMonths = (dateStr, months) => {
    const [yearStr, monthStr] = dateStr.split("-");
    const year = Number(yearStr);
    const monthIndex = Number(monthStr) - 1;
    const date = new Date(year, monthIndex);
    date.setMonth(date.getMonth() + months);

    const newYear = date.getFullYear();
    const newMonth = String(date.getMonth() + 1).padStart(2, "0");

    return `${newYear}-${newMonth}`;
  };

  //* HANDLE SEARCH MONTHLY REPORT
  const [monthlySearchError, setMonthlySearchError] = useState();

  const handleSearchMonthlyReport = () => {
    if (!selectedMonth) return;
    fetchReportDetailByMonth(selectedMonth);
    if (error) {
      setMonthlySearchError(error);
    }
  };

  return (
    <div className="flex flex-col w-full bg-white rounded-lg px-6 py-4 shadow-md gap-5">
      <div className="flex flex-col w-full justify-between gap-5">
        <h5>{t("report_dashboard_page.monthly_report")}</h5>
        <div className="flex flex-row w-full justify-between">
          <div className="flex flex-row gap-3">
            <Button
              buttonSize="small"
              buttonType="secondary"
              icon={ChevronLeft}
              onClick={() => setSelectedMonth(addMonths(selectedMonth, -1))}
            />

            <DateInput
              value={selectedMonth}
              type="month"
              onChange={(e) => setSelectedMonth(e.target.value)}
            />

            <Button
              buttonSize="small"
              buttonType="secondary"
              icon={ChevronRight}
              onClick={() => setSelectedMonth(addMonths(selectedMonth, 1))}
            />
          </div>
          <Button
            type="primary"
            buttonSize="medium"
            icon={Search}
            onClick={handleSearchMonthlyReport}
          >
            {t("report_dashboard_page.search_button_label")}
          </Button>
        </div>
        {error && (
          <p className="text-red-500 font-semibold mb-2">
            {" "}
            {monthlySearchError}
          </p>
        )}
        {monthlyReports.length > 0 &&
          monthlyReports.map((report) => (
            <div
              key={report.workLocation._id}
              className="grid grid-cols-3 gap-3 text-center justify-center items-center"
            >
              <p>{report.workLocation.name}</p>
              <p>
                {report.totalReports} {t("report_dashboard_page.total_reports")}
              </p>
              <p>
                <Button
                  className="ml-auto"
                  icon={Download}
                  onClick={() => handleGeneratePDF(report.reports)}
                >
                  {t("report_dashboard_page.download_pdf_button_label")}
                </Button>
              </p>
            </div>
          ))}
      </div>
    </div>
  );
};

const DailyReport = ({
  selectedDate,
  setSelectedDate,
  handleGeneratePDF,
  reports = [],
}) => {
  const { t } = useTranslation();
  const [selectedPatrolPoint, setSelectedPatrolPoint] = useState();
  const [selectedUser, setSelectedUser] = useState();
  // * FORMAT TO INDONESIA DATE KEY ZONE
  const toIndonesiaDateKey = (date) => {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(date));
  };

  // * DATE FORMATTING
  const parseDate = (dateStr) => {
    const [y, m, d] = dateStr.split("-");
    return new Date(y, m - 1, d);
  };
  // * HANDLE CHANGE DATE
  const addDays = (dateStr, days) => {
    const date = parseDate(dateStr);
    date.setDate(date.getDate() + days);

    const wib = new Date(date.getTime() + 7 * 60 * 60 * 1000);
    return wib.toISOString().split("T")[0];
  };

  // * POPULATE PATROL POINTS OPTION
  const patrolPointOptions = useMemo(() => {
    if (!reports?.length) return [];
    const map = new Map();
    reports.forEach((report) => {
      const point = report.patrolPointId;
      if (!map.has(point._id)) {
        map.set(point._id, {
          label: point.name,
          value: point._id,
        });
      }
    });
    return Array.from(map.values());
  }, [reports]);

  // * FILTERED REPORT DATA
  const filteredReports = useMemo(() => {
    if (!reports?.length) return [];
    const selectedKey = toIndonesiaDateKey(selectedDate);
    return reports.filter((report) => {
      const reportKey = toIndonesiaDateKey(report.createdAt);
      return (
        reportKey === selectedKey &&
        (!selectedUser || report.userId._id === selectedUser) &&
        (!selectedPatrolPoint ||
          report.patrolPointId._id === selectedPatrolPoint)
      );
    });
  }, [reports, selectedDate, selectedUser, selectedPatrolPoint]);

  const handleFilterUser = (e) => {
    setSelectedUser(e.target.value);
  };

  // * HANDLE FILTER BY PATROL POINT
  const handleFilterPatrolPoint = (e) => {
    setSelectedPatrolPoint(e.target.value);
  };
  // * POPULATE USER OPTIONS
  const userArray = useMemo(() => {
    if (!reports?.length) return [];
    const map = new Map();
    reports.forEach((report) => {
      const user = report.userId;
      if (!user?._id) return;
      if (!map.has(user._id)) {
        map.set(user._id, {
          name: `${user.firstName} ${user.lastName}`,
          _id: user._id,
        });
      }
    });

    return Array.from(map.values());
  }, [reports]);
  // * GENERATE USER OPTIONS
  const userOptions = buildDropdownOptions(userArray, {
    includeAll: true,
    allLabel: t("report_dashboard_page.filter_by_user_placeholder"),
    allValue: "",
  });
  return (
    <div className="flex flex-col w-full bg-white rounded-lg px-6 py-4 shadow-md gap-5">
      <div className="flex flex-row justify-between items-center">
        <h5>{t("report_dashboard_page.daily_report")}</h5>
        <div className="flex flex-row gap-3">
          <Button
            buttonSize="small"
            buttonType="secondary"
            icon={ChevronLeft}
            onClick={() => setSelectedDate(addDays(selectedDate, -1))}
          />

          <DateInput
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />

          <Button
            buttonSize="small"
            buttonType="secondary"
            icon={ChevronRight}
            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 justify-between gap-5 items-center">
        <DropdownInput
          label={t("report_dashboard_page.user_filter_dropdown_label")}
          name="user"
          value={selectedUser}
          options={userOptions}
          placeholder="Select User"
          onChange={handleFilterUser}
        />
        <DropdownInput
          label={t("report_dashboard_page.patrol_point_filter_dropdown_label")}
          name="patrolPoint"
          value={selectedPatrolPoint}
          options={patrolPointOptions}
          placeholder={t(
            "report_dashboard_page.filter_by_patrol_point_placeholder",
          )}
          onChange={handleFilterPatrolPoint}
        />
      </div>
      {filteredReports.length === 0 ? (
        <p className="text-center mt-4">
          {t("report_dashboard_page.no_reports_found")}
        </p>
      ) : (
        <div className="flex flex-col gap-2 w-full justify-between pt-2">
          <h4 className="text-center">{formatDateToString(selectedDate)}</h4>
          <div className="grid grid-cols-3 items-center text-center">
            <h6>{t("report_dashboard_page.table_header_time")}</h6>
            <h6>{t("report_dashboard_page.table_header_user")}</h6>
            <h6>{t("report_dashboard_page.table_header_patrol_point")}</h6>
          </div>
          {filteredReports.map((report) => {
            const user = report.userId;
            const patrol = report.patrolPointId;

            return (
              <NavLink
                to={`/admin/report/${report._id}`}
                key={report._id}
                className="grid grid-cols-3 text-center gap-4 px-3 py-2 hover:bg-gray-100 rounded-md"
              >
                <p>{formatTime(report.createdAt)}</p>

                <p>
                  {user ? `${user.firstName} ${user.lastName}` : "Unknown User"}
                </p>

                <p>{patrol ? toTitleCase(patrol.name) : "Unknown Point"}</p>
              </NavLink>
            );
          })}
        </div>
      )}

      {filteredReports.length > 0 && filteredReports.at(-1).documentUrl && (
        <div className="flex flex-row gap-5 items-center pt-3">
          <p>{t("report_dashboard_page.pdf_file_generated")}</p>
          <a
            href={filteredReports.at(-1).documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            buttonType="secondary"
          >
            {t("report_dashboard_page.view_pdf_file_button_label")}
          </a>
        </div>
      )}
      {filteredReports.length > 0 && (
        <div className="flex flex-row gap-5 items-center pt-3">
          <Button
            buttonType="primary"
            onClick={() => handleGeneratePDF(filteredReports)}
            icon={DownloadIcon}
          >
            {t("report_dashboard_page.download_pdf_button_label")}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReportPageDashboard;
