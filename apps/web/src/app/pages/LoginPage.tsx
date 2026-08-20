import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '@supercampus/core';
import { PRIVACY_CONSENT_STORAGE_KEY, useAuth } from '@supercampus/supabase';
import { Button, Card, Input } from '@supercampus/shared';

const validEmail = (email: string): boolean => /^\S+@\S+\.\S+$/.test(email);

function AuthCard({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }): React.ReactElement {
  return <div className="sc-auth-page"><Card padding="lg" className="sc-auth-card"><h1 className="sc-auth-title">{title}</h1><p className="sc-auth-sub">{subtitle}</p>{children}</Card></div>;
}

export function LoginPage(): React.ReactElement {
  const navigate = useNavigate(); const { signIn } = useAuth(); const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [error,setError]=useState(''); const [loading,setLoading]=useState(false);
  async function submit(event: FormEvent): Promise<void> { event.preventDefault(); if(!validEmail(email)||!password){setError('Enter a valid email and password.');return;} setLoading(true);setError('');const result=await signIn({email,password});setLoading(false);if(result.error)setError(result.error);else navigate(ROUTES.home,{replace:true}); }
  return <AuthCard title="Welcome back" subtitle="Sign in to SUPERCAMPUS."><form onSubmit={submit}><Input label="Email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} error={error} autoComplete="email" required/><Input label="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} autoComplete="current-password" required/><Button fullWidth type="submit" disabled={loading}>{loading?'Signing in…':'Sign in'}</Button></form><p><Link to={ROUTES.resetPassword}>Forgot password?</Link></p><p>New here? <Link to={ROUTES.signup}>Create an account</Link></p></AuthCard>;
}

export function SignUpPage(): React.ReactElement {
  const navigate=useNavigate();const {signUp}=useAuth();const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [confirm,setConfirm]=useState('');const [privacyConsent,setPrivacyConsent]=useState(false);const [error,setError]=useState('');const [notice,setNotice]=useState('');const [loading,setLoading]=useState(false);
  async function submit(event: FormEvent): Promise<void>{event.preventDefault();if(!validEmail(email)){setError('Enter a valid email address.');return;}if(password.length<6){setError('Password must be at least 6 characters long.');return;}if(password!==confirm){setError('Passwords do not match.');return;}if(!privacyConsent){setError('Please read and agree to the Privacy Notice to continue.');return;}setLoading(true);setError('');const result=await signUp({email,password});if(result.error){setLoading(false);setError(result.error);return;}localStorage.setItem(PRIVACY_CONSENT_STORAGE_KEY,'1');if(result.data)navigate(ROUTES.home,{replace:true});else setNotice('Check your email to confirm your account, then sign in.');setLoading(false);}
  return <AuthCard title="Create your account" subtitle="Join SUPERCAMPUS."><form onSubmit={submit}><Input label="Email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} error={error} autoComplete="email" required/><Input label="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} autoComplete="new-password" required/><Input label="Confirm password" type="password" value={confirm} onChange={(e)=>setConfirm(e.target.value)} autoComplete="new-password" required/><label className="sc-consent-field"><input type="checkbox" checked={privacyConsent} onChange={(e)=>setPrivacyConsent(e.target.checked)} aria-describedby="privacy-consent-hint" required/><span id="privacy-consent-hint">I have read and agree to the <a href={ROUTES.privacy} target="_blank" rel="noreferrer">Privacy Notice</a></span></label><Button fullWidth type="submit" disabled={loading || !privacyConsent}>{loading?'Creating account…':'Create account'}</Button></form>{notice?<p role="status">{notice}</p>:null}<p>Already registered? <Link to={ROUTES.login}>Sign in</Link></p></AuthCard>;
}

export function ResetPasswordPage(): React.ReactElement {
  const {resetPassword}=useAuth();const [email,setEmail]=useState('');const [error,setError]=useState('');const [notice,setNotice]=useState('');const [loading,setLoading]=useState(false);
  async function submit(event: FormEvent): Promise<void>{event.preventDefault();if(!validEmail(email)){setError('Enter a valid email address.');return;}setLoading(true);setError('');const result=await resetPassword(email);setLoading(false);if(result.error)setError(result.error);else setNotice('If an account exists for this email, a reset link has been sent.');}
  return <AuthCard title="Reset your password" subtitle="We’ll email you a secure reset link."><form onSubmit={submit}><Input label="Email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} error={error} autoComplete="email" required/><Button fullWidth type="submit" disabled={loading}>{loading?'Sending…':'Send reset link'}</Button></form>{notice?<p role="status">{notice}</p>:null}<p><Link to={ROUTES.login}>Back to sign in</Link></p></AuthCard>;
}



