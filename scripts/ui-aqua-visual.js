// Capture the approved blue-green implementation, then exercise enlarged text.
async (page) => {
  const results=[],errors=[];page.on('pageerror',e=>errors.push(e.message))
  const nav=p=>page.goto('http://127.0.0.1:5182/#/'+p)
  await page.goto('http://127.0.0.1:5182/');await page.reload()
  await page.setViewportSize({width:390,height:844})
  await nav('pages/login-role/index');await page.getByRole('button',{name:/我是老人/}).click()
  for(const [name,path] of [
    ['welcome','pages/login-welcome/index'],['home','pages/home/index'],['health','pages/health/index'],
    ['companion','pages/companion/index'],['service','pages/service/index'],['device','pkg-elder-detail/device/index'],
    ['report','pkg-elder-detail/health-report/index'],['medicine','pkg-elder-detail/medicine/index']
  ]) {
    await nav(path);await page.locator('.app-page').last().waitFor()
    await page.evaluate(()=>window.scrollTo(0,0))
    await page.waitForFunction(()=>[...document.querySelectorAll('.yuan-mascot-image img')].filter(i=>i.getClientRects().length).every(i=>i.complete&&i.naturalWidth>0)&&[...document.querySelectorAll('.yuan-mascot-image')].filter(i=>i.getClientRects().length).every(i=>getComputedStyle(i).opacity==='1'))
    await page.screenshot({path:'output/playwright/aqua-'+name+'-390.png',fullPage:name==='companion'})
    if(name!=='welcome') {
      await page.evaluate(()=>{
        const nodes=[...document.querySelectorAll('.h1,.h2,.label,.desc,.item-title,.item-right,.ui-badge,.unit,.smalltitle,.wd-button,.aqua-hero__title,.role-nav-item,.data-notice')];
        const sizes=nodes.map(el=>[el,parseFloat(getComputedStyle(el).fontSize)*1.3]);
        sizes.forEach(([el,size])=>el.style.fontSize=size+'px');
      })
      const overflow=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}))
      if(overflow.scroll>overflow.width+1)throw Error(name+' enlarged text overflow '+JSON.stringify(overflow))
      results.push(name+' 130% text no overflow')
      if(name==='health')await page.screenshot({path:'output/playwright/aqua-health-text130.png',fullPage:true})
    }
  }
  return {results,errors}
}
