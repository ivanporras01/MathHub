'use client';
import {SCHOOL_GRADES,type SchoolProfile} from './registration';
export default function SchoolFields({profile,required=false}:{profile?:Partial<SchoolProfile>;required?:boolean}){
 return <div className="school-fields">
  <label>School grade{!required&&' (optional)'}<select name="schoolGrade" required={required} defaultValue={profile?.schoolGrade||''}><option value="">Choose a grade</option>{SCHOOL_GRADES.map(g=><option key={g.value} value={g.value}>{g.label}</option>)}</select></label>
  <label>School name{!required&&' (optional)'}<input name="schoolName" required={required} maxLength={120} defaultValue={profile?.schoolName||''} placeholder="School name or Homeschool" autoComplete="off"/></label>
  <label>Email address (optional)<input type="email" name="email" maxLength={254} defaultValue={profile?.email||''} placeholder="name@example.com" autoComplete="off"/></label>
  <label>This email belongs to<select name="emailType" defaultValue={profile?.emailType||'guardian'}><option value="guardian">Parent / guardian</option><option value="student">Student (age 13 or older)</option></select></label>
 </div>;
}
