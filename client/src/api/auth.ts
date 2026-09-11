import { User, UserRole, ProjectRequest, TrackerRequest } from '../types/elm';

const INITIAL_USERS: User[] = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@roboserv.io',
    name: 'Admin Owner (Superadmin)',
    password: 'admin123',
    role: 'ADMIN_OWNER',
    engineering_role: 'ADMIN',
    status: 'ACTIVE',
    assigned_project_ids: [1],
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    username: 'zewd',
    email: 'zewd@roboserv.io',
    name: 'Zewd (Lead Systems Engineer)',
    password: 'zewd123',
    role: 'USER',
    engineering_role: 'SYSTEMS_ENGINEER',
    status: 'ACTIVE',
    assigned_project_ids: [1],
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    username: 'engineer',
    email: 'engineer@roboserv.io',
    name: 'Alex Rivera (ROS2 Dev)',
    password: 'user123',
    role: 'USER',
    engineering_role: 'SOFTWARE_ENGINEER',
    status: 'ACTIVE',
    assigned_project_ids: [1],
    created_at: new Date().toISOString()
  },
  {
    id: 4,
    username: 'demo',
    email: 'demo@public.io',
    name: 'Public Demo Visitor',
    password: 'demo123',
    role: 'DEMO',
    engineering_role: 'VIEWER',
    status: 'ACTIVE',
    assigned_project_ids: [1],
    created_at: new Date().toISOString()
  }
];

const INITIAL_PROJECT_REQUESTS: ProjectRequest[] = [
  {
    id: 101,
    user_id: 3,
    user_name: 'Alex Rivera (ROS2 Dev)',
    requested_name: 'RoboServ-M2 Micro Delivery Bot',
    key: 'MICRO',
    description: 'Compact indoor hallway delivery chassis spec.',
    reason: 'Sub-system development for indoor hotel delivery',
    status: 'PENDING',
    created_at: new Date().toISOString()
  }
];

const INITIAL_TRACKER_REQUESTS: TrackerRequest[] = [
  {
    id: 201,
    user_id: 2,
    user_name: 'Zewd (Lead Systems Engineer)',
    project_id: 1,
    project_name: 'RoboServ-X1 Autonomous Delivery Robot',
    requested_name: 'Hardware Interface Specs',
    requested_key: 'HW-IF-',
    type: 'REQUIREMENT',
    enable_test_steps: false,
    enable_folders: true,
    reason: 'Track CANbus bus interface & power distribution specs',
    status: 'PENDING',
    created_at: new Date().toISOString()
  }
];

const getStored = <T,>(key: string, fallback: T): T => {
  try {
    const s = localStorage.getItem(`roboserv_auth_${key}`);
    if (s) return JSON.parse(s);
  } catch (e) {
    console.error('Storage error for auth key:', key, e);
  }
  return fallback;
};

