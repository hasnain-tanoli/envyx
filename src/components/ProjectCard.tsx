'use client';
import { memo } from 'react';
import Link from 'next/link';
import { Folder, ArrowRight, Key, Edit2, Trash2, Shield, Lock } from 'lucide-react';

interface ProjectCardProps {
    id: string;
    name: string;
    description?: string | null;
    env_count: number | null;
    environment?: string | null;
    role?: 'owner' | 'admin' | 'member' | 'viewer';
    onEdit?: (id: string, name: string, description: string, environment: string) => void;
    onDelete?: (id: string) => void;
}

function ProjectCard({ id, name, description, env_count, environment, role, onEdit, onDelete }: ProjectCardProps) {
    const isViewer = role === 'viewer';
    const activeEnv = environment || 'development';

    return (
        <Link 
            href={`/projects/${id}`} 
            className="group ray-card p-6 transition-all flex flex-col gap-5 hover:-translate-y-1"
        >
            <div className="flex justify-between items-start">
                <div className="p-2.5 rounded-xl bg-[#1b1c1e] border border-white/5 text-[#FF6363] shadow-inner shadow-white/5 transition-colors group-hover:bg-[#FF6363] group-hover:text-white">
                    <Folder size={20} />
                </div>
                <div className="flex items-center gap-2">
                    {!isViewer && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onEdit?.(id, name, description || '', environment || 'development');
                                }}
                                className="p-1.5 text-[#6a6b6c] hover:text-[#f9f9f9] transition-colors"
                            >
                                <Edit2 size={14} />
                            </button>
                            <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onDelete?.(id);
                                }}
                                className="p-1.5 text-[#6a6b6c] hover:text-[#FF6363] transition-colors"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    )}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1b1c1e] border border-white/5 text-[10px] font-bold text-[#9c9c9d] uppercase tracking-wider">
                        <Lock size={10} className="text-[#6a6b6c]" />
                        Vaulted
                    </div>
                </div>
            </div>

            <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium tracking-tight text-[#f9f9f9] group-hover:text-white transition-colors">{name}</h3>
                    <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border border-white/5 ${
                        activeEnv === 'production' ? 'bg-[#FF6363]/10 text-[#FF6363]' : 'bg-[#1b1c1e] text-[#9c9c9d]'
                    }`}>
                        {activeEnv}
                    </span>
                </div>
                <p className="text-sm text-[#6a6b6c] line-clamp-2 leading-relaxed min-h-[40px]">
                    {description || 'No description provided for this security vault.'}
                </p>
            </div>
            
            <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-4 text-[11px] font-medium text-[#6a6b6c]">
                    <div className="flex items-center gap-1.5">
                        <Key size={12} />
                        <span>{env_count || 0} keys</span>
                    </div>
                    {role && (
                        <div className="flex items-center gap-1.5">
                            <Shield size={12} />
                            <span className="capitalize">{role}</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-[#9c9c9d] group-hover:text-[#f9f9f9] transition-all group-hover:translate-x-1 uppercase tracking-widest">
                    Open
                    <ArrowRight size={14} />
                </div>
            </div>
        </Link>
    );
}

export default memo(ProjectCard);