/**
 * 百度热搜
 */

const cheerio = require('cheerio');
const axios = require('axios');

const {getTodaysDate, readJSON, exists} = require('../common');
const {UA, CATEGORY} = require('../constants');

const crawler = async () => {
	const url = 'https://top.baidu.com/board?tab=realtime';
	const {data: source} = await axios.get(url, {headers: UA});

	const $ = cheerio.load(source);
	const target = $('[class^="category-wrap"]')
		.get()
		.map((item) => {
			const url = $(item).find('[class^="content"] a').attr('href');
			const title = $(item).find('.c-single-text-ellipsis').text().trim();
			const description = $(item)
				.find('[class^="hot-desc"]')
				.children()
				.remove()
				.end()
				.text()
				.trim();
			return {title, description, url};
		});

	return target;
};

const start = async () => {
	const today = getTodaysDate();
	const jsonPath = `./results/${CATEGORY.BAIDU_HOT}/${today}.json`;
	const hasJSON = exists(jsonPath);

	let result = await crawler();

	if (hasJSON) {
		const previous = readJSON(jsonPath);

		const previousTitles = previous.map((item) => item.title);
		result = result.reduce((accumulator, item) => {
			if (!previousTitles.includes(item.title)) {
				accumulator.push(item);
			}
			return accumulator;
		}, previous);
	}

	return result;
};

module.exports = start;
