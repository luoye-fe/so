'use strict';
const fs = require('fs');
const path = require('path');
const URL = require('url');
const request = require('request');

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

    if (url.pathname === '/search') ctx.logger.info(url.query.q);

    ctx.body = requestInstance(`https://www.google.com/${url.path}`, ctx.req.headers['user-agent']);
  }
}

module.exports = HomeController;
