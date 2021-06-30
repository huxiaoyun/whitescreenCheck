import { toGray } from './transform';

export function OTSUAlgorithm(imgData: ImageData) {
  // TODO 找出为什么图片灰度化后差异度变小，可能和权重选择的有关系，差异度量级为万分之一，可忽略
  const grayData = toGray(imgData);
  let ptr = 0;
  const histData = Array(256).fill(0);
  const total = grayData.length;

  while (ptr < total) {
    // eslint-disable-next-line no-bitwise
    const h = 0xff & grayData[ptr++];
    histData[h]++;
  }

  let sum = 0;
  for (let i = 0; i < 256; i++) {
    sum += i * histData[i];
  }

  let wB = 0;
  let wF = 0;
  let sumB = 0;
  let varMax = 0;
  let threshold = 0;

  for (let t = 0; t < 256; t++) {
    wB += histData[t];
    // eslint-disable-next-line no-continue
    if (wB === 0) continue;
    wF = total - wB;
    if (wF === 0) break;

    sumB += t * histData[t];

    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;

    const varBetween = wB * wF * (mB - mF) ** 2;

    if (varBetween > varMax) {
      varMax = varBetween;
      threshold = t;
    }
  }

  return threshold;
}

export function binaryzation(imgData: ImageData, threshold: number): ImageData {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const imgWidth = Math.sqrt(imgData.data.length / 4);
  const newImageData = ctx?.createImageData(imgWidth, imgWidth) as ImageData;
  for (let i = 0; i < imgData.data.length; i += 4) {
    const R = imgData.data[i];
    const G = imgData.data[i + 1];
    const B = imgData.data[i + 2];
    const Alpha = imgData.data[i + 3];
    const sum = (R + G + B) / 3; // 均值法，最简单的方法， TODO 后续需要增加 pHash算法和 SIFT算

    newImageData.data[i] = sum > threshold ? 255 : 0;
    newImageData.data[i + 1] = sum > threshold ? 255 : 0;
    newImageData.data[i + 2] = sum > threshold ? 255 : 0;
    newImageData.data[i + 3] = Alpha;
  }
  return newImageData;
}

export function cosineSimilarity(sampleFingerprint: number[], targetFingerprint: number[]) {
  // cosθ = ∑n, i=1(Ai × Bi) / (√∑n, i=1(Ai)^2) × (√∑n, i=1(Bi)^2) = A · B / |A| × |B|
  const length = sampleFingerprint.length;
  let innerProduct = 0;
  for (let i = 0; i < length; i++) {
    innerProduct += sampleFingerprint[i] * targetFingerprint[i];
  }
  let vecA = 0;
  let vecB = 0;
  for (let i = 0; i < length; i++) {
    vecA += sampleFingerprint[i] ** 2;
    vecB += targetFingerprint[i] ** 2;
  }
  const outerProduct = Math.sqrt(vecA) * Math.sqrt(vecB);
  return innerProduct / outerProduct;
}
