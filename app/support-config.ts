export type SupportSettings={enabled:boolean;paypalUrl:string;monthlyUrl:string};
export const initialPayPalUrl='https://www.paypal.com/ncp/payment/VDP5WQJ3E5W9G';
export const emptySupport:SupportSettings={enabled:false,paypalUrl:'',monthlyUrl:''};

// Only hosted PayPal payment pages are allowed, never a login or arbitrary redirect.
export function validatePayPalUrl(value:unknown,monthly=false):string {
  if(value===''||value===undefined||value===null)return '';
  if(typeof value!=='string'||value.length>1500)throw new Error('Paste a public PayPal payment link.');
  let url:URL;try{url=new URL(value.trim());}catch{throw new Error('Use a complete https:// PayPal link.');}
  if(url.protocol!=='https:'||url.username||url.password||url.port||url.hash)throw new Error('Use a secure public PayPal payment link.');
  const keys=[...url.searchParams.keys()];
  const only=(allowed:string[])=>keys.every(k=>allowed.includes(k))&&new Set(keys).size===keys.length;
  const host=url.hostname,path=url.pathname;
  const hostedId=/^[A-Za-z0-9]{8,64}$/.test(url.searchParams.get('hosted_button_id')||'');
  const paypal=['paypal.com','www.paypal.com'].includes(host);
  const donate=paypal&&(
    /^\/donate\/?$/.test(path)&&hostedId&&only(['hosted_button_id','currency_code','locale.x','country.x','source','recurring'])||
    /^\/donate\/hosted\/[A-Za-z0-9]{8,64}\/?$/.test(path)&&only(['locale.x','country.x','source'])||
    path==='/cgi-bin/webscr'&&hostedId&&url.searchParams.get('cmd')==='_s-xclick'&&only(['cmd','hosted_button_id','source'])
  );
  const subscription=paypal&&/^\/webapps\/billing\/plans\/subscribe\/?$/.test(path)&&/^P-[A-Z0-9]+$/.test(url.searchParams.get('plan_id')||'')&&only(['plan_id']);
  const oneTime=(['paypal.me','www.paypal.me'].includes(host)&&/^\/[A-Za-z0-9._-]{2,80}(?:\/\d+(?:\.\d{1,2})?)?\/?$/.test(path)&&only(['locale.x','country.x']))||
    (paypal&&/^\/ncp\/payment\/[A-Za-z0-9]{6,64}\/?$/.test(path)&&only(['locale.x','country.x']));
  if(!(donate||(monthly?subscription:oneTime)))throw new Error(monthly?'Use a PayPal Donate link with monthly giving enabled, or a PayPal subscription link. PayPal.Me is for one-time support.':'Use a PayPal Donate, PayPal.Me, or hosted payment link.');
  return url.href;
}
