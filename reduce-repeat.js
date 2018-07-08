/**
 * @file reduce-repeat
 * @author shuai.li
 */

const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
  input: fs.createReadStream('./repeat.csv')
});

rl.on('line', (line) => {
  const arr = line.split(',');
  const todoString = arr[6];
  const todoStringList = todoString.split(/[1\/234]/g);
  const componylist = todoStringList.filter((item) => {
    return item !== '1' && item !== '2' && item !== '3'&& item !== '4'&& item !== '\/' && !!item;
  });
  arr[6] = Array.from(new Set(componylist)).join(' | ');
  fs.writeFileSync('./reduce.txt', arr.join(',') + '\n', { flag: 'a' });

}).on('close', () => {
  console.log("全部完成")
});