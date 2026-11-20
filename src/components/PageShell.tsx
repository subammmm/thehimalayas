import type { ReactNode } from 'react';
import { Mountain } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';

const NAV = [['Map', '/map'], ['Browse', '/browse'], ['Atlas', '/atlas'], ['Data', '/data'], ['About', '/about']];

// Header and layout shared by the text pages.
export const PageShell = ({ title, children }: { title: string; children: ReactNode }) => {
    usePageTitle(title);
    return (
        <div className="min-h-screen bg-[#050505] text-white">
            <header className="max-w-5xl mx-auto px-6 py-6 flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
                <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
                    <Mountain className="w-6 h-6" aria-hidden="true" />
                    The Himalayas
                </Link>
                <nav aria-label="Main" className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium uppercase tracking-wide">
                    {NAV.map(([label, to]) => (
                        <NavLink key={to} to={to} className={({ isActive }) => isActive ? 'text-amber-400' : 'text-white/70 hover:text-white'}>
                            {label}
                        </NavLink>
                    ))}
                </nav>
            </header>
            <main className="max-w-5xl mx-auto px-6 pt-6 pb-20">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">{title}</h1>
                {children}
            </main>
        </div>
    );
};
