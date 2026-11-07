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
 // End-to-end controlled remediation: failed GraphQL response -> fix -> retest -> verify.
 await page.locator('#case-list [data-case="CW-204"]').click();
 await page.locator('[data-action="fix"]').click();
 await page.locator('[data-action="diagnose"]').click();
 await page.locator('#tab-panel').getByText('PASS',{exact:true}).waitFor();
 await page.locator('[data-action="verify"]').click();
 await page.locator('[data-tab="respond"]').click();
 await page.locator('[data-action="approve"]').click();
 await page.locator('[data-tab="investigate"]').click();
 await page.locator('#note').fill('GraphQL HTTP 200 contained application error because the required draftId variable was absent; corrected it and reran the mutation successfully.');
 await page.locator('[data-action="note"]').click();
 await page.locator('[data-tab="history"]').click();
 await page.getByText('Closure gate: READY').waitFor();
 await page.locator('[data-action="close"]').click();
 await page.locator('#case-status').getByText('Resolved').waitFor();
 // Legal case must not be closed via the ordinary support workflow.
 await page.locator('#case-list [data-case="CW-412"]').click();
 await page.locator('[data-tab="history"]').click();
 await page.locator('[data-action="close"]').click();
 assert.notEqual(await page.locator('#case-status').innerText(),'Resolved');
 // Reopening invalidates historical verification, even if the previous result was PASS.
 await page.locator('#case-list [data-case="CW-204"]').click();
 await page.locator('[data-tab="history"]').click();
 await page.locator('[data-action="reopen"]').click();
 await page.locator('[data-tab="investigate"]').click();
 await page.locator('[data-action="verify"]').click();
 await page.locator('[data-tab="history"]').click();
 await page.getByText('Closure gate: NOT READY').waitFor();
 // Mock only the browser transport here. A separate workflow tests real Google inference.
 await page.locator('#case-list [data-case="CW-101"]').click();
 await page.route('**/api/ai',async route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({model:'gemini-3.5-flash-lite',advisory:true,critique:'State what is verified.',suggested_reply:'The fictional session expired. I will refresh and retest access before confirming the result.',caveat:'No real customer identity or production session was examined.'})}));
 await page.locator('[data-tab="respond"]').click();
 await page.locator('[data-action="ai"]').click();
 await page.getByText('Recommended improvement').waitFor();
 await page.locator('[data-action="adopt-ai"]').click();
 await page.getByText('Use as editable draft').waitFor();
 assert.match(await page.locator('#reply').inputValue(),/fictional session expired/);
 // Small-screen smoke check: cases and diagnostics remain usable.
 const mobile=await browser.newPage({viewport:{width:390,height:844}});
 const mobileErrors=[];mobile.on('pageerror',e=>mobileErrors.push(e.message));
 await mobile.goto(base+'/?desk=1',{waitUntil:'domcontentloaded'});
 await mobile.locator('#desk').waitFor({state:'visible'});
 await mobile.locator('#case-list [data-case="CW-307"]').click();
 await mobile.locator('[data-action="diagnose"]').click();
 await mobile.getByText('STALE_SNAPSHOT').first().waitFor();
 assert.deepEqual(mobileErrors,[]);
 await mobile.close();
 await page.reload();await page.locator('#desk').waitFor({state:'visible'});
 assert.equal(await page.locator('#case-list [data-case]').count(),4);
 assert.deepEqual(failures,[],'no uncaught JS errors');
 console.log('CASEWORK browser smoke PASS: four cases, endpoint diagnostics, reload, no page errors');
}finally{await browser.close()}
