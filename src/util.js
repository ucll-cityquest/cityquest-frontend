import uuid from "uuid/v1";

export const getUserId = () => {
  return localStorage.getItem("userId");
};

export const setUserId = id => {
  localStorage.setItem("userId", id);
};

export const initUserId = () => {
  let id = getUserId();
  if (!id) {
    setUserId(uuid());
  }
};

/**
 * Finds index of an array or a default value
 * @param {array} array
 * @param {(element, index, array) => boolean} predicate
 * @param {any} defaultValue
 */
export function findIndexOr(array, predicate, defaultValue = -1) {
  const value = array.findIndex(predicate);
  if (value === -1) return defaultValue;
  return value;
}
