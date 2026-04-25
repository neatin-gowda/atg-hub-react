import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { LEAVE_CONFIG } from '../config';
import { IconChevLeft } from '../components/Icons';

const APPROVALS = [
  { initials: 'SA', name: 'Sara Al Maktoum', role: 'Design Lead · 3 days', type: 'Annual', dates: '28 Apr – 30 Apr 2026', color: 'linear-gradient(135deg,#6366F1,#4338CA)' },
  { initials: 'RP', name: 'Raj Patel', role: 'Backend Engineer · 1 day', type: 'Sick', dates: '25 Apr 2026', color: 'linear-gradient(135deg,#10B981,#047857)' },
  { initials: 'FZ', name: 'Fatima Al Zahra', role: 'Product Manager · 5 days', type: 'Annual', dates: '5 May – 9 May 2026', color: 'linear-gradient(135deg,#EC4899,#BE185D)' },
];

export default function Leave() {
  const navigate = useNavigate();
  const { show } = useToast();
  const [leaveType, setLeaveType] = useState('Annual');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [reason, setReason] = useState('');
  const [dismissed, setDismissed] = useState({});

  const handleApproval = (i, action) => {
    show(action === 'approve' ? 'Approved ✓' : 'Declined', action === 'approve' ? 'success' : 'error');
    setDismissed(d => ({ ...d, [i]: true }));
  };

  const submitLeave = () => {
    if (!from || !to) { show('Select dates', 'error'); return; }
    show('Leave request submitted ✓', 'success');
    navigate('/');
  };

  return (
    <div className="page-enter"><div className="content">
      <div className="subh">
        <button className="back-btn" onClick={() => navigate('/')}><IconChevLeft /></button>
        <h1>Leave <em>Details</em></h1>
      </div>

      <div className="leave-stats">
        <div className="ls"><div className="n">{LEAVE_CONFIG.balance}</div><div className="l">Balance</div></div>
        <div className="ls"><div className="n">{LEAVE_CONFIG.used}</div><div className="l">Used</div></div>
        <div className="ls"><div className="n">{LEAVE_CONFIG.pending}</div><div className="l">Pending</div></div>
      </div>

      <div className="sh"><h2>Pending <em>Approvals</em></h2></div>
      <div style={{ padding: '0 24px' }}>
        {APPROVALS.map((a, i) => (
          <div className="approval-card" key={i} style={{ opacity: dismissed[i] ? 0.3 : 1, transition: 'opacity .3s' }}>
            <div className="top">
              <div className="av av-sm" style={{ background: a.color, color: '#fff' }}>{a.initials}</div>
              <div className="who"><strong>{a.name}</strong><span>{a.role}</span></div>
              <span className="type-tag">{a.type}</span>
            </div>
            <div className="dates">{a.dates}</div>
            {!dismissed[i] && (
              <div className="approval-btns">
                <button className="btn btn-approve" onClick={() => handleApproval(i, 'approve')}>Approve</button>
                <button className="btn btn-reject" onClick={() => handleApproval(i, 'reject')}>Decline</button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="sh"><h2>Request <em>Leave</em></h2></div>
      <div style={{ padding: '0 24px' }}>
        <div className="card" style={{ cursor: 'default' }}>
          <label className="fl">Leave type</label>
          <div className="type-pills">
            {['Annual', 'Sick', 'Personal', 'WFH'].map(t => (
              <button key={t} className={`pill ${leaveType === t ? 'active' : ''}`} onClick={() => setLeaveType(t)}>{t}</button>
            ))}
          </div>
          <div className="fg"><label className="fl">From</label><input type="date" className="fi" value={from} onChange={e => setFrom(e.target.value)} /></div>
          <div className="fg"><label className="fl">To</label><input type="date" className="fi" value={to} onChange={e => setTo(e.target.value)} /></div>
          <div className="fg"><label className="fl">Reason</label><input className="fi" placeholder="Optional" value={reason} onChange={e => setReason(e.target.value)} /></div>
          <button className="btn btn-brand" onClick={submitLeave}>Submit Request</button>
        </div>
      </div>
    </div></div>
  );
}
