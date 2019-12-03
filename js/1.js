// 类型判断
/**
 *类型判断
 * @value {*}
 * @typeStr {String} 值为mapToLower[i],带上这个值表示判断是否为该类型
 */
function type(value,typeStr){
    let mapToLower={};
    let valueType
    // 生成mapToLower映射,底下访问获得转换后的值
    "Boolean Number String Function Array Date RegExp Object Error Null Undefined".split(" ").forEach(item=>{
      mapToLower["[object " + item + "]"] = item.toLowerCase();
    })
    // 判断类型
    if (value === null) {//null or undefined（兼容ie写法）
        valueType=value + ""
    }else{
        valueType=typeof value === "object" || typeof value === "function" ?
        mapToLower[Object.prototype.toString.call(value)] || "object" :
        typeof value
    }
    // 返回
    return typeStr ? (valueType === typeStr) : valueType
}
/* 是否初始化 */
function defined(obj) {
    return typeof obj !== 'undefined' && obj !== null;
}
/** 精确小数点位数
 * @decimals {Number} 要精确的小数点位数
 **/
function round(n, decimals = 0){
    return Number(`${Math.round(`${n}e${decimals}`)}e-${decimals}`)
}
/** 数字填充到多少位 
 * @char {String}
 * */
function fillNumber(n,length,char='0'){
    return (Array(length).join(char) + n).slice(-length);
}
/** 大数字转化为 万/亿/万亿
 * @decimals {Number} 要精确的小数点位数
 * @char {String} 非数字时，要显示的内容
 **/
function unitNumber(n,decimals = 0,char=''){
    const unitMap=[
        {length:13,unit:'万亿'},
        {length:9,unit:'亿'},
        {length:5,unit:'万'}
    ]
    let result
    if(isNaN(Number(n))) return char
    let length=(+n + '.').indexOf('.')
    unitMap.some(item=>{
        return length >= item.length && (result=round(n/Math.pow(10,item.length-1),decimals)+item.unit)
    })
    return result || round(n,decimals)
}
/**
 * 去除字符串空格
 * @param {*} str
 * @param {boolean} [all=false](是否中间的空白也要移除)
 */
function trim(str, all = false) {
    if (all) return str.replace(/\s+/g, "");
    else return str.replace(/(^\s*)|(\s*$)/g, "");
}


/**深拷贝
 * @CloneObj {*} 要拷贝的对象
 * @deep {Boolean} 是否再深入的拷贝，针对有其它复杂属性的obj
 * */
function deepClone (CloneObj,deep=false){
    const deepCopy = function(obj) {
        if (typeof obj !== 'object') return;
        let newObj = obj instanceof Array ? [] : {};
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                newObj[key] = typeof obj[key] === 'object' ? deepCopy(obj[key]) : obj[key];
            }
        }
        return newObj;
    }
    return deep ? deepCopy(CloneObj) : JSON.parse(JSON.stringify(CloneObj))
}
/**计算函数执行时间
 * @cb {Function} 函数
 **/
function timeTaken(cb){
    console.time('timeTaken');
    const r = cb();
    console.timeEnd('timeTaken');
    return r;
}
/* 获得唯一值 */
const uniqueKey = (function () {
    let uniqueKeyHash = Math.random().toString(36).substring(2, 9)
    let idCounter = 0
    return function () {
        return uniqueKeyHash +idCounter++;
    };
}());
/**
 *防抖函数
 *最后触发后的 ns 后执行
 * @param {*} callback
 * @param {number} [delay=300]
 */
function debounce(callback, delay = 300) {
    let timer = null;
  
    function clearTimer() {
      clearTimeout(timer);
      timer = null;
    }
    return function (args) {
      clearTimer();
      timer = setTimeout(() => callback(args, "节流"), delay);
      return timer;
    }
  }
  
