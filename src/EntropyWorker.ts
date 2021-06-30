/* eslint-disable no-console */
// 自定义 web worker 类
import {
  // chunk,
  // formula,
  // getScale,
  // Pixel,
  // PixelArray,
  // CanvasImage,
  processEntropy,
} from './entroy/processEntropy.worker.js';

export default class EntropyWorker {
  f: any = null;

  worker: any = null;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onmessage = (data: any) => {};

  constructor(cb: any) {
    this.worker = null;
    this.onmessage = cb;
  }

  start() {
    const funcStr = `(function(){

      const processEntropy = ${processEntropy.toString()};

      processEntropy();
    })()`;
    // console.log(funcStr);
    const blob = new Blob([funcStr], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    this.worker = new Worker(url);
    this.worker.onmessage = (event: any) => {
      this.onmessage(event.data);
    };
  }

  end() {
    this.worker.terminate();
  }
}
