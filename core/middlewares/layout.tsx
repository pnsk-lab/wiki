import { createGenerator } from '@unocss/core'
import presetUno from '@unocss/preset-uno'
import { MiddlewareHandler } from 'hono'
import { BASE_URL } from '../lib/env.ts'

const generator = await createGenerator({ presets: [presetUno()] })
const resetCSS = await Deno.readTextFile(
  './node_modules/@unocss/reset/tailwind.css',
)
const markdownCSS = await Deno.readTextFile(
  './node_modules/github-markdown-css/github-markdown.css',
)

export const layout = (): MiddlewareHandler => async (c, next) => {
  c.setRenderer(async (content) => {
    const string = (await content).toString()
    const style = await generator.generate(string, { preflights: false })

    const styles = [
      markdownCSS,
      style.css,
      resetCSS,
      `@media(prefers-color-scheme: dark){body{background:#0d1117;color:white;--pagefind-ui-background:#0d1117;--pagefind-ui-text:white;}}`,
      `.markdown-body ul{list-style-type: disc;}\n.markdown-body ol{list-style-type: disc}`,
    ]

    return c.html(
      <html>
        <head>
          <meta charset='UTF-8' />
          <meta
            name='viewport'
            content='width=device-width, initial-scale=1.0'
          />
          <style dangerouslySetInnerHTML={{ __html: styles.join('\n') }} />
          <link rel='stylesheet' href={BASE_URL + 'pagefind/pagefind-ui.css'} />
          <script src={BASE_URL + 'pagefind/pagefind-ui.js'} />
          <title>{c.var.title}</title>
          <meta name="google-site-verification" content="jiH3-q734_lRJ8iABELR5RWIBXhAYmdUrFqNEZU60zc" />
        </head>
        <body>
          {content}
        </body>
      </html>,
    )
  })
  await next()
}
