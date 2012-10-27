///import editor.js
///import core/utils.js
/**
 * @class baidu.editor.utils     工具类
 */

(function() {
	baidu.editor.utils = {};
	var noop = new Function();
	var utils = baidu.editor.utils =
	/**@lends baidu.editor.utils.prototype*/
	{
		/**
         * 以obj为原型创建实例
         * @public
         * @function
         * @param {Object} obj
         * @return {Object} 返回新的对象
         */
		makeInstance: function(obj) {
			noop.prototype = obj;
			obj = new noop;
			noop.prototype = null;
			return obj;
		},
        /**
         * 将s对象中的属性扩展到t对象上
         * @public
         * @function
         * @param {Object} t
         * @param {Object} s
         * @param {Boolean} b 是否保留已有属性
         * @returns {Object}  t 返回扩展了s对象属性的t
         */
		extend: function(t, s, b) {
			if (s) {
				for (var k in s) {
					if (!b || ! t.hasOwnProperty(k)) {
						t[k] = s[k];
					}
				}
			}
			return t;
		},
		/**
         * 判断是否为数组
         * @public
         * @function
         * @param {Object} array
         * @return {Boolean} true：为数组，false：不为数组
         */
		isArray: function(array) {
			return Object.prototype.toString.apply(array) === '[object Array]'
		},
		/**
         * 判断是否为字符串
         * @public
         * @function
         * @param {Object} str
         * @return {Boolean} true：为字符串。 false：不为字符串
         */
		isString: function(str) {
			return typeof str == 'string' || str.constructor == String;
		},
//		/**
//         * 遍历元素执行迭代器
//         * @public
//         * @function
//         * @param {Array|Object} eachable    要迭代的对象
//         * @param {Function} iterator        迭代函数
//         * @param {Object} this_             传入对象
//         */
//		each: function(eachable, iterator, this_) {
//			if (utils.isArray(eachable)) {
//				for (var i = 0; i < eachable.length; i++) {
//					iterator.call(this_, eachable[i], i, eachable);
//				}
//			} else {
//				for (var k in eachable) {
//					iterator.call(this_, eachable[k], k, eachable);
//				}
//			}
//		},
		/**
         * subClass继承superClass
         * @public
         * @function
         * @param {Object} subClass       子类
         * @param {Object} superClass    超类
         * @return    {Object}    扩展后的新对象
         */
		inherits: function(subClass, superClass) {
			var oldP = subClass.prototype;
			var newP = utils.makeInstance(superClass.prototype);
			utils.extend(newP, oldP, true);
			subClass.prototype = newP;
			return (newP.constructor = subClass);
		},

		/**
         * 为对象绑定函数
         * @public
         * @function
         * @param {Function} fn        函数
         * @param {Object} this_       对象
         * @return {Function}  绑定后的函数
         */
		bind: function(fn, this_) {
			return function() {
				return fn.apply(this_, arguments);
			};
		},

		/**
         * 创建延迟执行的函数
         * @public
         * @function
         * @param {Function} fn       要执行的函数
         * @param {Number} delay      延迟时间，单位为毫秒
         * @param {Boolean} exclusion 是否互斥执行，true则执行下一次defer时会先把前一次的延迟函数删除
         * @return {Function}    延迟执行的函数
         */
		defer: function(fn, delay, exclusion) {
			var timerID;
			return function() {
				if (exclusion) {
					clearTimeout(timerID);
				}
				timerID = setTimeout(fn, delay);
			};
		},



		/**
         * 查找元素在数组中的索引, 若找不到返回-1
         * @public
         * @function
         * @param {Array} array     要查找的数组
         * @param {*} item          查找的元素
         * @param {Number} at       开始查找的位置
         * @returns {Number}        返回在数组中的索引
         */
		indexOf: function(array, item, at) {
			at = at || 0;
			while (at < array.length) {
				if (array[at] === item) {
					return at;
				}
				at++;
			}
			return - 1;
		},

		/**
         * 移除数组中的元素
         * @public
         * @function
         * @param {Array} array       要删除元素的数组
         * @param {*} item            要删除的元素
         */
		removeItem: function(array, item) {
			var k = array.length;
			if (k) while (k--) {
				if (array[k] === item) {
					array.splice(k, 1);
					break;
				}
			}
		},

		/**
         * 删除字符串首尾空格
         * @public
         * @function
         * @param {String} str        字符串
         * @return {String} str       删除空格后的字符串
         */
		trim: function() {
			// "non-breaking spaces" 就是&nbsp;不能被捕获，所以不用\s
			var trimRegex = /(^[ \t\n\r]+)|([ \t\n\r]+$)/g;
			return function(str) {
				return str.replace(trimRegex, '');
			};
		}(),

		/**
         * 将字符串转换成hashmap
         * @public
         * @function
         * @param {String} list       字符串，以‘，’隔开
         * @returns {Object}          转成hashmap的对象
         */
		listToMap: function(list) {
			if (!list) {
				return {};
			}
			var array = list.split(/,/g),
			k = array.length,
			map = {};
			if (k) while (k--) {
				map[array[k]] = 1;
			}
			return map;
		},

		/**
         * 将str中的html符号转义
         * @public
         * @function
         * @param {String} str      需要转义的字符串
         * @returns {String}        转义后的字符串
         */
		unhtml: function() {
			var map = {
				'<': '&lt;',
				'&': '&amp',
				'"': '&quot;',
				'>': '&gt;'
			};
			function rep(m) {
				return map[m];
			}
			return function(str) {
				return str ? str.replace(/[&<">]/g, rep) : '';
			};
		}(),

		/**
         * 将css样式转换为驼峰的形式。如font-size -> fontSize
         * @public
         * @function
         * @param {String} cssName      需要转换的样式
         * @returns {String}        转换后的样式
         */
		cssStyleToDomStyle: function() {
			var test = document.createElement('div').style,
			cssFloat = test.cssFloat != undefined ? 'cssFloat': test.styleFloat != undefined ? 'styleFloat': 'float',
			cache = {
				'float': cssFloat
			};
			function replacer(match) {
				return match.charAt(1).toUpperCase();
			}
			return function(cssName) {
				return cache[cssName] || (cache[cssName] = cssName.toLowerCase().replace(/-./g, replacer));
			};
		}(),
		/**
         * 加载css文件，执行回调函数
         * @public
         * @function
         * @param {document}   doc  document对象
         * @param {String}    path  文件路径
         * @param {Function}   fun  回调函数
         * @param {String}     id   元素id
         */
        loadFile : function(doc,obj,fun){
            if (obj.id && doc.getElementById(obj.id)) {
				return;
			}
            var element = doc.createElement(obj.tag);
            delete obj.tag;
            for(var p in obj){
                element.setAttribute(p,obj[p]);
            }
			element.onload = element.onreadystatechange = function() {
				if (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete') {
					if (fun) fun();
					element.onload = element.onreadystatechange = null;
				}
			};

			doc.getElementsByTagName("head")[0].appendChild(element);

        },
        isEmptyObject : function(obj){
            for ( var p in obj ) {
                return false;
            }
            return true;
        },
        fixColor : function (name, value) {
            if (/color/i.test(name) && /rgba?/.test(value)) {
                var array = value.split(",");
                if (array.length > 3)
                    return "";
                value = "#";
                for (var i = 0, color; color = array[i++];) {
                    color = parseInt(color.replace(/[^\d]/gi, ''), 10).toString(16);
                    value += color.length == 1 ? "0" + color : color;
                }

                value = value.toUpperCase();
            }
            return  value;
        }

	}
})();

