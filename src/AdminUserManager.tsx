import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Key, Trash2, X, 
  CheckCircle2, AlertCircle, Loader2, Eye, EyeOff,
  Copy, PhoneCall, ChevronRight, ArrowLeft, Check, Ban
} from 'lucide-react';
import { useLanguage } from './i18n/LanguageContext';

interface AdminUserManagerProps {
  onClose: () => void;
}

interface RecentCallSummary {
  id: string;
  date: string;
  companyName: string;
  contactName: string;
  score: number;
  type: string;
}

interface DetailedUser {
  id: string;
  username: string;
  name: string;
  role: 'trainee' | 'admin';
  password?: string;
  createdAt: string;
  blocked?: boolean;
  callCount: number;
  avgScore: number;
  bestScore: number;
  passRate: number;
  lastActive?: string;
  recentCalls: RecentCallSummary[];
}

export default function AdminUserManager({ onClose }: AdminUserManagerProps) {
  const { language } = useLanguage();
  const [users, setUsers] = useState<DetailedUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [selectedUser, setSelectedUser] = useState<DetailedUser | null>(null);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [creating, setCreating] = useState(false);

  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [changingPass, setChangingPass] = useState(false);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [dbStatus, setDbStatus] = useState<{ mode?: string; connected?: boolean } | null>(null);

  const fetchUsers = async (keepSelectedUsername?: string) => {
    setLoadingUsers(true);
    try {
      fetch('/api/status').then(r => r.json()).then(d => {
        if (d && d.database) setDbStatus(d.database);
      }).catch(() => {});

      const res = await fetch('/api/users/list');
      if (res.ok) {
        const data = await res.json();
        const list: DetailedUser[] = data.users || [];
        setUsers(list);

        if (keepSelectedUsername) {
          const found = list.find(u => u.username === keepSelectedUsername);
          if (found) setSelectedUser(found);
        } else if (selectedUser) {
          const found = list.find(u => u.username === selectedUser.username);
          if (found) setSelectedUser(found);
        }
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim() || !newName.trim()) return;

    setCreating(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUsername.trim(),
          password: newPassword.trim(),
          name: newName.trim(),
          role: 'trainee',
          requesterRole: 'admin',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No fue posible registrar al usuario.');
      }

      setFeedback({ type: 'success', message: `Vendedor @${newUsername} creado exitosamente.` });
      setNewUsername('');
      setNewName('');
      setNewPassword('');
      setShowCreateForm(false);
      await fetchUsers(newUsername.trim());
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error al crear vendedor.' });
    } finally {
      setCreating(false);
    }
  };

  const handleChangePassword = async (username: string) => {
    if (!newPasswordInput.trim()) return;

    setChangingPass(true);
    try {
      const res = await fetch(`/api/admin/users/${username}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newPassword: newPasswordInput.trim(),
          requesterRole: 'admin',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No fue posible actualizar la contraseña.');
      }

      setFeedback({ type: 'success', message: `Contraseña de @${username} actualizada con éxito.` });
      setIsEditingPassword(false);
      setNewPasswordInput('');
      await fetchUsers(username);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error al cambiar contraseña.' });
    } finally {
      setChangingPass(false);
    }
  };

  const handleToggleBlock = async (username: string, currentlyBlocked?: boolean) => {
    const actionLabel = currentlyBlocked ? 'reactivar' : 'suspender';
    if (!window.confirm(`¿Seguro que deseas ${actionLabel} el acceso de @${username}?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${username}/block`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requesterRole: 'admin' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al modificar estado.');

      setFeedback({
        type: 'success',
        message: data.blocked 
          ? `Acceso de @${username} suspendido.` 
          : `Acceso de @${username} reactivado.`,
      });
      await fetchUsers(username);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error al actualizar estado.' });
    }
  };

  const handleDeleteUser = async (username: string, name: string) => {
    if (!window.confirm(`¿Estás completamente seguro de eliminar la cuenta de ${name} (@${username})?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${username}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requesterRole: 'admin' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al eliminar usuario.');

      setFeedback({ type: 'success', message: `Usuario @${username} eliminado correctamente.` });
      setSelectedUser(null);
      await fetchUsers();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error al eliminar cuenta.' });
    }
  };

  const togglePasswordVisibility = (username: string) => {
    setShowPasswordMap(prev => ({ ...prev, [username]: !prev[username] }));
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white text-slate-900 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="font-display font-bold text-base sm:text-lg text-slate-900">
                  {language === 'en' ? 'User Accounts & Access Management' : 'Gestión de Cuentas y Accesos'}
                </h2>
                {dbStatus && (
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                    dbStatus.mode === 'postgres' && dbStatus.connected
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {dbStatus.mode === 'postgres' && dbStatus.connected 
                      ? (language === 'en' ? 'Database Connected' : 'Base de datos conectada') 
                      : (language === 'en' ? 'Local Storage' : 'Almacenamiento Local')}
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-xs mt-0.5">
                {language === 'en'
                  ? 'Register new sales reps, view or reset passwords, and manage permissions.'
                  : 'Registra nuevos vendedores, consulta o restablece contraseñas y administra permisos.'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-left flex-1">
          
          {feedback && (
            <div className={`p-4 rounded-xl text-sm flex items-center justify-between border ${
              feedback.type === 'success' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              <div className="flex items-center gap-2">
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span className="font-medium">{feedback.message}</span>
              </div>
              <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {selectedUser ? (
            <div className="space-y-6">
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setIsEditingPassword(false);
                }}
                className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{language === 'en' ? 'Back to sales rep list' : 'Volver a la lista de vendedores'}</span>
              </button>

              {/* Ficha de Perfil y Claves */}
              <div className="bg-slate-50 rounded-2xl p-5 sm:p-6 border border-slate-200 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 font-display font-bold text-lg">
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-display font-bold text-slate-900">{selectedUser.name}</h3>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
                          {selectedUser.role === 'admin' 
                            ? (language === 'en' ? 'Supervisor' : 'Supervisor') 
                            : (language === 'en' ? 'Sales Rep' : 'Vendedor')}
                        </span>
                        {selectedUser.role !== 'admin' && (
                          selectedUser.blocked ? (
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 flex items-center gap-1">
                              <Ban className="w-3 h-3" /> {language === 'en' ? 'Access suspended' : 'Acceso suspendido'}
                            </span>
                          ) : (
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> {language === 'en' ? 'Active' : 'Activo'}
                            </span>
                          )
                        )}
                      </div>
                      <p className="text-slate-500 text-xs mt-0.5">{language === 'en' ? 'Username' : 'Usuario'}: @{selectedUser.username}</p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right text-xs text-slate-500">
                    <span>{language === 'en' ? 'Registration date:' : 'Fecha de registro:'}</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{selectedUser.createdAt || (language === 'en' ? 'Active' : 'Activo')}</p>
                  </div>
                </div>

                {/* Credenciales de Acceso */}
                <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
                      <Key className="w-4 h-4 text-amber-600" />
                      <span>{language === 'en' ? 'Credentials & Security' : 'Credenciales y Seguridad'}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(`Usuario: ${selectedUser.username}`, 'user')}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedType === 'user' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedType === 'user' ? (language === 'en' ? 'Copied' : 'Copiado') : (language === 'en' ? 'Copy username' : 'Copiar usuario')}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between border border-slate-200">
                      <div>
                        <span className="text-xs font-medium text-slate-500 block">{language === 'en' ? 'Username' : 'Usuario'}</span>
                        <span className="font-mono text-sm font-bold text-slate-900 select-all">{selectedUser.username}</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between border border-slate-200">
                      <div className="flex-1 pr-2">
                        <span className="text-xs font-medium text-slate-500 block">{language === 'en' ? 'Password Status' : 'Estado de Contraseña'}</span>
                        <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{language === 'en' ? 'Encrypted with Bcrypt (secure)' : 'Cifrada con Bcrypt (segura)'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    {isEditingPassword ? (
                      <div className="flex items-center gap-2 w-full">
                        <input
                          type="text"
                          value={newPasswordInput}
                          onChange={(e) => setNewPasswordInput(e.target.value)}
                          placeholder={language === 'en' ? 'New password...' : 'Nueva contraseña...'}
                          className="flex-1 px-3 py-2 text-sm rounded-lg bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                        <button
                          onClick={() => handleChangePassword(selectedUser.username)}
                          disabled={changingPass}
                          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50"
                        >
                          {changingPass 
                            ? (language === 'en' ? 'Saving...' : 'Guardando...') 
                            : (language === 'en' ? 'Save' : 'Guardar')}
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingPassword(false);
                            setNewPasswordInput('');
                          }}
                          className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-200 cursor-pointer"
                        >
                          {language === 'en' ? 'Cancel' : 'Cancelar'}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setIsEditingPassword(true);
                          setNewPasswordInput('');
                        }}
                        className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>{language === 'en' ? 'Change password for this rep' : 'Cambiar contraseña para este vendedor'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Métricas */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                  <p className="text-xs font-medium text-slate-500">{language === 'en' ? 'Practices Completed' : 'Prácticas Completadas'}</p>
                  <p className="text-xl font-display font-extrabold font-mono text-slate-900 mt-1">{selectedUser.callCount}</p>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                  <p className="text-xs font-medium text-slate-500">{language === 'en' ? 'Overall Average' : 'Promedio General'}</p>
                  <p className="text-xl font-display font-extrabold font-mono text-slate-900 mt-1">
                    {selectedUser.avgScore} <span className="text-xs text-slate-400 font-sans font-normal">/ 100</span>
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                  <p className="text-xs font-medium text-slate-500">{language === 'en' ? 'Best Score' : 'Mejor Puntaje'}</p>
                  <p className="text-xl font-display font-extrabold font-mono text-amber-700 mt-1">
                    {selectedUser.bestScore} <span className="text-xs text-slate-400 font-sans font-normal">/ 100</span>
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                  <p className="text-xs font-medium text-slate-500">{language === 'en' ? 'Pass Rate' : 'Tasa de Aprobación'}</p>
                  <p className="text-xl font-display font-extrabold font-mono text-emerald-700 mt-1">{selectedUser.passRate}%</p>
                </div>
              </div>

              {selectedUser.role !== 'admin' && (
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-200">
                  <button
                    onClick={() => handleToggleBlock(selectedUser.username, selectedUser.blocked)}
                    className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      selectedUser.blocked
                        ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                        : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                    }`}
                  >
                    {selectedUser.blocked ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>{language === 'en' ? 'Reactivate Access' : 'Reactivar Acceso'}</span>
                      </>
                    ) : (
                      <>
                        <Ban className="w-4 h-4 text-amber-600" />
                        <span>{language === 'en' ? 'Suspend Access' : 'Suspender Acceso'}</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDeleteUser(selectedUser.username, selectedUser.name)}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-rose-200"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{language === 'en' ? 'Delete Account' : 'Eliminar Cuenta'}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-display font-bold text-slate-900 text-sm">{language === 'en' ? 'Registered Sales Reps' : 'Vendedores Registrados'}</h3>
                  <p className="text-xs text-slate-500">{language === 'en' ? 'Select a sales rep to view credentials or edit access.' : 'Selecciona un vendedor para ver sus claves o editar su acceso.'}</p>
                </div>

                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all cursor-pointer self-start sm:self-auto"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{showCreateForm ? (language === 'en' ? 'Close form' : 'Cerrar formulario') : (language === 'en' ? 'New Sales Rep' : 'Nuevo Vendedor')}</span>
                </button>
              </div>

              {showCreateForm && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <h4 className="font-display font-bold text-slate-900 text-sm">
                      {language === 'en' ? 'Register New Sales Rep' : 'Registrar Nuevo Vendedor'}
                    </h4>
                    <button onClick={() => setShowCreateForm(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {language === 'en' ? 'Full Name' : 'Nombre Completo'}
                      </label>
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Ej. Carlos Martínez"
                        className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white text-slate-900"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {language === 'en' ? 'Username' : 'Usuario'}
                      </label>
                      <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="Ej. carlosm"
                        className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white text-slate-900"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {language === 'en' ? 'Password' : 'Contraseña'}
                      </label>
                      <input
                        type="text"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Ej. Jyc2026*"
                        className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white text-slate-900"
                        required
                      />
                    </div>

                    <div className="sm:col-span-3 pt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={creating}
                        className="py-2.5 px-6 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-sm flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all shadow-xs"
                      >
                        {creating ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{language === 'en' ? 'Saving...' : 'Guardando...'}</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4" />
                            <span>{language === 'en' ? 'Create Sales Rep' : 'Crear Vendedor'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {loadingUsers ? (
                <div className="py-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                  <span>{language === 'en' ? 'Loading sales reps...' : 'Cargando vendedores...'}</span>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 bg-white">
                  {users.map((u) => (
                    <div 
                      key={u.id}
                      onClick={() => setSelectedUser(u)}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center shrink-0 font-display font-bold text-sm">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-display font-bold text-slate-900 text-sm group-hover:text-amber-700 transition-colors">
                              {u.name}
                            </span>
                            <span className="text-xs text-slate-500">
                              @{u.username}
                            </span>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                              {u.role === 'admin' 
                                ? (language === 'en' ? 'Supervisor' : 'Supervisor') 
                                : (language === 'en' ? 'Sales Rep' : 'Vendedor')}
                            </span>
                            {u.role !== 'admin' && u.blocked && (
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                                {language === 'en' ? 'Suspended' : 'Suspendido'}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                            <span>{u.callCount} {u.callCount === 1 ? (language === 'en' ? 'practice' : 'práctica') : (language === 'en' ? 'practices' : 'prácticas')}</span>
                            {u.callCount > 0 && (
                              <>
                                <span>·</span>
                                <span>{language === 'en' ? 'Avg score' : 'Score promedio'}: <strong className="text-slate-800">{u.avgScore}/100</strong></span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-bold text-amber-700 justify-end">
                        <span>{language === 'en' ? 'View credentials & details' : 'Ver credenciales y detalles'}</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0">
          <span className="text-xs text-slate-500">
            JYC Equipment · {language === 'en' ? 'Sales Management' : 'Gestión Comercial'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            {language === 'en' ? 'Close' : 'Cerrar'}
          </button>
        </div>

      </div>
    </div>
  );
}
