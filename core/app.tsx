import { Hono } from 'hono'
import { fileWatcher } from '@ns/hono-file-watcher'
import { layout } from './middlewares/layout.tsx'
import * as fs from '@std/fs'
import * as path from '@std/path'
import { render } from './lib/markdown.ts'
import { Header } from './Header.tsx'
import { ssgParams } from 'hono/ssg'
import { html, raw } from 'hono/html'
import { BASE_ORIGIN_URL } from './lib/env.ts'

const app = new Hono()

app.use(fileWatcher({
  targetDirs: ['./wiki', './core'],
  enabled: Deno.env.get('DEV') === 'true',
}))
app.use(layout())

let articleN: null | number = null
app.get('/', async (c) => {
  if (!articleN) {
    articleN =
      (await Array.fromAsync(fs.expandGlob('./wiki/**/*.md'))).filter((e) =>
        e.isFile
      ).length
  }
  c.set('title', 'pnsk-lab Wiki')
  return c.render(
    <div class='h-dvh flex flex-col'>
      <div class=''>
        <Header />
      </div>
      <div class='grow'>
        <div class='flex flex-col gap-2 justify-center items-center h-[50dvh]'>
          <div class='text-3xl font-bold'>pnsk-lab Wiki</div>
          <div>{articleN} の記事を探索する。</div>
        </div>
        <div class='p-5'>
          <div id='main-search' />
          <div class='text-right'>
            Powered By{' '}
            <a
              href='https://pagefind.app/'
              class='underline hover:no-underline'
              target='_blank'
              rel='noopener noreferrer'
            >
              PageFind
            </a>
          </div>
        </div>
      </div>
      <script>
        {raw`
document.addEventListener('DOMContentLoaded', () => {
  new PagefindUI({ element: "#main-search" });
});`}
      </script>
    </div>,
  )
})

app.get(
  '/wiki/:name',
  ssgParams(async () => {
    const params: Record<string, string>[] = []
    for await (const entry of fs.expandGlob('wiki/*.md')) {
      if (!entry.isFile) {
        continue
      }
      params.push({
        name: entry.name.replace(/\.md$/, ''),
      })
    }
    return params
  }),
  async (c) => {
    const { name } = c.req.param()
    let html: string
    try {
      html = await Deno.readTextFile(path.join('wiki', name + '.md'))
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) {
        throw error
      }
      return c.notFound()
    }

    c.set('title', `${name} | pnsk-lab Wiki`)

    return c.render(
      <div class='min-h-dvh'>
        <Header />
        <main data-pagefind-body>
          <div
            class='markdown-body p-5'
            dangerouslySetInnerHTML={{
              __html: render(html),
            }}
          />
        </main>
        <div class="text-right p-2">
          <a target='_blank' rel='noopener noreferrer' href={`https://github.com/pnsk-lab/wiki/edit/main/wiki/${name}.md`} class="text-pink-400 hover:text-pink-500">📝このページの編集を GitHub で提案</a>
        </div>
      </div>,
    )
  },
)

app.get('/sitemap.xml', async (c) => {
  const entries = (await Array.fromAsync(fs.expandGlob('wiki/*.md'))).map(
    (entry) => {
      return {
        name: entry.name.replace(/\.md$/, ''),
      }
    },
  )
  c.header('Content-Type', 'application/xml')
  return c.body(html`<?xml version="1.0" encoding="UTF-8"?>${(
    <urlset xmlns='http://www.sitemaps.org/schemas/sitemap/0.9'>
      {entries.map((entry) => (
        <url>
          <loc>{BASE_ORIGIN_URL}wiki/{entry.name}</loc>
        </url>
      ))}
    </urlset>
  )}`.toString())
})

export default app
