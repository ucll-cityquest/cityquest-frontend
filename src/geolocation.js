/**
 * Create a stream with the current location.
 *
 * @param {function} succesCb format: ([latitude, longitude] => any)
 * @param {function} errorCb format: (error => any)
 * @param {number} intervalTime how many miliseconds to wait between each update
 *
 *  @returns close function
 */
export function createLocationStream(
  successCb,
  errorCb = err => console.error(err)
) {
  if (navigator.geolocation === undefined) {
    errorCb("Browser does not support geolocation");
    return;
  }

  const options = {
    enableHighAccuracy: false,
    timeout: 10000,
    maximumAge: 0
  };

  let id = navigator.geolocation.watchPosition(
    position =>
      successCb([position.coords.latitude, position.coords.longitude]),
    errorCb,
    options
  );
  return () => navigator.geolocation.clearWatch(id);
}
