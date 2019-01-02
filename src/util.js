export const getUserId = () => {
  return localStorage.getItem("userId");
};

export const setUserId = id => {
  localStorage.setItem("userId", id);
};

export const initUserId = () => {
  let id = getUserId();
  if (!id) {
    setUserId(generateUUID());
  }
};

const generateUUID = () => {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return (
    s4() +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    s4() +
    s4()
  );
};

/**
 *
 * @param {array} array
 * @param {(element, index, array) => boolean} predicate
 * @param {any} defaultValue
 */
export function findIndexOr(array, predicate, defaultValue = -1) {
  const value = array.findIndex(predicate);
  if (value == -1) return defaultValue;
  return value;
}
