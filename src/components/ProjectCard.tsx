'use client';
import Link from 'next/link';
import { Folder, ArrowRight, Key, Edit2, Trash2 } from 'lucide-react';

interface ProjectCardProps {
    id: string;
    name: string;
    description?: string | null;
    env_count: number | null;
    onEdit?: (id: string, name: string, description: string) => void;
    onDelete?: (id: string) => void;
}

export default function ProjectCard({ id, name, description, env_count, onEdit, onDelete }: ProjectCardProps) {
    return (
        <Link 
            href={`/projects/${id}`} 
            className="group glass p-6 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex flex-col gap-4 animate-in"
        >
            <div className="flex justify-between items-start">
                <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                    <Folder size={24} />
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onEdit?.(id, name, description || '');
                        }}
                        className="p-2 text-gray-500 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-xl transition-all"
                        title="Edit Project"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button 
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onDelete?.(id);
                        }}
                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                        title="Delete Project"
                    >
                        <Trash2 size={16} />
                    </button>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-gray-400 ml-2">
                        <Key size={12} />
                        {env_count || 0} Variables
                    </div>
                </div>
            </div>
            
            <div>
                <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{name}</h3>
                <p className="text-gray-400 text-sm mt-1 line-clamp-2">{description || 'No description provided.'}</p>
            </div>
            
            <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Storage</span>
                <div className="flex items-center gap-1 text-xs font-semibold text-indigo-400 group-hover:translate-x-1 transition-transform">
                    View Details
                    <ArrowRight size={14} />
                </div>
            </div>
        </Link>
    );
}