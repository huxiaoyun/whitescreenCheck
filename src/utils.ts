import { v4 as uuidv4 } from 'uuid';
import { Color } from './types/index.type';

export function getImageData(canvas: HTMLCanvasElement) {
  // 避免整个页面图片过大，所以仅截取 从左上角起 至 1000,500 的内容
  return canvas.getContext('2d')?.getImageData(0, 0, canvas.width, canvas.height);
}
// 判断 canvas 是否为空
export function isCanvasEmpty(canvas: HTMLCanvasElement) {
  return canvas.height === 0 || canvas.width === 0;
}

// 判断 canvas 背景像素是否超出阈值
export function getCanvasBackgroundRate(canvas: HTMLCanvasElement, backgroundColor: Color) {
  const imageData = canvas.getContext('2d')?.getImageData(0, 0, canvas.width, canvas.height).data;
  // 判断 canvas 的像素点是否全为白色，或者白色阈值超过99
  let bgPixelCnt = 0;
  for (let i = 0; i < imageData.length; i += 4) {
    if (
      imageData[i] === backgroundColor[0] &&
      imageData[i + 1] === backgroundColor[1] &&
      imageData[i + 2] === backgroundColor[2]
    ) {
      bgPixelCnt++;
    }
  }

  // 大于90%的像素为白色，判定为空
  return bgPixelCnt / imageData.length;
}

function dataURLtoBlob(dataurl) {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

// 发送截图, 如何访问截图 https://onedq.oss-cn-zhangjiakou.aliyuncs.com/${key}
// 因安全问题，暂时不返回截图
export function sendCaptureImage(canvas: any) {
  return 1;

  // const imgStr = canvas.toDataURL('image/jpeg', 0.1);
  // const accessid = 'LTAI5tDy84ZdgEptG7VUUnDh';
  // const host = 'https://onedq.oss-cn-zhangjiakou.aliyuncs.com';
  // const policyBase64 =
  // eslint-disable-next-line max-len
  //   'eyJleHBpcmF0aW9uIjoiMjA1MC0wMS0wMVQxMjowMDowMC4wMDBaIiwiY29uZGl0aW9ucyI6W1siY29udGVudC1sZW5ndGgtcmFuZ2UiLDAsMTA0ODU3NjAwMF1dfQ==';
  // const signature = 'qZ1nMtBCLCrIi7tF5BL8+cBWh9M=';
  // const blob = dataURLtoBlob(imgStr);
  // const ossFileKey = `${uuidv4()}-${new Date().getTime()}.jpg`;

  // const formData = new FormData();
  // formData.append('key', ossFileKey); // 存储的名称
  // formData.append('policy', policyBase64);
  // formData.append('OSSAccessKeyId', accessid);
  // formData.append('success_action_status', '200');
  // formData.append('signature', signature);
  // formData.append('file', blob);

  // fetch(host, {
  //   body: formData,
  //   method: 'post',
  // });

  // return ossFileKey;
}
