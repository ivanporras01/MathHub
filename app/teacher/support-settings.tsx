'use client';
import {useEffect,useState} from 'react';
import {api} from '../ui';
import {emptySupport,type SupportSettings} from '../support-config';
export default function SupportSettingsPanel(){
 const [settings,setSettings]=useState<SupportSettings>({...emptySupport}),[loading,setLoading]=useState(true),[loaded,setLoaded]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
 async function load(){setLoading(true);setError('');try{setSettings(await api('teacher-support'));setLoaded(true);}catch(e){setError((e as Error).message);}finally{setLoading(false);}}
 useEffect(()=>{void load();},[]);
 async function save(e:React.FormEvent){e.preventDefault();setBusy(true);setError('');setMessage('');try{await api('support-settings',settings);setMessage(settings.enabled?'Support MathHub is now visible to visitors.':'Contributions are hidden from visitors. Your links are saved.');}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 return <details className="support-settings"><summary>Support MathHub · PayPal settings</summary><p>Manage the public payment links shown to families and supporters. Payments are completed on PayPal.</p>
 {loading?<p role="status">Loading settings…</p>:loaded?<form onSubmit={save}>
  <label>One-time PayPal payment link<input type="url" value={settings.paypalUrl} maxLength={1500} onChange={e=>{setSettings({...settings,paypalUrl:e.target.value});setMessage('');}} placeholder="https://www.paypal.com/ncp/payment/…"/></label>
  <label>Monthly PayPal link (optional)<input type="url" value={settings.monthlyUrl} maxLength={1500} onChange={e=>{setSettings({...settings,monthlyUrl:e.target.value});setMessage('');}} placeholder="PayPal Donate or subscription link"/></label>
  <p className="supporting-note">A hosted payment link or PayPal.Me link does not set up monthly giving. Add a Donate link with monthly giving enabled or a subscription link after configuring it in PayPal. Only add public payment links; no passwords or API keys.</p>
  <label className="support-toggle"><input type="checkbox" checked={settings.enabled} onChange={e=>{setSettings({...settings,enabled:e.target.checked});setMessage('');}}/>Show Support MathHub to visitors</label>
  <div className="settings-actions"><button className="button dark small" disabled={busy}>{busy?'Saving…':'Save PayPal settings'}</button><a className="button light small" href="/?view=support" target="_blank" rel="noopener noreferrer">View support page</a></div>
 </form>:null}
 {error&&<div className="inline-error" role="alert">{error}<button className="button light small" onClick={load}>Reload settings</button></div>}{message&&<p className="save-message" role="status">{message}</p>}
 </details>;
}
