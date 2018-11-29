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
  succesCb,
  errorCb = err => {
    console.error(err);
  },
  intervalTime = 1000
) {
  if (navigator.geolocation === undefined) {
    throw new Error("Browser does not support geolocation");
  }

  const intervalId = setInterval(() => {
    navigator.geolocation.getCurrentPosition(
      position =>
        succesCb([position.coords.latitude, position.coords.longitude]),
      errorCb
    );
  }, intervalTime);

  return () => clearInterval(intervalId);
}
