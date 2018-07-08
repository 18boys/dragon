# dragon
从药物临床实验登记信息网站抓取信息,主要使用superagent,cheerio,async来控制并发

* 获取生物等效性list
* 使用superagent抓取详情数据,使用cheerio分析html,得到数据
* 去重,写入最终生成的csv文件
