'use client';
import {useState} from 'react';
import {api} from '../ui';
import SchoolFields from '../school-fields';
import type {SchoolProfile} from '../registration';
export default function StudentSchoolProfile({student,onSaved}:{student:SchoolProfile&{id:string};onSaved:()=>Promise<void>}){
 const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('');
 async function save(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setError('');setMessage('');const fields=new FormData(e.currentTarget);try{await api('student-profile',{studentId:student.id,...Object.fromEntries(fields.entries())});await onSaved();setMessage('School details saved. Learning progress is unchanged.');}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 return <details className="school-profile"><summary>School & contact details · private</summary><p>Complete or correct this student’s details here. Email is optional. For students under 13, use a parent/guardian email.</p><form onSubmit={save}><SchoolFields profile={student}/>{error&&<p className="inline-error" role="alert">{error}</p>}{message&&<p className="save-message" role="status">{message}</p>}<button className="button dark small" disabled={busy}>{busy?'Saving…':'Save student details'}</button></form></details>;
}
