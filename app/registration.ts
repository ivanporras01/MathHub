// A school grade is independent of MathHub's course identifier (Student.grade).
export const SCHOOL_GRADES = [
  {value:'K',label:'Kindergarten'},
  ...Array.from({length:12},(_,i)=>({value:String(i+1),label:`Grade ${i+1}`})),
  {value:'college',label:'College / university'},
  {value:'adult',label:'Adult learner'},
  {value:'other',label:'Other'},
];
export type SchoolProfile = {schoolGrade:string;schoolName:string;email:string;emailType:string};
export function schoolGradeLabel(value?:string){return SCHOOL_GRADES.find(g=>g.value===value)?.label||'Not provided';}
export function readSchoolProfile(body:Record<string,unknown>,required=false):SchoolProfile {
  const clean=(v:unknown)=>typeof v==='string'?v.normalize('NFKC').trim().replace(/\s+/g,' '):'';
  const schoolGrade=clean(body.schoolGrade),schoolName=clean(body.schoolName),email=typeof body.email==='string'?body.email.trim():'';
  if((required&&!schoolGrade)||(schoolGrade&&!SCHOOL_GRADES.some(g=>g.value===schoolGrade)))throw new Error('Choose the student’s current school grade.');
  if((required&&!schoolName)||schoolName.length>120||/[\u0000-\u001f\u007f]/.test(schoolName))throw new Error('Enter a school name, up to 120 characters. You can enter Homeschool.');
  if(email&&(email.length>254||!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)))throw new Error('Enter a valid email address, or leave this optional field blank.');
  const emailType=email?clean(body.emailType):'';
  if(email&&!['student','guardian'].includes(emailType))throw new Error('Choose whether the email belongs to the student or a parent/guardian.');
  return {schoolGrade,schoolName,email,emailType};
}
