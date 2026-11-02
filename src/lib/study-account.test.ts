import { expect,test } from 'vitest';
import { activateStudyAccount } from './study-account';
test('different accounts cannot resume another account’s answers',()=>{
  const values=new Map<string,string>();
  const storage={getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>{values.set(key,value);},removeItem:(key:string)=>{values.delete(key);}};
  Object.defineProperty(globalThis,'localStorage',{value:storage,configurable:true});
  activateStudyAccount('first-account');
  storage.setItem('quizProgress','{"answers":{"0":2}}');
  activateStudyAccount('second-account');
  expect(storage.getItem('quizProgress')).toBe(null);
  storage.setItem('quizProgress','{"answers":{"0":1}}');
  activateStudyAccount('first-account');
  expect(storage.getItem('quizProgress')).toBe('{"answers":{"0":2}}');
});