import { useEffect, useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Loader } from "lucide-react";
import { NavLink } from "react-router-dom";
import { DateInput, DropdownInput } from "../../components/Input.jsx";
import { useReportStore } from "../../stores/report.store.js";
import { toTitleCase } from "../../utils/toTitleCase.js";
import {
  splitDateString,
  formatDateToString,
  formatTime,
} from "../../utils/dateTimeFormatter.js";
import Button from "../../components/button.jsx";

const ReportPageDashboard = () => {
  // * USE STATE
  const [selectedPatrolPoint, setSelectedPatrolPoint] = useState();
  const [selectedUser, setSelectedUser] = useState();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // * USE STORE
  const { isLoading, reports, fetchReportDetailByDate } = useReportStore();
  const handleFilterUser = (e) => {
    setSelectedUser(e.target.value);
  };

  // * DATA FILTER HANDLER
  const handleFilterPatrolPoint = (e) => {
    setSelectedPatrolPoint(e.target.value);
  };

  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  // * POPULATE USER OPTIONS
  const userOptions = useMemo(() => {
    if (!reports?.length) return [];
    const map = new Map();
    reports.forEach((report) => {
      const user = report.userId;
      if (!map.has(user._id)) {
        map.set(user._id, {
          label: `${user.firstName} ${user.lastName}`,
          value: user._id,
        });
      }
    });
    return Array.from(map.values());
  }, [reports]);

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
    return reports.filter((report) => {
      const reportDate = new Date(report.createdAt);
      const selected = new Date(selectedDate);

      reportDate.setHours(0, 0, 0, 0);
      selected.setHours(0, 0, 0, 0);

      const matchDate = reportDate.getTime() === selected.getTime();
      const matchUser = !selectedUser || report.userId._id === selectedUser;
      const matchPatrolPoint =
        !selectedPatrolPoint ||
        report.patrolPointId._id === selectedPatrolPoint;

      return matchDate && matchUser && matchPatrolPoint;
    });
  }, [reports, selectedDate, selectedUser, selectedPatrolPoint]);

  // * USE EFFECT - INITIAL DATA LOAD
  useEffect(() => {
    fetchReportDetailByDate(selectedDate);
  }, [selectedDate]);

  if (isLoading) {
    return <Loader className="w-6 h-6 animate-spin mx-auto" />;
  }

  return (
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
            label=""
            value={splitDateString(selectedDate)}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
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
        <p className="text-center mt-4">No patrol points found.</p>
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
    </div>
  );
};

export default ReportPageDashboard;
