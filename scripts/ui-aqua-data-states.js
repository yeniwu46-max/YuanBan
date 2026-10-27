// Browser-only fixtures; never sends requests to a real API.
async(page)=>{
  const checks=[],errors=[];page.on('pageerror',e=>errors.push(e.message))
  let scenario='failure'
  await page.goto('about:blank');await page.unrouteAll({behavior:'ignoreErrors'})
  await page.route('**/api/v1/**',async route=>{
    const path=new URL(route.request().url()).pathname
    let body=[],status=200
    if(path==='/api/v1/auth/me')body={id:'fixture-user',phone:'13800000001',name:'测试',role:'elder',elder_id:'elder-001',bound_elders:[]}
    else if(path==='/api/v1/elders/elder-001')body={id:'elder-001',name:'测试长辈',age:76,location_label:'测试住所',address:'测试住所',community_site_id:null}
    else if(path.endsWith('/metrics/latest')){
      if(scenario==='failure'){status=503;body={detail:'unavailable'}}
      else if(scenario==='invalid')body=[{key:'heartRate',label:'心率',value:'bad',unit:'次/分',status:'normal',description:''}]
    }else if(path.endsWith('/service-summary'))body={abnormal_metric_count:0,online_device_count:0,total_device_count:0,recent_activity_label:'',companion_mood:'',companion_score:0}
    else if(path.endsWith('/companion-state'))body={mood:'',companion_score:0,speak_hint:''}
    await route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)})
  })
  const check=(ok,label)=>{if(!ok)throw Error(label);checks.push(label)}
  const fresh=async(path)=>{await page.goto('http://127.0.0.1:5183/?fixture='+scenario+'#/'+path);await page.reload()}
  await page.setViewportSize({width:390,height:844})
  await fresh('pages/home/index')
  await page.getByText('数据待更新',{exact:true}).waitFor()
  check(await page.getByRole('button',{name:'查看数据说明'}).innerText()==='更新失败','Failed latest data uses update-failed badge')
  check(await page.getByText('指标平稳',{exact:true}).count()===0,'Failure never reports stable health')
  await page.getByRole('button',{name:'查看数据说明'}).click()
  await page.getByText(/部分数据更新失败，页面可能保留旧内容或初始示例/).waitFor()
  await page.keyboard.press('Escape')
  scenario='empty';await fresh('pages/health/index')
  await page.getByText('暂无健康数据',{exact:true}).first().waitFor()
  check(await page.locator('.list .item').count()===0,'Empty API health has no seeded mock metrics')
  scenario='invalid';await fresh('pages/home/index')
  await page.getByText('未获取',{exact:true}).waitFor()
  check(await page.locator('.metric-number').innerText()==='—','Invalid latest measurement is unavailable, not a normal number')
  scenario='service';await fresh('pages/service/index')
  await page.getByText('暂无安排',{exact:true}).waitFor()
  check(await page.getByText('暂无设备数据',{exact:true}).isVisible(),'Empty service device data not labelled online')
  check(await page.getByText('全部在线',{exact:true}).count()===0,'No fabricated normal device state')
  check(errors.length===0,'No uncaught runtime errors')
  await page.unrouteAll({behavior:'wait'})
  return {passed:checks.length,checks,errors}
}
