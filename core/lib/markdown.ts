// @ts-types="@types/markdown-it"
import markdownIt from 'markdown-it'
import * as path from '@std/path'
import { BASE_URL } from './env.ts'
import footnote from 'markdown-it-footnote'
import alerts from 'markdown-it-github-alerts'

const transformLink = (link: string): string => {
  if (link.startsWith('.')) {
    return path.join(BASE_URL, 'wiki', link.replace(/\.md$/, ''))
  }
  return link
}

const it = markdownIt({
  linkify: true,
  html: true,
})
  .use(footnote)
  .use(alerts)
  .use((md) => {
    md.core.ruler.push('transform_links', function (state) {
      state.tokens.forEach((blockToken) => {
        if (blockToken.type !== 'inline' || !blockToken.children) {
          return
        }

        blockToken.children.forEach((token) => {
          if (token.type === 'link_open') {
            const hrefIndex = token.attrIndex('href')
            if (hrefIndex >= 0) {
              const hrefValue = token.attrs?.[hrefIndex][1]
              if (token.attrs) {
                token.attrs[hrefIndex][1] = transformLink(hrefValue ?? '')
              }
            }
          }
        })
      })
    })
  })

export const render = (md: string) => {
  return it.render(md)
}
