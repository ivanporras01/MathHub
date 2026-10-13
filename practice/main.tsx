import { useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { createRoot } from 'react-dom/client';
import MathPortal from '../app/portal';
import TeacherDashboard from '../app/teacher/teacher-dashboard';
import '../app/globals.css';
import './mathhub.css';
import '../app/mathhub.css';

const teacher = /^\/teacher\/?$/.test(window.location.pathname);
document.title = teacher ? 'MathHub · Teacher Dashboard' : 'MathHub · by Mr. Porras';
let initialTheme = 'light';
try { initialTheme = localStorage.getItem('mathhub-theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); } catch {}
initialTheme = initialTheme === 'dark' ? 'dark' : 'light';
document.documentElement.dataset.theme = initialTheme;
function App() {
  const [theme, setTheme] = useState(initialTheme);
  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('mathhub-theme', next); } catch {}
    setTheme(next);
  }
  return <><button className="theme-toggle" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>{theme === 'dark' ? <Sun size={18}/> : <Moon size={18}/>}<span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span></button>{teacher ? <TeacherDashboard /> : <MathPortal />}</>;
}
createRoot(document.getElementById('root')!).render(<App />);
