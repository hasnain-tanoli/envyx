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

export async function getTrashEnvs(projectId: string): Promise<Environment[]> {
    const res = await fetch(`/api/projects/${projectId}/env/trash`, { credentials: 'include' });
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

export async function restoreEnv(projectId: string, envId: string) {
    const res = await fetch(`/api/projects/${projectId}/env/${envId}/restore`, {
        method: 'POST',
        credentials: 'include',
    });
    return handleResponse(res);
}

export async function hardDeleteEnv(projectId: string, envId: string) {
    const res = await fetch(`/api/projects/${projectId}/env/${envId}/hard-delete`, {
        method: 'DELETE',
        credentials: 'include',
    });
    return handleResponse(res);
}

export async function bulkImportEnvs(projectId: string, content: string) {
    const res = await fetch(`/api/projects/${projectId}/env/bulk`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ content }),
        headers: { 'Content-Type': 'application/json' },
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

export async function updateProject(id: string, name: string, description?: string, environment?: string, teamId?: string) {
    const res = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        credentials: 'include',
        body: JSON.stringify({ name, description, environment, team_id: teamId }),
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

// --- Team APIs ---

export async function getTeams() {
    const res = await fetch('/api/teams', { credentials: 'include' });
    return handleResponse(res);
}

export async function createTeam(name: string, slug: string) {
    const res = await fetch('/api/teams', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ name, slug }),
        headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(res);
}

export async function getTeamMembers(teamId: string) {
    const res = await fetch(`/api/teams/${teamId}/members`, { credentials: 'include' });
    return handleResponse(res);
}

export async function inviteMember(teamId: string, email: string, role: string = 'member') {
    const res = await fetch(`/api/teams/${teamId}/members`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ email, role }),
        headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(res);
}

export async function updateMemberRole(teamId: string, memberId: string, role: string) {
    const res = await fetch(`/api/teams/${teamId}/members/${memberId}`, {
        method: 'PATCH',
        credentials: 'include',
        body: JSON.stringify({ role }),
        headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(res);
}

export async function removeMember(teamId: string, memberId: string) {
    const res = await fetch(`/api/teams/${teamId}/members/${memberId}`, {
        method: 'DELETE',
        credentials: 'include',
    });
    return handleResponse(res);
}

export async function getTeamProjects(teamId: string) {
    const res = await fetch(`/api/teams/${teamId}/projects`, {
        credentials: 'include',
    });
    return handleResponse(res);
}