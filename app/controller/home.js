'use strict';
const fs = require('fs');
const path = require('path');
const URL = require('url');
const request = require('request');

const { Logger, FileTransport, ConsoleTransport } = require('egg-logger');

const logger = new Logger(); // 声明一个新的日志记录器
// 配置文件输出/存储
logger.set('file', new FileTransport({
    file: 'logs/searchKeyword.log',
    level: 'INFO',
}));
// 配置控制台输出
logger.set('console', new ConsoleTransport({
    level: 'INFO',
}));

const Controller = require('egg').Controller;

function requestInstance(url, ua, otherOptions = {}) {
	return request({
		url,
		headers: Object.assign({ 'User-Agent': ua, 'Referer': 'https://www.google.com'}, otherOptions)
	})
}

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    ctx.set('Content-Type', 'text/html; charset=utf-8');
    const stream = fs.createReadStream(path.join(__dirname, '../view/index.html'));
    ctx.body = stream;
  }
  async bg() {
    const { ctx } = this;
    const url = URL.parse(ctx.req.url, true);
    ctx.body = requestInstance(`https://bing.ioliu.cn/v1?${url.search}`, ctx.req.headers['user-agent']);
  }
  async other() {
    const { ctx } = this;
    const url = URL.parse(ctx.req.url, true);

    if (url.pathname === '/search') logger.info(`[ ${DateForm()} [INFO] ${getIP(ctx.request)} ] ${url.query.q}`);

    ctx.body = requestInstance(`https://www.google.com/${url.path}`, ctx.req.headers['user-agent']);
  }
}

/**
 * 获取实际IP信息
 * @param {object} req 请求参数
 * @return {string} 格式化IP
 */
function getIP(req) {
  let ip = req.get('x-forwarded-for'); // 获取代理前的ip地址
  if (ip && ip.split(',').length > 0) {
      ip = ip.split(',')[ 0 ];
  } else {
      ip = req.ip;
  }
  const ipArr = ip.match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g);
  return ipArr && ipArr.length > 0 ? ipArr[ 0 ] : '127.0.0.1';
}

/**
 * 时间格式化函数
 * @param {Date} date 时间
 * @param {string} format 格式化
 * @return {*} 格式化后时间
 */
function DateForm(date = new Date(), format = 'yyyy-MM-dd hh:mm:ss,S') {
  const o = {
      'M+': date.getMonth() + 1, // month
      'd+': date.getDate(), // day
      'h+': date.getHours(), // hour
      'm+': date.getMinutes(), // minute
      's+': date.getSeconds(), // second
      'w+': date.getDay(), // week
      'q+': Math.floor((date.getMonth() + 3) / 3), // quarter
      S: date.getMilliseconds(), // millisecond
  };
  if (/(y+)/.test(format)) { // year
      format = format.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
  }
  for (const k in o) {
      if (new RegExp('(' + k + ')').test(format)) {
          format = format.replace(RegExp.$1
              , RegExp.$1.length === 1 ? o[ k ] : ('00' + o[ k ]).substr(('' + o[ k ]).length));
      }
  }
  return format;
}

module.exports = HomeController;
