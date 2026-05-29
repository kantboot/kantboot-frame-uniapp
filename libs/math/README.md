# 数学运算模块 ($kt.math)

该模块提供了一些用于精确计算的数学函数，包括加法、减法、乘法、除法以及批量计算函数。还提供了一个算式解释器，可以直接计算算式字符串的结果。

## 函数列表

### add(arg1, arg2)
精确的加法函数。

### sub(arg1, arg2)
精确的减法函数。

### mul(arg1, arg2)
精确的乘法函数。

### div(arg1, arg2)
精确的除法函数。

### batchAdd(...args)
批量加法函数。

### batchSub(...args)
批量减法函数。

### batchMul(...args)
批量乘法函数。

### batchDiv(...args)
批量除法函数。

### evaluate(expression)
算式解释器函数，将算式字符串直接计算出结果。

## 使用示例

```javascript
import math from './guodingZwaveService.js';

console.log(math.add(0.1, 0.2)); // 0.3
console.log(math.sub(0.3, 0.1)); // 0.2
console.log(math.mul(0.1, 0.2)); // 0.02
console.log(math.div(0.3, 0.1)); // 3

console.log(math.batchAdd(0.1, 0.2, 0.3)); // 0.6
console.log(math.batchSub(0.3, 0.1, 0.1)); // 0.1
console.log(math.batchMul(0.1, 0.2, 0.3)); // 0.006
console.log(math.batchDiv(0.3, 0.1, 0.1)); // 30

console.log(math.evaluate("0.1 + 0.2 * (0.3 - 0.1)")); // 0.14
```
