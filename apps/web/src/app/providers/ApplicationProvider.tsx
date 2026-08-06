import { createContext, useContext, useMemo, type ReactElement, type ReactNode } from 'react';
import { useAuthorization, useAuth, useProfile } from '@supercampus/supabase';
export interface ApplicationContextValue { loading:boolean; ready:boolean; error:string|null; retryInitialization:()=>Promise<void> }
const Context=createContext<ApplicationContextValue|null>(null);
export function ApplicationProvider({children}:{children:ReactNode}):ReactElement{const a=useAuth(),p=useProfile(),z=useAuthorization();const value=useMemo(()=>({loading:a.loading||p.loading||z.loading,ready:!a.loading&&(!a.authenticated||(p.exists&&!p.loading&&z.ready)),error:p.error??z.error,retryInitialization:async()=>{await p.refreshProfile();await z.refreshAuthorization();}}),[a.loading,a.authenticated,p.loading,p.exists,p.error,p.refreshProfile,z.loading,z.ready,z.error,z.refreshAuthorization]);return <Context.Provider value={value}>{children}</Context.Provider>}
export function useApplication():ApplicationContextValue{const v=useContext(Context);if(!v)throw Error('useApplication must be used inside ApplicationProvider');return v}