const setStored = <T,>(key: string, value: T) => {
  try {
    localStorage.setItem(`roboserv_auth_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error('Save error for auth key:', key, e);
  }
};

const getStoredSession = <T,>(key: string, fallback: T): T => {
  try {
    localStorage.removeItem('roboserv_auth_current_user');
    const s = sessionStorage.getItem(`roboserv_auth_${key}`);
    if (s) return JSON.parse(s);
  } catch (e) {
    console.error('Session storage error for auth key:', key, e);
  }
  return fallback;
};

const setStoredSession = <T,>(key: string, value: T) => {
  try {
    sessionStorage.setItem(`roboserv_auth_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error('Save session error for auth key:', key, e);
  }
};

export class AuthService {
  private users: User[];
  private projectRequests: ProjectRequest[];
  private trackerRequests: TrackerRequest[];
  private currentUser: User | null = null;

  constructor() {
    this.users = getStored<User[]>('users', INITIAL_USERS);
    this.projectRequests = getStored<ProjectRequest[]>('project_requests', INITIAL_PROJECT_REQUESTS);
    this.trackerRequests = getStored<TrackerRequest[]>('tracker_requests', INITIAL_TRACKER_REQUESTS);
    
    // Always purge stored user session so tab restoration (Ctrl+Shift+T) or new tabs force re-authentication
    try {
      sessionStorage.removeItem('roboserv_auth_current_user');
      localStorage.removeItem('roboserv_auth_current_user');
    } catch (e) {
      console.error('Failed to clear storage:', e);
    }
    this.currentUser = null;
  }

  public getUsers(): User[] {
    return this.users;
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public getProjectRequests(): ProjectRequest[] {
    return this.projectRequests;
  }

  public getTrackerRequests(): TrackerRequest[] {
    return this.trackerRequests;
  }

  public login(username: string, pass: string): { success: boolean; user?: User; message?: string } {
    const clean = username.trim().toLowerCase();
    if (!clean) {
      return { success: false, message: 'Please enter a username or email.' };
    }

    if (!pass || !pass.trim()) {
      return { success: false, message: 'Password is required to log in.' };
    }

    // Match by username, email, full name, or first name (e.g. "alex", "alex rivera", "engineer")
    const target = this.users.find(u => 
      u.username.toLowerCase() === clean ||
      u.email.toLowerCase() === clean ||
      u.name.toLowerCase() === clean ||
      u.name.toLowerCase().startsWith(clean) ||
      u.name.toLowerCase().includes(clean)
    );

    if (!target) {
      return { success: false, message: 'Invalid username, name, or credentials.' };
    }

    if (target.status === 'SUSPENDED') {
      return { success: false, message: 'This user account is suspended by Admin Owner.' };
    }

    // Strict Password Validation
    const cleanPass = pass.trim();
    const expectedPass = target.password || '123';

    if (cleanPass !== expectedPass) {
      return { success: false, message: 'Incorrect password. Access denied.' };
    }

    this.currentUser = target;
    return { success: true, user: target };
  }

  public loginAsDemo(): User {
    const demoUser = this.users.find(u => u.role === 'DEMO') || INITIAL_USERS[3];
    this.currentUser = demoUser;
    return demoUser;
  }

  public logout(): void {
    this.currentUser = null;
    try {
      sessionStorage.removeItem('roboserv_auth_current_user');
      localStorage.removeItem('roboserv_auth_current_user');
    } catch (e) {
      console.error('Logout cleanup error:', e);
    }
  }

  public createUser(data: { username: string; email: string; name: string; password?: string; role: UserRole; engineering_role?: any }): User {
    const newUser: User = {
      id: Date.now(),
      username: data.username.trim().toLowerCase(),
      email: data.email.trim(),
      name: data.name.trim(),
      password: data.password?.trim() || 'user123',
      role: data.role,
      engineering_role: data.engineering_role || 'SYSTEMS_ENGINEER',
      status: 'ACTIVE',
      assigned_project_ids: [1],
      created_at: new Date().toISOString()
    };

    this.users = [newUser, ...this.users];
    setStored('users', this.users);
    return newUser;
  }

  public toggleUserStatus(userId: number): User | null {
    this.users = this.users.map(u => {
      if (u.id === userId && u.role !== 'ADMIN_OWNER') {
        return { ...u, status: u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' };
      }
      return u;
    });
    setStored('users', this.users);
    return this.users.find(u => u.id === userId) || null;
  }

  public assignUserToProject(userId: number, projectId: number): void {
    this.users = this.users.map(u => {
      if (u.id === userId) {
        const set = new Set(u.assigned_project_ids);
        set.add(projectId);
        return { ...u, assigned_project_ids: Array.from(set) };
      }
      return u;
    });
    setStored('users', this.users);
  }

  public submitProjectRequest(data: { requested_name: string; key: string; description?: string; reason?: string }): ProjectRequest {
    const req: ProjectRequest = {
      id: Date.now(),
      user_id: this.currentUser?.id || 2,
      user_name: this.currentUser?.name || 'Zewd',
      requested_name: data.requested_name.trim(),
      key: data.key.toUpperCase().trim(),
      description: data.description || '',
      reason: data.reason || '',
      status: 'PENDING',
      created_at: new Date().toISOString()
    };
    this.projectRequests = [req, ...this.projectRequests];
    setStored('project_requests', this.projectRequests);
    return req;
  }

  public submitTrackerRequest(data: {
    project_id: number;
    project_name: string;
    requested_name: string;
    requested_key: string;
    type: string;
    enable_test_steps: boolean;
    enable_folders: boolean;
    reason?: string;
  }): TrackerRequest {
    const req: TrackerRequest = {
      id: Date.now(),
      user_id: this.currentUser?.id || 2,
      user_name: this.currentUser?.name || 'Zewd',
      project_id: data.project_id,
      project_name: data.project_name,
      requested_name: data.requested_name.trim(),
      requested_key: data.requested_key.trim(),
      type: data.type,
      enable_test_steps: data.enable_test_steps,
      enable_folders: data.enable_folders,
      reason: data.reason || '',
      status: 'PENDING',
      created_at: new Date().toISOString()
    };
    this.trackerRequests = [req, ...this.trackerRequests];
    setStored('tracker_requests', this.trackerRequests);
    return req;
  }

  public resolveProjectRequest(id: number, approved: boolean): ProjectRequest | null {
    this.projectRequests = this.projectRequests.map(r => r.id === id ? { ...r, status: approved ? 'APPROVED' : 'REJECTED' } : r);
    setStored('project_requests', this.projectRequests);
    return this.projectRequests.find(r => r.id === id) || null;
  }

  public resolveTrackerRequest(id: number, approved: boolean): TrackerRequest | null {
    this.trackerRequests = this.trackerRequests.map(r => r.id === id ? { ...r, status: approved ? 'APPROVED' : 'REJECTED' } : r);
    setStored('tracker_requests', this.trackerRequests);
    return this.trackerRequests.find(r => r.id === id) || null;
  }
}

export const authService = new AuthService();
