import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { apiOrigin } from './api';
import {emptyReport,type ReportDraft} from './reports';
export type DemoSession = {token:string;expiresAt:number;mode:'demo';phoneVerified:false};
export type Challenge = {mode:'demo';challengeId:string;demoCode:string;expiresAt:number;resendAt:number;serverNow:number};
export async function authRequest(path:string, body:object, token?:string, signal?:AbortSignal) {
  let response;
  try { response=await fetch(apiOrigin()+path,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${Constants.expoConfig?.extra?.developmentToken || ''}`,...(token?{'X-Session-Token':token}:{})},body:JSON.stringify(body),signal:signal||AbortSignal.timeout(10000)}); }
  catch { throw new Error('NETWORK'); }
  const data=await response.json();if(!response.ok)throw new Error(data.error||'NETWORK');return data;
}
type AuthState={ready:boolean;welcomed:boolean;welcome:()=>void;session:DemoSession|null;setSession:(s:DemoSession|null)=>void;draft:string;setDraft:(s:string)=>void;reportDraft:ReportDraft;setReportDraft:(draft:ReportDraft)=>void};
const AuthContext=createContext<AuthState|null>(null);
export function AuthProvider({children}:{children:React.ReactNode}) {
  const [ready,setReady]=useState(false),[welcomed,setWelcomed]=useState(false),[session,setSession]=useState<DemoSession|null>(null),[draft,setDraft]=useState('');
  const [reportDraft,setReportDraft]=useState<ReportDraft>(emptyReport);
  useEffect(()=>{let active=true;AsyncStorage.getItem('t2akkad-welcome').then(value=>{if(active)setWelcomed(value==='1');}).catch(()=>{}).finally(()=>{if(active)setReady(true);});return()=>{active=false;};},[]);
  useEffect(()=>{if(!session)return;const timer=setTimeout(()=>setSession(null),Math.max(0,session.expiresAt-Date.now()));return()=>clearTimeout(timer);},[session]);
  const welcome=()=>{setWelcomed(true);AsyncStorage.setItem('t2akkad-welcome','1').catch(()=>{});};
  return <AuthContext.Provider value={{ready,welcomed,welcome,session,setSession,draft,setDraft,reportDraft,setReportDraft}}>{children}</AuthContext.Provider>;
}
export function useAuth(){const state=useContext(AuthContext);if(!state)throw new Error('Missing AuthProvider');return state;}
export { authCopy } from './authCopy';
