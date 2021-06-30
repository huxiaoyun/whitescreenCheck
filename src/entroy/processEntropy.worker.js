/* eslint-disable no-console */
// worker 文件未编译，需要使用 es5 语法
const processEntropy = function () {
  const chunk = function (array, size = 1) {
    const validSize = Math.max(size, 0);
    const length = array == null ? 0 : array.length;
    if (!length || validSize < 1) {
      return [];
    }
    let index = 0;
    let resIndex = 0;
    const result = new Array(Math.ceil(length / validSize));

    while (index < length) {
      result[resIndex++] = array.slice(index, (index += validSize));
    }
    return result;
  };

  const formula = function (distribution, total, normalize) {
    let distributionSize = 0;
    let res = Object.keys(distribution).reduce((r, v) => {
      const p = distribution[v] / total;
      r += p * -Math.log2(p);
      distributionSize ++;
      return r;
    }, 0);
    if (normalize) {
      let k = Math.log2(distributionSize);
      res = k ? res / k : 0;
      if (res > 1) {
        res = 1;
      }
    }
    return res;
  }

  const getScale = function (colorGradation) {
    const n = Math.log2(colorGradation);
    if (n % 1 === 0 && n < 9 && n > 0) {
      return 256 / colorGradation;
    }
    return 1;
  }

  const Pixel = function (pixelChunk) {
    this.pixelChunk = pixelChunk;
    this.r = pixelChunk[0];
    this.g = pixelChunk[1];
    this.b = pixelChunk[2];
    this.a = pixelChunk[3];
    this.hashKey = ([this.r, this.g, this.b]).toString;

    this.diff = function (pixel) {
      const res = [];
      this.pixelChunk.forEach((v, k) => {
        res[k] = this.pixelChunk[k] - pixel.pixelChunk[k];
      });
      return res;
    };
  };

  const PixelArray = function (imageData, width, height) {
    this.width = width;
    this.height = height;
    this.value = chunk(imageData.data, 4).map(v => {
        return (new Pixel(v));
    });
    this.length = this.value.length;

    this.getPixelByCoordinate = function (x, y) {
      const index = this.coordinate2Index(x, y);
      return this.value[index];
    };

    this.getPixelByCoordinate = function (x, y) {
      const index = this.coordinate2Index(x, y);
      return this.value[index];
    };

    this.getPixelByIndex = function (index) {
      return this.value[index];
    };

    this.getPixelsByCoordinateArray = function (arr) {
      const res = arr.map(v => {
        return v ? this.getPixelByCoordinate(v[0], v[1]) : false;
      });
      return res;
    };

    this.getNeighborPixelByCoordinate = function (x, y, size = 1) {
      const neiborCoordinates = this.getNeighborCoordinateByCoordinate(x, y, size);
      return this.getPixelsByCoordinateArray(neiborCoordinates);
    };

    this.getNeighborPixelByIndex = function (index, size) {
      const neiborCoordinates = this.getNeighborCoordinateByIndex(index, size);
      return this.getPixelsByCoordinateArray(neiborCoordinates);
    };

    this.coordinate2Index = function (x, y) {
      if (!this.isCoordinateInRange(x, y)) {
        return false;
      }
      return this.width * y + x;
    };

    this.index2coordinate = function (index) {
      const x = index % this.width;
      const y = Math.floor(index / this.width);
      return [x, y];
    };

    this.getNeighborCoordinateByIndex = function (index, size) {
      const coordinate = this.index2coordinate(index);
      return this.getNeighborCoordinateByCoordinate(coordinate[0], coordinate[1], size);
    };

    this.getNeighborCoordinateByCoordinate = function (x, y, size = 1) {
      const res = [];
      for (let i = y - size; i <= y + size; i ++) {
        for (let j = x - size; j <= x + size; j ++) {
          res.push(this.isCoordinateInRange(j, i) ? [j, i] : false);
        }
      }
      return res;
    };

    this.isCoordinateInRange = function (x, y) {
      return (x < this.width && x >=0 && y < this.height && y >= 0);
    };

    this.getAvgPixel = function (pixelArray) {
      const calcChunk = [0, 0, 0, 0];
      let count = 0;
      pixelArray.forEach(v => {
        if (v) {
          count ++;
          calcChunk.forEach((vv, kk) => {
            calcChunk[kk] += v.pixelChunk[kk];
          });
        }
      });
      calcChunk.forEach((v, k) => {
        calcChunk[k] = Math.floor(calcChunk[k] / count);
      });
      return new Pixel(calcChunk);
    }
  }

  const CanvasImage = function (opts) {
    const {width, height, imageData} = opts;

    this.width = width;
    this.height = height;
    this.imageData = imageData;
    this.pixelArray = new PixelArray(this.imageData, width, height);

    this.getEntropy = function (opt = {}) {
      const {
        colorGradation = 256,
        normalize = false
      } = opt;
      const scale = getScale(colorGradation);
      const distribution = {};
      const pixelCount = this.pixelArray.length;
      this.pixelArray.value.forEach(v => {
        const hashKey = v.pixelChunk.slice(0, 3).map(v => Math.trunc(v / scale)).toString();
        distribution[hashKey] = distribution[hashKey] ? ++distribution[hashKey] : 1;
      });
      return formula(distribution, pixelCount, normalize);
    };

    this.get2DEntropy = function (opt = {}) {
      const {
        colorGradation = 256,
        normalize = false
      } = opt;
      const scale = getScale(colorGradation);
      const distribution = {};
      const pixelCount = this.pixelArray.length;
      const array = this.pixelArray.value;
      array.forEach((v, k) => {
        const current = this.pixelArray.getPixelByIndex(k);
        const neighbor = this.pixelArray.getNeighborPixelByIndex(k);
        const avg = this.pixelArray.getAvgPixel(neighbor);
        const diff = current.diff(avg);
        const hashKey = diff.slice(0, 3).map(v => Math.trunc(v / scale)).toString();
        distribution[hashKey] = distribution[hashKey] ? ++ distribution[hashKey] : 1;
      });
      return formula(distribution, pixelCount, normalize);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onmessage = function(e) {
    console.log('TraceWhiteScreenPlugin receive data from main, worker start, begin cal entroy');
    const { width, height, imageData } = e.data;
    // 执行计算逻辑
    const img = new CanvasImage({width, height, imageData});
    const entropy = img.get2DEntropy({normalize: false});
    console.log('TraceWhiteScreenPlugin cal entroy done, post entropy to main');
    postMessage(entropy);
  }

  return {
    CanvasImage,
  };
}

module.exports = {
  processEntropy,
};
