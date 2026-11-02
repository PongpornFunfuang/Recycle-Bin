import test from 'node:test';
import assert from 'node:assert/strict';
import {NextRequest} from 'next/server';
import {localOrigin,sameOrigin} from '../src/lib/http';

test('Vercel exact deployment and branch origins pass; untrusted origins and hosts fail',()=>{
 const keys=['VERCEL','VERCEL_URL','VERCEL_BRANCH_URL'] as const;
 const prior=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
 try{
  process.env.VERCEL='1';process.env.VERCEL_URL='app-deployment.vercel.app';process.env.VERCEL_BRANCH_URL='app-branch.vercel.app';
  const check=(headers:Record<string,string>)=>sameOrigin(new NextRequest('https://internal.invalid/api/auth',{headers}));
  for(const host of ['app-deployment.vercel.app','app-branch.vercel.app']){
   assert.equal(check({host,origin:`https://${host}`}),true);
   assert.equal(localOrigin(new NextRequest('http://internal.invalid',{headers:{host}})),`https://${host}`);
  }
  for(const headers of [
   {host:'app-deployment.vercel.app',origin:'https://evil.example'},
   {host:'app-deployment.vercel.app',origin:'http://app-deployment.vercel.app'},
   {host:'app-deployment.vercel.app',origin:'null'},
   {host:'app-deployment.vercel.app'},
   {host:'other.vercel.app',origin:'https://other.vercel.app'},
   {host:'evil.example',origin:'https://evil.example','x-forwarded-host':'app-deployment.vercel.app'},
   {host:'app-deployment.vercel.app',origin:'https://evil.example','x-forwarded-host':'evil.example'},
   {host:'127.0.0.1:3000',origin:'http://127.0.0.1:3000'},
  ])assert.equal(check(headers as Record<string,string>),false);
  delete process.env.VERCEL_URL;delete process.env.VERCEL_BRANCH_URL;
  assert.equal(check({host:'app-deployment.vercel.app',origin:'https://app-deployment.vercel.app'}),false);
 }finally{for(const k of keys){if(prior[k]===undefined)delete process.env[k];else process.env[k]=prior[k];}}
});
