// API-mode H5 on 5183; intercepts requests in the test browser only. No real backend writes.
async (page) => {
 await page.goto('about:blank');await page.unrouteAll({behavior:'ignoreErrors'})
 const results=[],errors=[];page.on('pageerror',e=>errors.push(e.message))
 const check=(ok,label)=>{if(!ok)throw Error(label);results.push(label)}
 const profile={id:'elder-001',name:'接口测试长辈',age:76,location_label:'测试住所',address:'测试地址',community_site_id:null}
 const metrics=[['bloodPressure','血压','128/82','mmHg'],['heartRate','心率','78','次/分'],['breathRate','呼吸','17','次/分'],['sleep','睡眠','7.2','小时']].map(([key,label,value,unit])=>({key,label,value,unit,status:'normal',description:'接口测试摘要'}))
 let releaseHistory;const hold=new Promise(resolve=>releaseHistory=resolve);let heartFailure=true;let historyCalls=0
 await page.route('**/api/v1/**',async route=>{
  const path=new URL(route.request().url()).pathname
  let body=[];let status=200
  if(path==='/api/v1/auth/me')body={id:'fixture-user',phone:'13800000001',name:'测试用户',role:'elder',elder_id:'elder-001',bound_elders:[]}
  else if(path.endsWith('/metrics/latest'))body=metrics
  else if(path.endsWith('/companion-state'))body={mood:'平稳',companion_score:70,speak_hint:'测试数据'}
  else if(path==='/api/v1/elders/elder-001')body=profile
  else if(path.endsWith('/bloodPressure/history')){
   historyCalls++;await hold
   body=[{recorded_at:new Date(Date.now()-3600000).toISOString(),value:'128/82',status:'normal'},{recorded_at:new Date().toISOString(),value:'bad',status:'normal'}]
  }
  else if(path.endsWith('/heartRate/history')){if(heartFailure){status=503;body={detail:'fixture unavailable'}}else body=[{recorded_at:new Date().toISOString(),value:'78',status:'normal'}]}
  else if(path.endsWith('/breathRate/history')){status=401;body={detail:'fixture expired'}}
  await route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)})
 })
 await page.setViewportSize({width:390,height:844})
 await page.goto('http://127.0.0.1:5183/#/pages/home/index')
 await page.getByText(/接口测试长辈/).waitFor()
 const metricButton=label=>page.getByRole('button',{name:new RegExp('^'+label+' ')}).first()
 const home=async()=>{await page.getByRole('button',{name:'返回上一页',exact:true}).click();await page.getByRole('button',{name:'紧急求助',exact:true}).waitFor()}
 await metricButton('血压').click()
 await page.getByText('正在读取历史记录…',{exact:true}).waitFor();check(true,'API loading placeholder')
 releaseHistory()
 await page.getByRole('img',{name:/血压趋势/}).waitFor()
 await page.getByText('1 条无效记录未绘制。',{exact:true}).waitFor();check(true,'invalid measurements excluded')
 await page.getByText('数据来源 · 已授权健康记录',{exact:true}).waitFor();check(true,'API provenance shown')
 await home();await metricButton('血压').click();await page.getByRole('img',{name:/血压趋势/}).waitFor()
 check(historyCalls===1,'same elder/metric/range uses cached history')
 await home();await metricButton('睡眠').click()
 await page.getByText('该长辈在此时间范围内暂无有效睡眠记录。',{exact:true}).waitFor();check(true,'empty history has no decorative curve')
 await home();await metricButton('心率').click()
 await page.getByText(/历史记录加载失败/).waitFor();check(true,'failed API has explicit error instead of mock curve')
 await page.screenshot({path:'output/playwright/forest-api-error.png'})
 heartFailure=false;await page.getByRole('button',{name:'重新加载',exact:true}).click();await page.getByRole('img',{name:/心率趋势/}).waitFor();check(true,'retry replaces error with valid data')
 await home();await metricButton('呼吸').click()
 await page.getByRole('button',{name:'开始使用 ›',exact:true}).waitFor();check(true,'401 returns to login welcome (root route alias)')
 check(errors.length===0,'no uncaught runtime errors: '+errors.join(';'))
 await page.unrouteAll({behavior:'wait'})
 return {passed:results.length,results}
}
