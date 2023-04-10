import { Context, Schema, h, segment,App } from 'koishi';
import {} from 'koishi-plugin-puppeteer';
import axios from 'axios';

export const name = 'oni-wiki'

export interface Config {}

export const Config: Schema<Config> = Schema.object({})

export const using = ['puppeteer']

export function apply(ctx: Context) {
  ctx
    .command('xq [itemName:text]', '获取wiki正文截图')
    .example('xq 电解器 --获取电解器的正文介绍截图')
    .action(async ({ session }, itemName = '') => {
      // sb一样的实现过程、、
      const awserList:number[] = [1,2,3,4,5];
      const tem: any[] = [];
      const baseUrl = 'https://oxygennotincluded.fandom.com/zh/api.php?action=opensearch&format=json&errorformat=html&limit=5&search='+itemName;
      try {
        session.send('正在搜索：'+itemName);
        const json = (await axios.get(baseUrl)).data;
        const  urlList:string[] = json[3];
        const item:string[] = json[1];
  
        if (itemName==item[0]){
          return screenShot(urlList[0])
        }else{
          item.forEach((val,index:number)=>{
            tem.push(`${index + 1}. ${val}\n`);
          });
          await session.send('您要的'+itemName+'不存在，以下是搜索结果(在30秒内@我回复前面的数字序号)：\n'+tem);
          const reg = /\s+/g;
          const awser = Number((await session.prompt(50 * 1000))?.replace(reg,'')?.slice(-1));
          if (awserList.indexOf(awser)!==-1){
            return screenShot(urlList[awser-1])
          }else{
            session.send('Are you kidding me?')
          }
        }
      } catch (error) {
        session.send('请求失败，原因是：'+error)
      }
      async function screenShot(itemUrl:string) {
        session.send('开始截取，请稍等。。。。')
        const page = await ctx.puppeteer.page();
        await page.setJavaScriptEnabled(false);
        try {
          await page.goto(itemUrl, {
            timeout: 0
          });
          let taget = await page.$('#mw-content-text');
          await page.addStyleTag({content: '#mw-content-text{padding: 40px}'});
          const img = await taget.screenshot({ type: 'jpeg', quality: 65 });
          session.send('图片截取成功');
          await page.close();
          return h.image(img,'image/jpeg');
        } catch (e) {
          await page.close()
          return '截取失败。。' + e
        }
      }
    })
}
