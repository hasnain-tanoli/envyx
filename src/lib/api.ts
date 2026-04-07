import { Project, Environment } from '@/types';

async function handleResponse(res: Response) {
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || `HTTP error! status: ${res.status}`);
    }
    return data;
}

export async function getProjects(): Promise<Project[]> {
    const res = await fetch('/api/projects', { credentials: 'include' });
    return handleResponse(res);
}

export async function getProject(id: string): Promise<Project> {
    const res = await fetch(`/api/projects/${id}`, { credentials: 'include' });
    return handleResponse(res);
}

export async function getEnvs(projectId: string): Promise<Environment[]> {
    const res = await fetch(`/api/projects/${projectId}/env`, { credentials: 'include' });
    return handleResponse(res);
}

export async function addEnv(projectId: string, key: string, value: string) {
    const res = await fetch(`/api/projects/${projectId}/env`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ key, value }),
        headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(res);
}

export async function updateEnv(projectId: string, envId: string, key: string, value: string) {
    const res = await fetch(`/api/projects/${projectId}/env/${envId}`, {
        method: 'PUT',
        credentials: 'include',
        body: JSON.stringify({ key, value }),
        headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(res);
}

export async function deleteEnv(projectId: string, envId: string) {
    const res = await fetch(`/api/projects/${projectId}/env/${envId}`, {
        method: 'DELETE',
        credentials: 'include',
    });
    return handleResponse(res);
}

export async function createProject(name: string, description?: string, environment?: string) {
    const res = await fetch('/api/projects', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ name, description, environment }),
        headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(res);
}

export async function updateProject(id: string, name: string, description?: string, environment?: string) {
    const res = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        credentials: 'include',
        body: JSON.stringify({ name, description, environment }),
        headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(res);
}

export async function deleteProject(id: string) {
    const res = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        credentials: 'include',
    });
    return handleResponse(res);
}