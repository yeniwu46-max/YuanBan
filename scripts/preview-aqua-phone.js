async(page)=>{
  await page.setViewportSize({width:390,height:844})
  const cdp=await page.context().newCDPSession(page)
  await cdp.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true})
  await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1})
  await page.goto('http://127.0.0.1:5182/#/pages/login-role/index');await page.reload()
  await page.getByRole('button',{name:/我是老人/}).click()
  await page.getByRole('button',{name:'登录并继续',exact:true}).click()
  await page.getByRole('button',{name:'保存信息 ›',exact:true}).click()
  await page.getByRole('button',{name:'完成绑定 ✓',exact:true}).click()
  await page.getByRole('button',{name:'进入首页',exact:true}).click()
  await page.getByRole('navigation',{name:'长辈空间'}).waitFor()
  await page.evaluate(()=>window.scrollTo(0,0))
  await page.waitForFunction(()=>[...document.querySelectorAll('.yuan-mascot-image img')].filter(i=>i.getClientRects().length).every(i=>i.complete&&i.naturalWidth>0))
  await page.screenshot({path:'output/playwright/aqua-phone-final.png',scale:'css'})
  return {url:page.url(),viewport:await page.evaluate(()=>({width:innerWidth,height:innerHeight,touch:navigator.maxTouchPoints})),sosVisible:await page.getByRole('button',{name:'紧急求助',exact:true}).isVisible()}
}
