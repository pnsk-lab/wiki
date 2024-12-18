import type { FC } from 'hono/jsx'
import { BASE_URL } from './lib/env.ts'
import { html, raw } from 'hono/html'

export const Header: FC = () => {
  return (
    <header>
      <div class='sticky top-0 w-full flex items-center justify-between p-2'>
        <a class='font-bold text-xl' href={BASE_URL}>
          Wiki
        </a>
        <button class='underline hover:no-underline' id='search-button'>
          Search
        </button>
      </div>
      <dialog id='search-dialog' class='p-4'>
        <div id='search-container'>
          <div id='search-modal'></div>
        </div>
      </dialog>
      <script async defer>
        {raw`
      {
        let isInited = false
        const searchDialog = document.getElementById('search-dialog')
        const searchBtn = document.getElementById('search-button')
        searchDialog.onclick = (e) => {
          if (e.target.closest('#search-container') === null) {
            searchDialog.close()
          }
        }
        searchBtn.onclick = () => {
          searchDialog.showModal()
          if (!isInited) {
            new PagefindUI({ element: '#search-modal' })
            const inp = document.getElementById('pagefind-ui__search-input')
            isInited = true
          }
        }
      }
    `}
      </script>
    </header>
  )
}
