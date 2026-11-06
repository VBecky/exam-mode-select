import { expect,test } from 'vitest';
import { activateStudyAccount, clearDeletedStudyAccount } from './study-account';
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
test('deleting an account clears its study data but preserves other accounts',()=>{
  const values=new Map<string,string>([['studyAccountOwner','deleted'],['quizProgress','answers'],['quizProgress:deleted','old answers'],['quizProgress:other','keep'],['userName','Deleted user']]);
  Object.defineProperty(globalThis,'localStorage',{value:{getItem:(key:string)=>values.get(key)??null,removeItem:(key:string)=>values.delete(key)},configurable:true});
  clearDeletedStudyAccount('deleted');
  expect(values.has('quizProgress')).toBe(false);
  expect(values.has('quizProgress:deleted')).toBe(false);
  expect(values.has('studyAccountOwner')).toBe(false);
  expect(values.has('userName')).toBe(false);
  expect(values.get('quizProgress:other')).toBe('keep');
});