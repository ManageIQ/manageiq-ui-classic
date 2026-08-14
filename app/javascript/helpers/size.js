/**
 * Converts any value to bytes.
 *
 * @param {number|string} value Input value (number of bytes, or Ruby method string e.g. "1.5.gigabytes").
 * @return {number} Value in bytes.
 */
export const toBytes = (value) => {
  if (!value) {
    return undefined;
  }

  if (typeof value !== 'number') {
    const sizeValue = value.match(/^\d+(\.\d+)*/)[0];
    if (value.match(/gigabytes/)) {
      return sizeValue * (1024 ** 3);
    }
    if (value.match(/megabytes/)) {
      return sizeValue * (1024 ** 2);
    }
    if (value.match(/kilobytes/)) {
      return sizeValue * 1024;
    }
    if (value.match(/\.bytes/)) {
      return Number(sizeValue);
    }
  }
  return value;
};

/**
 * Converts a byte value to a human-readable size string.
 *
 * @param {number|string} value Input value (number of bytes, or Ruby method string e.g. "1.5.gigabytes").
 * @return {string} Value in human-readable format (e.g. "500 MB", "2 GB").
 */
export const toHumanSize = (value) => {
  if (!value) {
    return undefined;
  }

  const bytes = toBytes(value);

  if (bytes >= 1073741824) {
    return `${parseFloat((bytes / (1024 ** 3)).toFixed(2))} GB`;
  } if (bytes >= 1048576) {
    return `${parseFloat((bytes / (1024 ** 2)).toFixed(2))} MB`;
  } if (bytes >= 1024) {
    return `${parseFloat((bytes / 1024).toFixed(2))} KB`;
  }
  return `${bytes} B`;
};
