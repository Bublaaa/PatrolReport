export const requestLocation = () => {
  return new Promise((resolve, reject) => {
    navigator.permissions
      .query({ name: "geolocation" })
      .then((permissionStatus) => {
        if (
          permissionStatus.state === "granted" ||
          permissionStatus.state === "prompt"
        ) {
          navigator.geolocation.getCurrentPosition(
            (position) => resolve(position.coords),
            (error) => reject(error),
            {
              enableHighAccuracy: true,
              timeout: 3000,
              maximumAge: 0,
            }
          );
        } else {
          reject(new Error("❌ Location access is required for attendance."));
        }
      })
      .catch((error) => reject(error));
  });
};

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers (3958.8 for miles)
  const toRad = (degree) => (degree * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c * 1000; // returns distance in meters
};
