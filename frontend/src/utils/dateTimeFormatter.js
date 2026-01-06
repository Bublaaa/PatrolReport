export const formatDateToString = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return "Invalid Date";
  }

  return date.toLocaleString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    // hour: "2-digit",
    // minute: "2-digit",
    // hour12: true,
  });
};

export const splitDateString = (date) => {
  if (!date) return "";
  return new date.toISOString().split("T")[0];
};

export const formatTime = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return "Invalid Date";
  }

  return date.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};
export const formatTimeToHours = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return "Invalid Date";
  }

  return date.toLocaleString("en-US", {
    hour: "2-digit",
    hour12: false,
  });
};

export const formatTimeToUTC = (timeString) => {
  if (!timeString) return "";
  const [hours, minutes] = timeString.split(":").map(Number);
  const utcDate = new Date(Date.UTC(1970, 0, 1, hours - 7, minutes, 0));
  return utcDate.toISOString();
};
