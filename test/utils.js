export function setItemTimes(lf, key, value, times) {
  if (times <= 0) return true;

  return lf.setItem(`${key}_${times}`, value)
  .then(() => setItemTimes(lf, key, value, times - 1));
}
