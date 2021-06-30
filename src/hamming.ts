/**
 * 使用汉明距离对比两个图片的差异
 * 相似度 = (字符串长度 - 汉明距离) / 字符串长度， 相似度越高表示白屏的可能性越高
 * 为提高相似度精准度，可以考虑使用实际像素差异表示相似度
 * 严格来说，只要不是0，就不是白屏
 * 但可以放宽相似度到 0.5 ， 只要有50%的比率以上相似就是白屏
 * */
import _ from 'lodash';
/** 汉明距离 */
function hammingDistance(str1: string, str2: string) {
  let distance = 0;
  const str1Arr = str1.split('');
  const str2Arr = str2.split('');
  str1Arr.forEach((letter, index) => {
    if (letter !== str2Arr[index]) {
      distance++;
    }
  });
  return distance;
}

function fillData(sourceData: string[], length: number) {
  const newData = new Array(length)
    .fill(255)
    .map((value, i) => {
      if (i > sourceData.length - 1) {
        return 0;
      }
      return sourceData[i];
    })
    .join('');
  return newData;
}

export function hamming(source: HTMLCanvasElement, target: HTMLCanvasElement) {
  const sourceDataUrl = source.toDataURL().split('');
  const targetDataUrl = target.toDataURL().split('');
  // 需要补全两个数据至相同长度再对比
  const maxDataLength = Math.max(sourceDataUrl.length, targetDataUrl.length);
  const newSourceDataUrl = fillData(sourceDataUrl, maxDataLength);
  const newTargetDataUrl = fillData(targetDataUrl, maxDataLength);

  const gap = hammingDistance(newSourceDataUrl, newTargetDataUrl);
  return _.floor((maxDataLength - gap) / maxDataLength, 5);
}
