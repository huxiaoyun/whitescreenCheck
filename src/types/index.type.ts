/*
 * @Descripttion:
 * @version:
 * @Author: ludy.hxy
 * @Date:
 * @LastEditors:
 * @LastEditTime:
 */

export enum DIFF_TYPE {
  HAMMING = 'hamming',
  COSINE = 'cosine',
}

export type IPluginFunc = (core: any, ...args: any) => any;

export type IPlugin = [IPluginFunc, { [key: string]: any }];

export type IConfig = {
  armMonitorCode: number; // arms 自定义监控 code
  initTime: number; //  基准时间
  delayTime: number; // 白屏延迟检测时间
  rootContainerSelector: string; // 页面渲染根节点选择器
  enableImageCheck: boolean; // 是否开启图片检测
  ignoreElements?: any; // 忽略匹配的元素
  bgColor?: Color; // 图片背景色
  emptyPixelThredhold?: number; // 图片白色像素占比阈值， -1 表示全量上报
  entropyThredhold: number; // 信息熵阈值， -1 表示全量上报
  similarityThredhold: number; // canvas 对比异常阈值，超出相似度阈值即报异常  -1 表示全量上报
  diffType: DIFF_TYPE; // 使用对比的方案， 可选  hamming  cosine ， 默认 cosine
};

// 颜色定义
export type Color = [number, number, number];
