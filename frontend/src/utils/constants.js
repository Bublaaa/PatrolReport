// constants/options.js

export const buildDropdownOptions = (
  items = [],
  { includeAll = false, allLabel = "All", allValue = "" } = {},
) => {
  const options = items.map((item) => ({
    label: item.name,
    value: item._id,
  }));

  if (!includeAll) return options;

  return [{ label: allLabel, value: allValue }, ...options];
};

//* USAGE
// const workLocationOptions = buildDropdownOptions(workLocations, {
//   includeAll: false,
//   allLabel: "View All Locations",
//   allValue: "ALL",
// });

const POSITION_OPTIONS = [
  { label: "Admin", value: "admin" },
  { label: "Security", value: "security" },
];

export const buildPositionDropdownOptions = ({
  includeAll = false,
  allLabel = "All",
  allValue = "",
} = {}) => {
  if (!includeAll) return POSITION_OPTIONS;
  return [{ label: allLabel, value: allValue }, ...POSITION_OPTIONS];
};
