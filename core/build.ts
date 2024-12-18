import { toSSG } from 'hono/ssg'
import app from './app.tsx'
import * as fs from 'node:fs/promises'

await toSSG(app, fs, {
  dir: 'dist',
})
