import React, { useEffect, useState } from 'react';
import { History, User, Calendar, Tag } from 'lucide-react';
import { api } from '../api/client';
import { AuditLog } from '../types/elm';

export const AuditView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    api.getAuditLogs().then(setLogs).catch(console.error);
  }, []);

  return (
    <div style={{ padding: '24px', overflowY: 'auto', height: 'calc(100vh - 60px)' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>System Audit Trail & Activity Log</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Immutable WHO, WHAT, WHEN, and WHY audit history for engineering compliance
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {logs.map((log) => (
          <div key={log.id} style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-verified">{log.action}</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>{log.entity_type} #{log.entity_id}</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '4px' }}>
                {log.details?.message || JSON.stringify(log.details)}
              </div>
            </div>

            <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <div>User: {log.user_name || log.user_email}</div>
              <div>{new Date(log.created_at).toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
