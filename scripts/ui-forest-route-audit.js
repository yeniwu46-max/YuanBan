// Small-screen page audit; all operations remain in the local Mock build.
async (page) => {
 const results=[],errors=[];page.on('pageerror',e=>errors.push(e.message))
 const nav=p=>page.goto('http://127.0.0.1:5182/#/'+p)
 async function role(name){await nav('pages/login-role/index');await page.getByRole('button',{name:new RegExp(name)}).click()}
 const groups=[['我是老人',['pages/login-welcome/index','pages/login-role/index','pages/login-phone/index','pages/login-profile/index','pages/login-device/index','pages/login-guide/index','pages/home/index','pages/health/index','pages/companion/index','pages/service/index',...['health-metric','bp','medicine','sos','health-report','device','device-detail','contact-detail','privacy','yuanqi','activity','family'].map(x=>'pkg-elder-detail/'+x+'/index')]],['我是家人',['pages/family/guardian/index','pages/family/report/index','pages/family/care/index','pages/family/settings/index','pkg-family-detail/family/alert/index']],['我是社区人员',['pages/community/dashboard/index','pages/community/workorders/index','pages/community/activity/index','pages/community/profile/index','pkg-community-detail/community/alert/index']]]
 await page.goto('http://127.0.0.1:5182');await page.reload();await page.setViewportSize({width:320,height:844})
 for(const [name,paths] of groups){
  await role(name)
  for(const path of paths){
   await nav(path);await page.locator('.app-page').waitFor()
   const info=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,emptyButtons:[...document.querySelectorAll('[role=button],button')].filter(x=>x.getClientRects().length&&!x.textContent.trim()&&!x.getAttribute('aria-label')).map(x=>x.outerHTML.slice(0,180))}))
   results.push({path,...info})
  }
 }
 return {pages:results.length,overflow:results.filter(r=>r.scroll>r.width+1),unlabelled:results.filter(r=>r.emptyButtons.length),errors}
}
