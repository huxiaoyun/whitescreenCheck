/* eslint-disable no-multi-assign */
/* eslint-disable no-bitwise */
// TODO GrayscaleWeight 的阈值如何寻找最优解
enum GrayscaleWeight {
  R = 0.299,
  G = 0.587,
  B = 0.114,
}

export function toGray(imgData: ImageData) {
  const grayData = [];
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const gray = ~~(data[i] * GrayscaleWeight.R + data[i + 1] * GrayscaleWeight.G + data[i + 2] * GrayscaleWeight.B);
    data[i] = data[i + 1] = data[i + 2] = gray;
    grayData.push(gray);
  }

  return grayData;
}