/**
 *节流函数
*  ns 内只会触发一次
* @param {*} callback
* @param {number} [delay=300]
* @param {boolean} [immediate=false](是否立即执行)
* @param {boolean} [debounceMode=true](是否防抖：保证最后一个触发，能执行函数，使其更精确)
* 思路：节流+防抖
* 细节优化：节流区域的第一个触发，这边节流触发，阻止防抖触发。避免，其如果是最后触发，导致的两边都执行了函数
*/
function throttle(callback, delay = 300, immediate = false, debounceMode = true) {
    let timer = null; //节流计时器
    const debounceFun = debounce(callback, delay);
    let timer1 = null; //防抖计时器

    function clearTimer() {
        clearTimeout(timer);
        timer = null;
    }
    return function (args) {
        if (debounceMode) {
        timer1 = debounceFun(args)
        };
        if (!timer) {
            if (immediate) {
                callback(args);
                timer = setTimeout(() => clearTimer(), delay);
            } else {
                timer = setTimeout(() => {
                callback(args);
                clearTimer();
                }, delay);
            }
            // 阻止防抖再次执行
            clearTimeout(timer1);
        }
        return timer;
    }
}

/**
 * 生成随机码(数字，字母，符号，中文。或组合)
 * @param {string} [str='0'](代表需要哪些字符集合)
 * @param {*} [length](要返回字符串的最小长度)
 * @param {*} [maxLength](可选,要返回字符串的最大长度
 */
function randomChars(str = '0',length,maxLength) {
    //简陋版： Math.random().toString(count).substring(2); //count为多少进制，2(0~1)~36(0~9,a~z,A~Z)，
    //缺点：1、random随机数，位数越短。转化后字符越雷同；
    //2、只能是数字、小写字母、大写字母
    
    //这边采用：String.fromCharCode();Unicode码
    if (typeof str == 'string') {
      // str=trim(str);//去除首尾空白，中间空白会保留
      let a = false;
      let A = false;
      let num = false;
      let char = false;//ascii码对应的其它字符
      let chinese=false;//中文：4E00-9FA5:即19968~40869
  
      let randomLength=maxLength ? Math.floor((Math.random() * (maxLength-length)) + length):length;//要返回的字符串长度 
      let newStr = "";
      //分析字符串，从而判断需要哪种类型或混合的字符串
      function dissect() {
        let asciiIndex;
        [...str].forEach(item => {
          asciiIndex = item.charCodeAt();
          if (asciiIndex >= 48 && asciiIndex <= 57) num = true; //数字
          else if (asciiIndex >= 65 && asciiIndex <= 90) A = true; //大写字母
          else if (asciiIndex >= 97 && asciiIndex <= 122) a = true; //小写字母
          else if (asciiIndex >= 33 && asciiIndex <= 126) char = true; //ascii码，其它可显示的字符 ，32是空格。不需要取33
          else if(asciiIndex >= 19968 && asciiIndex <= 40869) chinese=true;//汉字
        });
      }
      // 根据规则，返回单个符合该规则的字符
      function createOneChar() {
        let arr = [];
        if (num) arr.push(String.fromCharCode(Math.floor((Math.random() * 9) + 48)));
        if (A) arr.push(String.fromCharCode(Math.floor((Math.random() * 25) + 65)));
        if (a) arr.push(String.fromCharCode(Math.floor((Math.random() * 25) + 97)));
        if (char) arr.push(String.fromCharCode(Math.floor((Math.random() * 94) + 33))); //32是空格。不需要取33
        if (chinese) arr.push(String.fromCharCode(Math.floor((Math.random() * 20901) + 19968))); 
        // 返回随机字符
        if(arr.length>0) return arr[Math.floor((Math.random() * arr.length))];
        else return "";
      }
      // 开始生成需要的字符串
      dissect();
      for (let i = 0; i < randomLength; i++) {
        newStr += createOneChar();
      }
      return newStr;
    }
  }
  


/**
 * 
 * @desc 获取滚动条距顶部的距离
 */
function getScrollTop() {
    return (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
}
