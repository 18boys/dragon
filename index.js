/**
 * @file index
 * @author shuai.li
 */

const superagent = require('superagent');
const cheerio = require('cheerio');
const readline = require('readline');
const fs = require('fs');
const async = require('async');

console.log('爬虫程序开始运行......');

const rl = readline.createInterface({
  input: fs.createReadStream('./list.csv')
});

const urls = []

rl.on('line', (line) => {
  const arr = line.split(',');
  // console.log('ckm_index：%s ', arr[0]);
  // proxy(arr[0],arr)
  urls.push(arr)
}).on('close', () => {
  async.mapLimit(urls, 5, function (url, callback) {
    proxy(url[0],url,callback)
  }, function (err, result) {
    console.log("全部完成",err, result)
  });
});

// proxy(3, []);

function proxy(ckm_index, arr,callback) {
  superagent
    .post('http://www.chinadrugtrials.org.cn/eap/clinicaltrials.searchlistdetail')
    .send({
      keywords: '生物等效性',
      ckm_index,
      currentpage: 1,
      pagesize: 20,
      rule: 'CTR',
      sort: 'desc',
      sort2: 'desc',
    })
    // Http请求的Header信息
    .set('Accept', 'application/json, text/javascript, */*; q=0.01')
    .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
    .end(function (err, res) {
      if (err) {
        console.log('error', err, ckm_index);
        fs.writeFileSync('./error.txt', ckm_index+" " + err + '\n', { flag: 'a' });
        callback(null);
        return;
      }
      const $ = cheerio.load(res.text, { decodeEntities: false });

      // 主要的八个table
      const tableList = $('#div_open_close_01 > table');

      // 申办者名称
      const applyName = $(tableList[1]).find("tr:first-child > td:last-child").text().trim().replace(/\s/g, '');
      // console.log('申办者名称：' + '\t' + applyName)
      arr.push(applyName);

      // 各参加机构名称  所在城市 所在省份
      const allJoinComponyInfoDom = $(tableList[5]).find('>tbody > tr')[3];
      const allJoinComponyInfoDomList = $(allJoinComponyInfoDom).find("tr").slice(1); // 选择出所有有用的tr
      const allJoinComponyInfoDomListLength = allJoinComponyInfoDomList.length;
      const allJoinComponyNameList = [];
      const allJoinComponyCityList = [];
      const allJoinComponyProvinceList = [];
      const allJoinPersonList = [];
      for (let i = 0; i < allJoinComponyInfoDomListLength; i++) {
        const tdDomList = $(allJoinComponyInfoDomList[i]).find('td');
        allJoinComponyNameList.push($(tdDomList[1]).text().trim());
        allJoinComponyCityList.push($(tdDomList[5]).text().trim());
        allJoinComponyProvinceList.push($(tdDomList[4]).text().trim());
        allJoinPersonList.push($(tdDomList[2]).text().trim());
      }
      // console.log('申办机构:' + '\t' + allJoinComponyNameList.join(' | '));
      // console.log('所在城市:' + '\t' + allJoinComponyCityList.join(' | '));
      // console.log('所在省份:' + '\t' + allJoinComponyProvinceList.join(' | '));
      // console.log('主要参与者:' + '\t' + allJoinPersonList.join(' | '));
      arr.push(allJoinComponyNameList.join(' | '));
      arr.push(allJoinComponyCityList.join(' | '));
      arr.push(allJoinComponyProvinceList.join(' | '));
      arr.push(allJoinPersonList.join(' | '));

      // 将arr写入到文件
      fs.writeFileSync('./r.txt', arr.join(',') + '\n', { flag: 'a' });
      console.log('完成', ckm_index,",当前进度:"+ ckm_index * 100 / 1736 + '%')
      callback(null)
    });
}