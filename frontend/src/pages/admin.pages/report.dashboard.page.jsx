import { DateInput } from "../../components/input";
import {
  splitDateString,
  formatDateToString,
} from "../../utils/dateTimeFormatter.js";
import { useReportStore } from "../../stores/report.store.js";
import { Loader } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { Trash2, PenBoxIcon } from "lucide-react";
import { NavLink } from "react-router-dom";
import { DropdownInput } from "../../components/input";
import Button from "../../components/button.jsx";

const ReportPageDashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { isLoading, reports, fetchReportDetailByDate } = useReportStore();
  const [selectedPatrolPoint, setSelectedPatrolPoint] = useState();
  const [selectedUser, setSelectedUser] = useState();
  const handleFilterUser = (e) => {
    setSelectedUser(e.target.value);
  };

  const handleFilterPatrolPoint = (e) => {
    setSelectedPatrolPoint(e.target.value);
  };
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

  useEffect(() => {
    fetchReportDetailByDate(selectedDate);
  }, [selectedDate]);

  if (isLoading) {
    return <Loader className="w-6 h-6 animate-spin mx-auto" />;
  }

  return (
    <div className="flex flex-col w-full bg-white rounded-lg px-6 py-4 shadow-md">
      <div className="flex flex-row justify-between items-center mb-5">
        <h5>Patrol Points Dashboard</h5>
      </div>

      <div className="grid grid-cols-4 justify-between gap-5 items-center">
        <DateInput
          label=""
          value={splitDateString(selectedDate)}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
        />
        <DropdownInput
          label=""
          name="user"
          value={selectedUser}
          options={userOptions}
          placeholder="Select User"
          onChange={handleFilterUser}
        />
        <DropdownInput
          label=""
          name="patrolPoint"
          value={selectedPatrolPoint}
          options={patrolPointOptions}
          placeholder="Select Point"
          onChange={handleFilterPatrolPoint}
        />
        <div></div>
      </div>
      {filteredReports.length === 0 && (
        <p className="text-center mt-4">No patrol points found.</p>
      )}
      <div
        className="flex flex-col gap-2 w-full justify-between pt-2"
        onClick={(e) => handleDeleteAction(e)}
      >
        {filteredReports.length > 0 &&
          filteredReports.map((report) => (
            <div
              key={report._id}
              className="grid grid-cols-4 text-center gap-4 px-3 py-2 hover:bg-gray-100 rounded-md justify-between items-center cursor-pointer"
            >
              <p>{formatDateToString(report.createdAt)}</p>
              <p>
                {report.userId.firstName} {report.userId.lastName}
              </p>
              <p>{report.patrolPointId.name}</p>
              <div className="flex flex-row gap-2">
                <Button
                  className="delete-btn"
                  buttonSize="small"
                  buttonType="danger"
                  icon={Trash2}
                  data-id={report._id}
                  // data-name={point.name}
                ></Button>
                <NavLink to={`/admin/patrol-point/${report._id}`}>
                  <Button
                    buttonType="secondary"
                    buttonSize="icon"
                    icon={PenBoxIcon}
                  />
                </NavLink>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default ReportPageDashboard;
