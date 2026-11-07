import {chromium} from 'playwright';import assert from 'node:assert/strict';
const base=process.env.BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:1320,height:900}});
 const failures=[];page.on('pageerror',e=>failures.push(e.message));
 await page.goto(base+'/?desk=1',{waitUntil:'domcontentloaded'});
 await page.locator('#desk').waitFor({state:'visible'});
 assert.equal(await page.locator('#case-list [data-case]').count(),4,'four cases appear');
 for(const id of ['CW-101','CW-204','CW-307','CW-412']){
  await page.locator('#case-list [data-case="'+id+'"]').click();
  await page.locator('#case-title').waitFor({state:'visible'});
  assert.equal(await page.locator('#rail-id').innerText(),id);
  await page.locator('[data-action="diagnose"]').first().click();
  await page.waitForTimeout(500);
  const txt=await page.locator('#tab-panel').innerText();
  assert.match(txt,/SESSION_EXPIRED|GRAPHQL_VALIDATION_ERROR|STALE_SNAPSHOT|UNVERIFIED_REFERENCE/,'diagnostic evidence appears');
 }
 await page.reload();await page.locator('#desk').waitFor({state:'visible'});
 assert.equal(await page.locator('#case-list [data-case]').count(),4);
 assert.deepEqual(failures,[],'no uncaught JS errors');
 console.log('CASEWORK browser smoke PASS: four cases, endpoint diagnostics, reload, no page errors');
}finally{await browser.close()}
