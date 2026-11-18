import { Message, HistoryItem, User } from '../types';

export interface UserStats {
  id: string;
  username: string;
  name: string;
  role: 'trainee' | 'admin';
  createdAt?: string;
  blocked?: boolean;
  callCount: number;
  avgScore: number;
  bestScore: number;
  passRate: number;
  lastActive?: string;
  recentCalls: {
    id: string;
    date: string;
    companyName: string;
    contactName: string;
    score: number;
    type: string;
  }[];
}

export function getAuthHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(extra || {})
  };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('jyc_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
}

export const api = {
  // Authentication & Session
  async login(username: string, password: string, customName?: string): Promise<{ success: boolean; user: User; token: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ username, password, customName }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Credenciales incorrectas');
    
    if (data.token) {
      localStorage.setItem('jyc_token', data.token);
    }
    return data;
  },

  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'same-origin',
      });
    } catch {}
    localStorage.removeItem('jyc_token');
    localStorage.removeItem('jyc_user');
  },

  async getCurrentSessionUser(): Promise<User | null> {
    try {
      const res = await fetch('/api/auth/me', {
        headers: getAuthHeaders(),
        credentials: 'same-origin'
      });
      if (res.ok) {
        const data = await res.json();
        return data.user || null;
      }
      return null;
    } catch {
      return null;
    }
  },

  // Gemini Chat (Authenticated & Rate Limited)
  async sendChatMessage(messages: Message[], systemInstruction: string): Promise<string> {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'same-origin',
      body: JSON.stringify({ messages, systemInstruction }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al comunicarse con el coach');
    return data.text;
  },

  // Call Audit (Authenticated & Rate Limited)
  async auditAudio(audioBase64: string, mimeType: string): Promise<any> {
    const res = await fetch('/api/audit-audio', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'same-origin',
      body: JSON.stringify({ audioBase64, mimeType }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al auditar el audio');
    return data;
  },

  // History (Server validates identity & role)
  async fetchHistory(user: User): Promise<HistoryItem[]> {
    const url = user.role === 'admin'
      ? '/api/history?role=admin'
      : `/api/history?role=trainee&userId=${user.id}`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
      credentials: 'same-origin'
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.history) ? data.history : [];
  },

  async saveHistoryItem(item: HistoryItem, role: 'trainee' | 'admin'): Promise<void> {
    await fetch('/api/history', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'same-origin',
      body: JSON.stringify(item),
    });
  },

  async deleteHistoryItem(id: string): Promise<void> {
    await fetch(`/api/history/${id}`, { 
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'same-origin'
    });
  },

  async clearHistory(role: string, userId?: string): Promise<void> {
    await fetch('/api/history/clear', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'same-origin',
      body: JSON.stringify({ role, userId }),
    });
  },

  // Audio Upload & Retrieval
  async uploadAudio(id: string, audioBase64: string, mimeType: string): Promise<string | undefined> {
    const res = await fetch('/api/audios/upload', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'same-origin',
      body: JSON.stringify({ id, audioBase64, mimeType }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.audioUrl;
    }
    return undefined;
  },

  // User Management (Admin Only - Verified on Server)
  async fetchUserList(): Promise<UserStats[]> {
    const res = await fetch('/api/users/list', {
      headers: getAuthHeaders(),
      credentials: 'same-origin'
    });
    if (!res.ok) throw new Error('Error al consultar lista de vendedores');
    const data = await res.json();
    return data.users || [];
  },

  async createUser(user: { username: string; password: string; name: string }): Promise<void> {
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'same-origin',
      body: JSON.stringify(user),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al crear vendedor');
  },

  async updateUserPassword(userId: string, newPassword: string): Promise<void> {
    const res = await fetch(`/api/admin/users/${userId}/password`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'same-origin',
      body: JSON.stringify({ newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al actualizar contraseña');
  },

  async toggleUserBlock(userId: string): Promise<boolean> {
    const res = await fetch(`/api/admin/users/${userId}/block`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'same-origin',
      body: JSON.stringify({}),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al modificar estado del vendedor');
    return data.blocked;
  },

  async deleteUser(userId: string): Promise<void> {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'same-origin',
      body: JSON.stringify({}),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al eliminar usuario');
  },
};
