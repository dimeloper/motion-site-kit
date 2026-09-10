import puppeteer from 'puppeteer-core';
import {startLocalServer} from './local-server.mjs';
import {resolve} from 'node:path';
import {mkdir} from 'node:fs/promises';
const {server,url}=await startLocalServer(resolve('docs'));
const out=resolve(process.env.DESIGN_OUT||'out/design-before'); await mkdir(out,{recursive:true});
const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--enable-unsafe-swiftshader','--enable-unsafe-webgpu']});
try {for(const [name,path] of [['docs','/'],['harbor','/examples/local/index.html'],['vortex','/examples/saas/index.html'],['halo','/examples/commerce/index.html'],['kit','/kit/index.html']]){
 if(process.env.DESIGN_FILTER && !process.env.DESIGN_FILTER.split(',').includes(name)) continue;
 const page=await browser.newPage();await page.setViewport({width:1440,height:1000,deviceScaleFactor:1});
 await page.goto(url+path,{waitUntil:'networkidle0'}); await page.evaluate(()=>document.fonts.ready); await new Promise(r=>setTimeout(r,1200));
 await page.screenshot({path:resolve(out,name+'-hero.png')});
 await page.evaluate(()=>{const h=document.querySelector('[data-hero]'); window.scrollTo({top:h? h.getBoundingClientRect().bottom+scrollY+innerHeight*3.5:800,behavior:'instant'})});
 await new Promise(r=>setTimeout(r,900));await page.screenshot({path:resolve(out,name+'-body.png')});
 await page.setViewport({width:390,height:844,deviceScaleFactor:1});await page.goto(url+path,{waitUntil:'networkidle0'});await page.screenshot({path:resolve(out,name+'-mobile.png')});
 console.log(name,await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,headings:[...document.querySelectorAll('h1,h2')].map(x=>x.textContent)})));
 await page.close();
}}finally{await browser.close();server.close();}
