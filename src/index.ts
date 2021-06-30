/* eslint-disable no-console */
/**
 * @author ludy.hxy
 * 页面白屏检测 plugin
 * 详细设计见：https://yuque.antfin-inc.com/rcdd2y/qlvvs4/wpr78k
 *
 * 参考 jstracker 定义：https://yuque.antfin-inc.com/datax/jstracker/nsnng8
 *
 * @date 2020/12/16 3:09 下午
 *
 * 信息熵在有视频的页面效果不好，可以适当降低信息比，达到报警阈值
 */
import { IPluginFunc, IConfig } from './types/index.type';
import whiteScreenImageCheck from './whiteScreenImageCheck';

const TraceWhiteScreenPlugin: IPluginFunc = (core, config: IConfig) => {
  if (!(core && window)) {
    return;
  }
  const { initTime = 2000, rootContainerSelector, armMonitorCode, enableImageCheck } = config;
  const checkWhiteScreen = function () {
    const maxIntervalCnt = initTime / 300;
    // 根据根节点的是否为空来判断是否白屏，默认持续 2s 未发现直接上报白屏
    let intervalCnt = 0;
    const findRootContainerInterval = setInterval(() => {
      if ((document as any).querySelector(rootContainerSelector)) {
        clearInterval(findRootContainerInterval);
      }
      if (intervalCnt >= maxIntervalCnt) {
        clearInterval(findRootContainerInterval);
        core.logCustom({
          code: armMonitorCode, // 系统自动生成，请勿修改
          sampleRate: 1.0, // 目前采样率为 100.00%
          msg: '未检测到容器',
        });
      }
      intervalCnt++;
    }, 300);

    if (enableImageCheck === true) {
      whiteScreenImageCheck(core, config);
    }
  };

  try {
    window.addEventListener(
      'urlChange',
      () => {
        console.log('TraceWhiteScreenPlugin url change');
        checkWhiteScreen();
      },
      false,
    );
  } catch (e) {
    core.logCustom({
      code: armMonitorCode, // 系统自动生成，请勿修改
      sampleRate: 1.0, // 目前采样率为 100.00%
      msg: `白屏检测执行异常`,
      c1: e,
    });
  }
};

(window as any).TraceWhiteScreenPlugin = TraceWhiteScreenPlugin;
export default TraceWhiteScreenPlugin;
