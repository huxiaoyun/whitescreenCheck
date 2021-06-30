/* eslint-disable no-console */
/**
 * 图片白屏检测
 * 包括
 * 1. 信息熵检测
 * 2. 图片对比
 */
import html2canvas from 'html2canvas';
import { DIFF_TYPE, IConfig } from './types/index.type';
import { isCanvasEmpty, getCanvasBackgroundRate, sendCaptureImage } from './utils';
import { hamming } from './hamming';
import { cosine } from './cosine';
import EntropyWorker from './EntropyWorker.js';

const HTML2CANVAS_OPTION = {
  useCORS: true,
  logging: false,
  backgroundColor: '#ffffff',
  x: window.scrollX, // 避免滚动造成截图错位
  y: window.scrollY + 300, // 去除菜单类信息干扰
  width: window.innerWidth,
  height: 1000,
} as any;

// TODO 根据图片对比 , div 截图效果不好，所以修改成 body 进行对比
export default function (core: any, config: IConfig) {
  const {
    delayTime = 5000,
    rootContainerSelector,
    ignoreElements,
    emptyPixelThredhold = -1,
    bgColor = [255, 255, 255],
    armMonitorCode,
    entropyThredhold = -1,
    similarityThredhold = -1,
    diffType = DIFF_TYPE.HAMMING,
  } = config;
  // 初始canvas
  const captureOptions = {
    ...HTML2CANVAS_OPTION,
    ignoreElements(element: any) {
      // 存在自定义 ignore 元素
      if (ignoreElements) {
        return ignoreElements(element);
      }
      return false;
    },
  };
  let initialCanvas: any = null;
  setTimeout(() => {
    html2canvas((document as any).querySelector(rootContainerSelector), captureOptions).then((canvas: any) => {
      // TODO 添加到 body 查看截图
      // document.body.appendChild(canvas);
      initialCanvas = canvas;
    });
  }, 500);

  // delay 过后截图，默认这个时间是页面已经完全加载完成
  setTimeout(() => {
    html2canvas((document as any).querySelector(rootContainerSelector), captureOptions).then((canvas: any) => {
      const imgKey1 = sendCaptureImage(initialCanvas);
      const imgKey2 = sendCaptureImage(canvas);

      // TODO 添加到 body 查看截图
      // document.body.appendChild(canvas);

      /**
       * canvas 为空，直接报异常
       */
      if (isCanvasEmpty(canvas)) {
        // console.log('TraceWhiteScreenPlugin 白屏检测异常，target页面为空');
        core.logCustom({
          code: armMonitorCode, // 系统自动生成，请勿修改
          sampleRate: 1.0, // 目前采样率为 100.00%
          msg: `页面为空`,
          c3: JSON.stringify({
            imgKey1,
            imgKey2,
          }),
        });
        return;
      }

      /**
       * canvas 背景色占比
       */
      const bgRate = getCanvasBackgroundRate(canvas, bgColor);
      if (bgRate > emptyPixelThredhold) {
        core.logCustom({
          code: armMonitorCode, // 系统自动生成，请勿修改
          sampleRate: 1.0, // 目前采样率为 100.00%
          msg: `页面背景色占比过高`,
          c1: bgRate,
          c3: JSON.stringify({
            imgKey1,
            imgKey2,
          }),
        });
        return;
      }

      /**
       * 图片信息熵
       */
      if (window.Worker) {
        const ctx = canvas.getContext('2d');
        const { width, height } = canvas;
        const imageData = ctx.getImageData(0, 0, width, height);
        const entropyWorker = new EntropyWorker((entropy: any) => {
          console.log('TraceWhiteScreenPlugin receive data from worker, calc entropy = ', entropy);
          if (entropy > entropyThredhold) {
            core.logCustom({
              code: armMonitorCode, // 系统自动生成，请勿修改
              sampleRate: 1.0, // 目前采样率为 100.00%
              msg: `页面信息熵`,
              c1: entropy,
              c3: JSON.stringify({
                imgKey1,
                imgKey2,
              }),
            });
          }
          entropyWorker.end();
        });

        entropyWorker.start();
        console.log('TraceWhiteScreenPlugin post message to entropyWorker');
        entropyWorker.worker.postMessage({
          width,
          height,
          imageData,
        });
      } else {
        core.logCustom({
          code: armMonitorCode, // 系统自动生成，请勿修改
          sampleRate: 1.0, // 目前采样率为 100.00%
          msg: `页面信息熵-worker不支持`,
          c3: JSON.stringify({
            imgKey1,
            imgKey2,
          }),
        });
      }

      /**
       * 图片相似度对比
       */
      if (diffType === DIFF_TYPE.HAMMING) {
        const similarity = hamming(initialCanvas, canvas);
        console.log('TraceWhiteScreenPlugin similarity', diffType, similarity);
        if (similarity > similarityThredhold) {
          core.logCustom({
            code: armMonitorCode, // 系统自动生成，请勿修改
            sampleRate: 1.0, // 目前采样率为 100.00%
            msg: `图片对比`,
            c1: diffType,
            c2: similarity,
            c3: JSON.stringify({
              imgKey1,
              imgKey2,
            }),
          });
        }
      } else if (diffType === DIFF_TYPE.COSINE) {
        const similarity = cosine(initialCanvas, canvas);
        console.log('TraceWhiteScreenPlugin similarity', diffType, similarity);
        if (similarity > similarityThredhold) {
          core.logCustom({
            code: armMonitorCode, // 系统自动生成，请勿修改
            sampleRate: 1.0, // 目前采样率为 100.00%
            msg: `图片对比`,
            c1: diffType,
            c2: similarity,
            c3: JSON.stringify({
              imgKey1,
              imgKey2,
            }),
          });
        }
      }
    });
  }, delayTime);
}
