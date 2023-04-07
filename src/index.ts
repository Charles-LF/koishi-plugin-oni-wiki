import { Context, Schema, h, segment } from 'koishi'
import {} from 'koishi-plugin-puppeteer'



export const name = 'oni-wiki'

export interface Config {}

export const Config: Schema<Config> = Schema.object({})

export const using = ['puppeteer']

export function apply(ctx: Context) {
  ctx
    .command('xq [title:text]', '获取wiki正文截图')
    .example('xq 电解器 --获取电解器的正文介绍截图')
    .action(async ({ session }, title = '') => {
      const url = 'https://oxygennotincluded.fandom.com/zh/wiki/' + title
      session.send('您需要的'+title+'在: '+'\n'+encodeURI(url))
      session.send('图片加载中，请稍等....')
      const page = await ctx.puppeteer.page()
      await page.setJavaScriptEnabled(false)
      try {
        await page.goto(url, {
          timeout: 0
        });
        let taget = await page.$('#mw-content-text')
        await page.addStyleTag({content: '#mw-content-text{padding: 40px}'})
        const img = await taget.screenshot({ type: 'jpeg', quality: 80 })
        session.send('图片截取成功')
        await page.close()
        return h.image(img,'image/jpeg')
      } catch (e) {
        await page.close()
        return '截取失败。。' + e
      }
    })
}
