/**
 * 使用余弦相似对比两张图片
 * */
import { isCanvasEmpty, getImageData } from './utils';
import { OTSUAlgorithm, binaryzation, cosineSimilarity } from './algorithm';

// 因为 image data 范围是 [0, 255] 所以使用 0.1 进行填充
const EMPTY_CANVAS_DATA = new Array(5).fill(0.1);

function getCanvasBinaryzationData(canvas: HTMLCanvasElement): number[] {
  if (isCanvasEmpty(canvas)) {
    return EMPTY_CANVAS_DATA;
  }
  const imageData = getImageData(canvas);
  const oTSUThredhold = OTSUAlgorithm(imageData as any);
  const binaryzationData = binaryzation(imageData as any, oTSUThredhold);
  return (binaryzationData as any).data;
}

export function cosine(source: HTMLCanvasElement, target: HTMLCanvasElement): number {
  let sourceBinaryzation = getCanvasBinaryzationData(source);
  const targetBinaryzation = getCanvasBinaryzationData(target);

  // 余弦相似度无法进行零向量比较，所以判断 sourceBinaryzation 为空的时候，进行小数据扰动填充
  const maxDataLength = Math.max(sourceBinaryzation.length, targetBinaryzation.length);
  if (isCanvasEmpty(source)) {
    sourceBinaryzation = new Array(maxDataLength).fill(0.1);
  }

  // 余弦相似度，1 为最相近的 -1 为完全相反，相似度越高表示白屏的可能性越高
  const similarity = cosineSimilarity(sourceBinaryzation, targetBinaryzation);
  return _.floor(similarity, 5);
}
