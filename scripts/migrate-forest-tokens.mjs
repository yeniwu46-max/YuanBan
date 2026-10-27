// One-shot, mechanical migration of existing presentation styles; no business logic changes.
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { resolve, join } from 'node:path'
const root = resolve('apps/mobile/src')
const colors = {
 '#243a31':'var(--text)', '#315943':'var(--primary)', '#5b8b62':'var(--primary)', '#446a57':'var(--primary)',
 '#7ab66b':'var(--primary)', '#7a6f5d':'var(--muted)', '#8c806c':'var(--muted)', '#8e816e':'var(--muted)',
 '#fffdf7':'var(--bg)', '#f7f2e8':'var(--bg)', '#e7f3df':'var(--green-soft)', '#e6f2df':'var(--green-soft)',
 '#efe3ce':'var(--line)', '#e9e0d0':'var(--line)', '#d6e8d4':'var(--line)', '#cbe2bf':'var(--line)',
 '#f4efe5':'#edf1ed', '#f1ece1':'#e7eee8', '#e56b5f':'var(--red)', '#fff1ec':'var(--red-soft)',
 '#ffe0da':'var(--red-soft)', '#c9822c':'var(--warm)', '#fff0d6':'var(--warm-soft)', '#fff7e8':'var(--warm-soft)'
}
async function migrate(dir) {
 for (const e of await readdir(dir,{withFileTypes:true})) {
  const path=join(dir,e.name)
  if(e.isDirectory()){if(!['assets','jade','ui'].includes(e.name)) await migrate(path);continue}
  if(!e.name.endsWith('.vue'))continue
  let text=await readFile(path,'utf8'), next=text.replace(/^\uFEFF/,'').replace(/\r\n/g,'\n')
  if (e.name === 'index.vue' && /<view class="app-page(?: |")/.test(next)) {
   next=next.replace(/<view class="app-page([^"]*)"/, '<AppPage class="$1"')
   const end=next.lastIndexOf('</view>', next.indexOf('</template>'))
   // Pages can contain inner <template>; use the outer template closing before script.
   const script=next.indexOf('<script'), outer=next.lastIndexOf('</view>',script)
   if(outer>=0) next=next.slice(0,outer)+'</AppPage>'+next.slice(outer+7)
  }
  next=next.replace(/<style([\s\S]*?)<\/style>/g, block => {
   for (const [old,value] of Object.entries(colors)) block=block.replace(new RegExp(old,'gi'),value)
   return block.replace(/font-weight:\s*(800|900|1000)/g,'font-weight: 600').replace(/font-size:\s*(10|11|12|13|14|15)px/g,'font-size: var(--helper-size, 16px)')
  })
  // Dynamic data icons in reusable components and pages.
  next=next.replace(/(<(?:view|text)[^>]*class="[^"]*(?:iconbox|quick-icon|mood-icon|action-icon|row-icon|empty-icon)[^"]*"[^>]*>)\s*\{\{\s*([\w.]+)\s*\}\}\s*(<\/(?:view|text)>)/g,'$1<AppIcon :name="$2" />$3')
  next=next.replace(/(<(?:view|text)[^>]*class="[^"]*(?:iconbox|mini-icon|quick-icon|mood-icon|empty-icon)[^"]*"[^>]*>)\s*([^<{}]+?)\s*(<\/(?:view|text)>)/g, (_,a,icon,b)=>a+'<AppIcon name="'+icon.trim()+'" />'+b)
  next=next.replace(/<text class="chev">›<\/text>/g,'<AppIcon name="chevron" />')
  // Decorative emoji prefixes on labeled controls: the label already conveys the action.
  next=next.replace(/(>)([\p{Extended_Pictographic}\uFE0F\u200D☎✓➤▤]+)\s+(?=[\u4e00-\u9fff])/gu,'$1')
  if(next!==text) await writeFile(path,next)
 }
}
await migrate(root)
console.log('Presentation migration complete')
