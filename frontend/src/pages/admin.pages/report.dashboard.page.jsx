import { useEffect, useState, useMemo, use } from "react";
import { ChevronLeft, ChevronRight, DownloadIcon, Loader } from "lucide-react";
import { NavLink } from "react-router-dom";
import { DateInput, DropdownInput } from "../../components/inputs.jsx";
import { useReportStore } from "../../stores/report.store.js";
import { toTitleCase } from "../../utils/toTitleCase.js";
import { buildDropdownOptions } from "../../utils/constants.js";
import {
  formatDateToString,
  formatTime,
} from "../../utils/dateTimeFormatter.js";
import Button from "../../components/button.jsx";

const ReportPageDashboard = () => {
  // * USE STATE
  const [selectedPatrolPoint, setSelectedPatrolPoint] = useState();
  const [selectedUser, setSelectedUser] = useState();
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
    reports,
    monthlyReports,
    fetchReportDetailByDate,
    fetchReportDetailByMonth,
    downloadPDF,
  } = useReportStore();
  const handleFilterUser = (e) => {
    setSelectedUser(e.target.value);
  };

  // * HANDLE FILTER BY PATROL POINT
  const handleFilterPatrolPoint = (e) => {
    setSelectedPatrolPoint(e.target.value);
  };
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
    allLabel: "All User",
    allValue: "",
  });

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

  const filteredMonthlyReports = useMemo(() => {
    if (!monthlyReports?.length) return [];
    // const selectedKey = toIndonesiaDateKey(selectedMonth);
    return monthlyReports.filter((report) => {
      // const reportKey = toIndonesiaDateKey(report.createdAt);
      return (
        (!selectedUser || report.userId._id === selectedUser) &&
        (!selectedPatrolPoint ||
          report.patrolPointId._id === selectedPatrolPoint)
      );
    });
  }, [monthlyReports, selectedMonth, selectedUser, selectedPatrolPoint]);

  // * USE EFFECT - INITIAL DATA LOAD
  useEffect(() => {
    fetchReportDetailByDate(selectedDate);
    fetchReportDetailByMonth(selectedMonth);
  }, [selectedDate, selectedMonth]);

  if (isLoading) {
    return <Loader className="w-6 h-6 animate-spin mx-auto" />;
  }
  return (
    <div className="flex flex-col w-full gap-5">
      <div className="flex flex-col w-full bg-white rounded-lg px-6 py-4 shadow-md gap-5">
        <div className="flex flex-row justify-between items-center">
          <h5>Monthly Report</h5>
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
        </div>
        <div className="grid grid-cols-2 justify-between gap-5 items-center">
          <DropdownInput
            label="Sort by User"
            name="user"
            value={selectedUser}
            options={userOptions}
            placeholder="Select User"
            onChange={handleFilterUser}
          />
          <DropdownInput
            label="Sort by Patrol Point"
            name="patrolPoint"
            value={selectedPatrolPoint}
            options={patrolPointOptions}
            placeholder="Select Point"
            onChange={handleFilterPatrolPoint}
          />
        </div>
        {filteredMonthlyReports.length}
      </div>

      <div className="flex flex-col w-full bg-white rounded-lg px-6 py-4 shadow-md gap-5">
        <div className="flex flex-row justify-between items-center">
          <h5>Report Dashboard</h5>
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
            label="Sort by User"
            name="user"
            value={selectedUser}
            options={userOptions}
            placeholder="Select User"
            onChange={handleFilterUser}
          />
          <DropdownInput
            label="Sort by Patrol Point"
            name="patrolPoint"
            value={selectedPatrolPoint}
            options={patrolPointOptions}
            placeholder="Select Point"
            onChange={handleFilterPatrolPoint}
          />
        </div>
        {filteredReports.length === 0 ? (
          <p className="text-center mt-4">No reports found.</p>
        ) : (
          <div className="flex flex-col gap-2 w-full justify-between pt-2">
            <h4 className="text-center">{formatDateToString(selectedDate)}</h4>
            <div className="grid grid-cols-3 items-center text-center">
              <h6>Time</h6>
              <h6>User</h6>
              <h6>Patrol Point</h6>
            </div>
            {filteredReports.length > 0 &&
              filteredReports.map((report) => (
                <NavLink
                  to={`/admin/report/${report._id}`}
                  key={report._id}
                  className="grid grid-cols-3 text-center gap-4 px-3 py-2 hover:bg-gray-100 rounded-md justify-between items-center cursor-pointer"
                >
                  <p>{formatTime(report.createdAt)}</p>
                  <p>
                    {report.userId.firstName} {report.userId.lastName}
                  </p>
                  <p>{toTitleCase(report.patrolPointId.name)}</p>
                </NavLink>
              ))}
          </div>
        )}
        {filteredReports.length > 0 && filteredReports.at(-1).documentUrl && (
          <div className="flex flex-row gap-5 items-center pt-3">
            <p>PDF file generated</p>
            <a
              href={filteredReports.at(-1).documentUrl}
              target="_blank"
              rel="noopener noreferrer"
              buttonType="secondary"
            >
              View Report Document (PDF)
            </a>
          </div>
        )}
        {filteredReports.length > 0 && !filteredReports.at(-1).documentUrl && (
          <div className="flex flex-row gap-5 items-center pt-3">
            <p>PDF file not generated yet</p>
            <Button
              buttonType="primary"
              onClick={handleGeneratePDF}
              icon={DownloadIcon}
            >
              Download PDF
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportPageDashboard;
