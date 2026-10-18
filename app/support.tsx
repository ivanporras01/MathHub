'use client';
import {ArrowUpRight,HeartHandshake,BookOpen} from 'lucide-react';
import {initialPayPalUrl,type SupportSettings} from './support-config';
export default function Support({settings,onBack}:{settings:SupportSettings;onBack:()=>void}){
 const fixedAmount=settings.paypalUrl===initialPayPalUrl;
 return <section className="support-page">
  <span className="support-icon"><HeartHandshake size={32}/></span>
  <span className="eyebrow">FOR FAMILIES, EDUCATORS & FRIENDS</span>
  <h1>Help more “I get it!” moments happen.</h1>
  <p className="support-intro">Support MathHub by Mr. Porras and the learning resources students use to build confidence in math.</p>
  <div className="support-access"><BookOpen size={21}/><p>Giving is completely optional. Every student can keep learning and practicing, with or without a contribution.</p></div>
  {settings.enabled&&(settings.paypalUrl||settings.monthlyUrl)?<div className="support-options">
   {settings.paypalUrl&&<article><span className="eyebrow">ONE-TIME SUPPORT</span><h2>{fixedAmount?'A $25 boost for MathHub':'Make a contribution'}</h2><p>{fixedAmount?'One contribution is $25 USD. PayPal shows the final total before you pay.':'Review the contribution amount on PayPal before you pay.'}</p><a className="button dark" href={settings.paypalUrl} target="_blank" rel="noopener noreferrer">{fixedAmount?'Contribute $25 with PayPal':'Contribute with PayPal'}<ArrowUpRight size={17}/></a><small>Opens PayPal in a new tab. This is a one-time payment.</small></article>}
   {settings.monthlyUrl&&<article><span className="eyebrow">MONTHLY SUPPORT</span><h2>Keep the learning going</h2><p>Choose monthly giving on PayPal and review the amount, frequency, and cancellation terms before confirming.</p><a className="button dark" href={settings.monthlyUrl} target="_blank" rel="noopener noreferrer">Explore monthly support<ArrowUpRight size={17}/></a><small>Monthly giving creates a recurring payment only after you confirm it on PayPal.</small></article>}
  </div>:<div className="info-box"><h2>Thank you for wanting to help.</h2><p>Online contributions are not currently open. You can still support a learner by sharing MathHub.</p></div>}
  <p className="supporting-note">PayPal handles the payment. MathHub does not collect your card or bank details, and contributions are not connected to student profiles or progress.</p>
  <button className="button light" onClick={onBack}>Back to learning</button>
 </section>;
}
