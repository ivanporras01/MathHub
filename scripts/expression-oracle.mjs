// Independent numeric parser used only by verification. No eval or application algebra helpers.
export function evaluateText(source,x=0,y=0){
 const text=source.replaceAll('−','-').replaceAll('²','^2').replaceAll('[','(').replaceAll(']',')').replaceAll('×','*').replaceAll('·','*').replace(/\s/g,'');
 const tokens=text.match(/\d+(?:\.\d+)?|[xy()+*/^\-]/g)||[];
 if(tokens.join('')!==text)throw new Error(`Unsupported expression: ${source}`);
 let i=0;
 function atom(){const t=tokens[i++];if(t==='('){const n=expression();if(tokens[i++]!==')')throw new Error('Missing closing parenthesis');return n;}if(t==='x')return x;if(t==='y')return y;if(t&&/^\d/.test(t))return Number(t);throw new Error(`Expected a term, got ${t}`);}
 function power(){let n=atom();if(tokens[i]==='^'){i++;n=n**unary();}return n;}
 function unary(){if(tokens[i]==='+'){i++;return unary();}if(tokens[i]==='-'){i++;return -unary();}return power();}
 function product(){let n=unary();while(i<tokens.length){const t=tokens[i];if(t==='*'||t==='/'){i++;const v=unary();n=t==='*'?n*v:n/v;}else if(t==='('||t==='x'||t==='y'||/^\d/.test(t)){n*=unary();}else break;}return n;}
 function expression(){let n=product();while(tokens[i]==='+'||tokens[i]==='-'){const op=tokens[i++],v=product();n=op==='+'?n+v:n-v;}return n;}
 const answer=expression();if(i!==tokens.length||!Number.isFinite(answer))throw new Error(`Invalid expression: ${source}`);return answer;
}
export function coefficientFromText(source,variable){
 const f=(x,y)=>evaluateText(source,x,y),constant=f(0,0);
 if(variable==='')return constant;
 if(variable==='x²')return(f(1,0)+f(-1,0)-2*constant)/2;
 if(variable==='x')return(f(1,0)-f(-1,0))/2;
 if(variable==='y')return(f(0,1)-f(0,-1))/2;
 if(variable==='xy')return f(1,1)-f(1,0)-f(0,1)+constant;
 throw new Error(`Unknown variable ${variable}`);
}
export function expressionOracle(question){const variable=question.prompt.match(/coefficient of (x²|xy|x|y)/)?.[1];if(!variable)throw new Error(question.prompt);return coefficientFromText(question.expression,variable);}
