import { useState, useRef, useEffect } from "react";

const font = document.createElement('link');
font.rel = 'stylesheet';
font.href = 'https://unpkg.com/@fontsource/urbanist/index.css';
document.head.appendChild(font);

const iconsLink = document.createElement('link');
iconsLink.rel = 'stylesheet';
iconsLink.href = 'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css';
document.head.appendChild(iconsLink);


const styleEl = document.createElement('style');
document.head.appendChild(styleEl);

const THEMES = {
  dark: {
    bg:'#0a0a0a', surface:'#111', surface2:'#161616',
    border:'#1e1e1e', border2:'#141414',
    text:'#f0f0f0', muted:'#666', muted2:'#333', sub:'#555',
    inputBg:'#111', accent:'#2563eb', accentText:'#fff',
    btnBg:'#f0f0f0', btnText:'#0a0a0a',
    ghostBorder:'#1e1e1e', ghostText:'#555',
    warnBg:'#1a1000', warnBorder:'#332200', warnText:'#f1a035',
    discountC:'#2563eb', removeBorder:'#2a0000', removeText:'#f13535',
    savedBg:'#0d1a33', savedBorder:'#1a3a6e',
    groupBg:'#0d1a0d', groupBorder:'#1a3a1a',
    ph:'input::placeholder{color:#2a2a2a}',
    COLORS:['#c8f135','#35c8f1','#f1a035','#f135c8','#35f1a0','#f13535','#a035f1'],
  },
  light: {
    bg:'#fafaf8', surface:'#fff', surface2:'#f5f5f0',
    border:'#e8e8e4', border2:'#efefeb',
    text:'#111', muted:'#aaa', muted2:'#e0e0dc', sub:'#bbb',
    inputBg:'#fff', accent:'#6366f1', accentText:'#fff',
    btnBg:'#111', btnText:'#fff',
    ghostBorder:'#ddd', ghostText:'#888',
    warnBg:'#fff8ed', warnBorder:'#ffe4b5', warnText:'#b45309',
    discountC:'#6366f1', removeBorder:'#fee2e2', removeText:'#dc2626',
    savedBg:'#eef2ff', savedBorder:'#c7d2fe',
    groupBg:'#f0fdf4', groupBorder:'#bbf7d0',
    ph:'input::placeholder{color:#bbb}',
    COLORS:['#6366f1','#f59e0b','#10b981','#ef4444','#0ea5e9','#f97316','#8b5cf6'],
  },
};

export default function App() {
  const [dark, setDark] = useState(true);
  const T = THEMES[dark ? 'dark' : 'light'];

  styleEl.textContent = `
    *{box-sizing:border-box;margin:0;padding:0}
    input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none}
    .chip:hover{opacity:1!important}
    .item-row:hover{background:${T.surface2}!important}
    .saved-row:hover{background:${T.surface2}!important}
    .group-chip:hover{border-color:currentColor!important;opacity:0.9}
    ${T.ph}
  `;

  // Split state
  const [people, setPeople]       = useState([]);
  const [items, setItems]         = useState([]);
  const [discount, setDiscount]   = useState({ amount:'', method:'equal' });
  const [orderDate, setOrderDate] = useState('');
  const [paidBy, setPaidBy]       = useState('');
  const [activeSplitId, setActiveSplitId] = useState(null);
  const [page, setPage]                 = useState('home');
  const [showDashboard, setShowDashboard] = useState(false);
  const [dashGroup, setDashGroup]       = useState(null);
  const [graphFilter, setGraphFilter]   = useState('all');
  const [homeTab, setHomeTab]           = useState('groups');
  const [chartGroup, setChartGroup]     = useState(null);
  const [chartType, setChartType]       = useState('donut');
  const [activeGroup, setActiveGroup]   = useState(null);
  const [paymentInput, setPaymentInput] = useState({});
  const [expandedGroupSplit, setExpandedGroupSplit] = useState(null);
  const [settleUpGroup, setSettleUpGroup]   = useState(null);
  const [panelSettleGroup, setPanelSettleGroup] = useState(null);
  const [panelSettleFrom, setPanelSettleFrom]   = useState('');
  const [panelSettleTo, setPanelSettleTo]       = useState('');
  const [panelSettleAmount, setPanelSettleAmount] = useState(''); // groupId
  const [settleFrom, setSettleFrom]         = useState('');
  const [settleTo, setSettleTo]             = useState('');
  const [settleAmount, setSettleAmount]     = useState(''); // {txKey: amount}
  const [payments, setPayments]         = useState({}); // {groupId: [{from,to,amount,date}]} // 'donut' | 'bar'
  const [spendFilter, setSpendFilter]   = useState('all'); // 'all' | 'month' | '3months' // 'groups' | 'owed' // 'all','month','3months'
  const [updateStatus, setUpdateStatus]   = useState('');
  const [splitView, setSplitView]   = useState('breakdown'); // 'breakdown' | 'settle'
  const [newName, setNewName]     = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [scanning, setScanning]   = useState(false);
  const [copied, setCopied]       = useState(false);
  const [addingItem, setAddingItem] = useState(false);
  const [newItem, setNewItem]     = useState({ name:'', qty:'1', price:'' });
  const fileRef = useRef();

  // Saved splits state
  const [savedSplits, setSavedSplits]       = useState([]);
  const [showSaved, setShowSaved]           = useState(false);
  const [savingName, setSavingName]         = useState('');
  const [showSaveInput, setShowSaveInput]   = useState(false);
  const [saveStatus, setSaveStatus]         = useState('');
  const [expandedSplit, setExpandedSplit]   = useState(null);
  const [renamingSplit, setRenamingSplit]   = useState(null);
  const [renameVal, setRenameVal]           = useState('');

  // Groups state
  const [savedGroups, setSavedGroups]       = useState([]);
  const [showGroups, setShowGroups]         = useState(false);
  const [showGroupInput, setShowGroupInput] = useState(false);
  const [groupName, setGroupName]           = useState('');
  const [groupSaveStatus, setGroupSaveStatus] = useState('');
  const [newGroupName, setNewGroupName]   = useState('');
  const [newGroupMembers, setNewGroupMembers] = useState([]);
  const [newGroupMember, setNewGroupMember] = useState('');
  const [showNewGroup, setShowNewGroup]   = useState(false);

  const storage = {
    set: async (key, value) => { try { localStorage.setItem(key, value); } catch(e) {} },
    get: async (key) => { try { const v = localStorage.getItem(key); return v ? { value: v } : null; } catch(e) { return null; } },
    delete: async (key) => { try { localStorage.removeItem(key); } catch(e) {} },
    list: async (prefix) => { try { return { keys: Object.keys(localStorage).filter(k => k.startsWith(prefix)) }; } catch(e) { return { keys: [] }; } },
  };

  // Load from storage on mount
  useEffect(() => {
    (async () => {
      try {
        // Load splits
        const splitRes = await storage.list('split:');
        if (splitRes?.keys?.length > 0) {
          const splits = (await Promise.all(
            splitRes.keys.map(async k => {
              try { const r = await storage.get(k); return r ? JSON.parse(r.value) : null; }
              catch { return null; }
            })
          )).filter(Boolean).sort((a,b) => b.savedAt - a.savedAt);
          setSavedSplits(splits);
        }
        // Load groups
        const groupRes = await storage.list('group:');
        if (groupRes?.keys?.length > 0) {
          const groups = (await Promise.all(
            groupRes.keys.map(async k => {
              try { const r = await storage.get(k); return r ? JSON.parse(r.value) : null; }
              catch { return null; }
            })
          )).filter(Boolean).sort((a,b) => b.savedAt - a.savedAt);
          setSavedGroups(groups);
        }
        const payRes = await storage.list('payments:');
        if (payRes?.keys?.length > 0) {
          const allPayments = {};
          await Promise.all(payRes.keys.map(async k => {
            try { const r = await storage.get(k); if (r) { const gid = k.replace('payments:',''); allPayments[gid] = JSON.parse(r.value); } } catch {}
          }));
          setPayments(allPayments);
        }
      } catch(e) { console.error(e); }
    })();
  }, []);

  // ── Helpers ──
  const inp = (extra={}) => ({
    background:'transparent', border:'1px solid transparent', color:T.text,
    fontFamily:'"Urbanist",sans-serif', fontSize:12, padding:'4px 6px',
    borderRadius:2, outline:'none', width:'100%', ...extra,
  });
  const ghBtn = (extra={}) => ({
    background:'none', border:`1px solid ${T.ghostBorder}`, borderRadius:2,
    padding:'7px 14px', color:T.ghostText, fontFamily:'"Urbanist",sans-serif',
    fontSize:11, fontWeight:600, cursor:'pointer', letterSpacing:'0.06em', ...extra,
  });
  const solidInput = (extra={}) => ({
    background:T.inputBg, border:`1px solid ${T.border}`, color:T.text,
    fontFamily:'"Urbanist",sans-serif', fontSize:12, padding:'8px 10px',
    borderRadius:2, outline:'none', ...extra,
  });
  const focusBorder = e => e.target.style.borderColor = T.border;
  const blurBorder  = e => e.target.style.borderColor = 'transparent';

  // ── People ──
  const addPerson = () => {
    const name = newName.trim();
    if (!name) return;
    setPeople(p => [...p, { id:Date.now(), name, color:T.COLORS[p.length % T.COLORS.length] }]);
    setNewName('');
  };
  const removePerson = id => {
    setPeople(p => p.filter(x => x.id !== id));
    setItems(p => p.map(i => { const next = {...i.assignedTo}; delete next[id]; return {...i, assignedTo:next}; }));
  };

  // ── Groups ──
  const saveGroup = async () => {
    if (!people.length) return;
    const name = groupName.trim() || `Group ${savedGroups.length + 1}`;
    const id = Date.now();
    const group = { id, name, savedAt:id, members: people };
    try {
      await storage.set(`group:${id}`, JSON.stringify(group));
      setSavedGroups(prev => [group, ...prev]);
      setGroupSaveStatus('saved');
      setShowGroupInput(false);
      setGroupName('');
      setTimeout(() => setGroupSaveStatus(''), 2000);
    } catch(e) { console.error(e); }
  };

  const createGroup = async () => {
    if (!newGroupMembers.length) return;
    const name = newGroupName.trim() || `Group ${savedGroups.length + 1}`;
    const id = Date.now();
    const members = newGroupMembers.map((m, i) => ({ id: id + i, name: m, color: T.COLORS[i % T.COLORS.length] }));
    const group = { id, name, savedAt: id, members };
    await storage.set(`group:${id}`, JSON.stringify(group));
    setSavedGroups(prev => [group, ...prev]);
    setNewGroupName(''); setNewGroupMembers([]); setNewGroupMember(''); setShowNewGroup(false);
  };

  const loadGroup = (group) => {
    // Reassign fresh IDs so colors work correctly with current theme
    const fresh = group.members.map((m, i) => ({
      ...m,
      id: Date.now() + i,
      color: T.COLORS[i % T.COLORS.length],
    }));
    setPeople(fresh);
    setItems(prev => prev.map(i => ({ ...i, assignedTo:{} })));
  };

  const deleteGroup = async (groupId) => {
    try {
      await storage.delete(`group:${groupId}`);
      setSavedGroups(prev => prev.filter(g => g.id !== groupId));
    } catch(e) { console.error(e); }
  };

  // ── Items ──
  const addItemManually = () => {
    const name = newItem.name.trim();
    const price = parseFloat(newItem.price);
    const qty = parseInt(newItem.qty) || 1;
    if (!name || isNaN(price) || price <= 0) return;
    setItems(p => [...p, { id:Date.now()+Math.random(), name, price, qty, assignedTo:{} }]);
    setNewItem({ name:'', qty:'1', price:'' });
    setAddingItem(false);
  };
  const updateItem  = (id, field, value) => setItems(prev => prev.map(i => i.id===id ? {...i,[field]:value} : i));
  const removeItem  = id => setItems(p => p.filter(i => i.id !== id));
  const toggleAssign = (itemId, personId) =>
    setItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      const cur = item.assignedTo[personId] || 0;
      const next = { ...item.assignedTo };
      if (cur > 0) { delete next[personId]; } else { next[personId] = 1; }
      return { ...item, assignedTo: next };
    }));

  const setPersonQty = (itemId, personId, qty) =>
    setItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      const next = { ...item.assignedTo };
      if (qty <= 0) { delete next[personId]; } else { next[personId] = qty; }
      return { ...item, assignedTo: next };
    }));

  // ── Scan ──
  const scanReceipt = async file => {
    if (!file) return;
    setScanning(true);
    try {
      const base64 = await new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result.split(',')[1]);
        reader.onerror = rej;
        reader.readAsDataURL(file);
      });
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64, mediaType: file.type })
      });
      const data = await res.json();
      console.log('API response:', JSON.stringify(data).slice(0, 300));
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (!text) throw new Error('Empty response: ' + JSON.stringify(data).slice(0, 200));
      const parsed = JSON.parse(text.replace(/```json|```/g,'').trim());
      if (parsed && parsed.date) setOrderDate(parsed.date);
      const parsedItems = Array.isArray(parsed) ? parsed : (parsed.items || []);
      setItems(prev => [...prev, ...parsedItems.map(item => ({
        id:Date.now()+Math.random(), name:item.name||'Item',
        price:parseFloat(item.price)||0, qty:parseInt(item.qty)||1, assignedTo:{}
      }))]);
    } catch(err) {
      console.error('Scan error:', err.message);
    } finally {
      setScanning(false);
    }
  };

  // ── Totals ──
  const computeTotals = () => {
    const subtotals = {};
    people.forEach(p => { subtotals[p.id] = 0; });
    items.forEach(item => {
      const assignedEntries = Object.entries(item.assignedTo);
      if (!assignedEntries.length) return;
      const itemQty = parseInt(item.qty) || 1;
      const itemTotal = parseFloat(item.price) * itemQty;
      const totalAssigned = assignedEntries.reduce((sum, [, q]) => sum + q, 0);
      if (totalAssigned >= itemQty) {
        // More or equal participants than qty — split total equally
        const share = itemTotal / assignedEntries.length;
        assignedEntries.forEach(([pid]) => {
          subtotals[pid] = (subtotals[pid]||0) + share;
        });
      } else {
        // Each person pays for their own qty
        assignedEntries.forEach(([pid, qty]) => {
          subtotals[pid] = (subtotals[pid]||0) + parseFloat(item.price) * qty;
        });
      }
    });
    const discountAmt = parseFloat(discount.amount) || 0;
    const active = people.filter(p => (subtotals[p.id]||0) > 0);
    const discounts = {};
    people.forEach(p => { discounts[p.id] = 0; });
    const finals = { ...subtotals };
    if (discountAmt > 0 && active.length > 0) {
      if (discount.method === 'equal') {
        const each = discountAmt / active.length;
        active.forEach(p => { discounts[p.id] = each; finals[p.id] = Math.max(0, subtotals[p.id] - each); });
      } else {
        const grandSub = active.reduce((a,p) => a+(subtotals[p.id]||0), 0);
        active.forEach(p => {
          discounts[p.id] = discountAmt*(grandSub>0 ? subtotals[p.id]/grandSub : 0);
          finals[p.id] = Math.max(0, subtotals[p.id] - discounts[p.id]);
        });
      }
    }
    return { subtotals, discounts, finals, grandTotal: Object.values(finals).reduce((a,b) => a+b, 0) };
  };

  // ── Export / Save split ──
  const exportSplit = () => {
    const { subtotals, discounts, finals, grandTotal } = computeTotals();
    const exportDateStr = orderDate ? new Date(orderDate+'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '';
    let text = 'ORDER SPLIT' + (exportDateStr ? ' — '+exportDateStr : '') + '\n' + '─'.repeat(26) + '\n\n';
    people.forEach(p => {
      text += `${p.name.toUpperCase()}\n`;
      items.filter(i => i.assignedTo[p.id] > 0).forEach(i => {
        const qty = i.assignedTo[p.id];
        const lineTotal = parseFloat(i.price) * qty;
        text += `  ${i.name} ×${qty}: $${lineTotal.toFixed(2)}\n`;
      });
      text += `  OWES: $${(finals[p.id]||0).toFixed(2)}\n\n`;
    });
    text += `TOTAL: $${grandTotal.toFixed(2)}`;
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(()=>setCopied(false),2200); });
  };

  const saveSplit = async () => {
    const name = savingName.trim() || `Split ${new Date().toLocaleDateString()}`;
    const { subtotals, discounts, finals, grandTotal } = computeTotals();
    const id = Date.now();
    const displayDate = orderDate ? new Date(orderDate+'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
    const splitData = { id, name, savedAt:id, paidBy, date:displayDate, orderDate, people, items, discount, finals, grandTotal };
    try {
      await storage.set(`split:${id}`, JSON.stringify(splitData));
      setSavedSplits(prev => [splitData, ...prev]);
      setSaveStatus('saved'); setShowSaveInput(false); setSavingName('');
      setTimeout(()=>setSaveStatus(''),2000);
    } catch(e) { console.error(e); }
  };

  const updateSplit = async () => {
    if (!activeSplitId) return;
    const { finals, grandTotal } = computeTotals();
    try {
      const r = await storage.get(`split:${activeSplitId}`);
      if (!r) return;
      const existing = JSON.parse(r.value);
      const updated = { ...existing, people, items, discount, paidBy, finals, grandTotal,
        orderDate: orderDate || existing.orderDate,
        date: orderDate ? new Date(orderDate+'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : existing.date
      };
      await storage.set(`split:${activeSplitId}`, JSON.stringify(updated));
      setSavedSplits(prev => prev.map(s => s.id === activeSplitId ? updated : s));
      setUpdateStatus('saved');
      setTimeout(() => setUpdateStatus(''), 2000);
    } catch(e) { console.error(e); }
  };

  const deleteSplit = async (splitId) => {
    try {
      await storage.delete(`split:${splitId}`);
      setSavedSplits(prev => prev.filter(s => s.id !== splitId));
      if (expandedSplit===splitId) setExpandedSplit(null);
    } catch(e) { console.error(e); }
  };

  const renameSplit = async (splitId, newName) => {
    if (!newName.trim()) return;
    try {
      const r = await storage.get(`split:${splitId}`);
      if (!r) return;
      const data = JSON.parse(r.value);
      data.name = newName.trim();
      await storage.set(`split:${splitId}`, JSON.stringify(data));
      setSavedSplits(prev => prev.map(s => s.id === splitId ? { ...s, name: newName.trim() } : s));
      setRenamingSplit(null);
      setRenameVal('');
    } catch(e) { console.error(e); }
  };


  const recordPayment = async (groupId, from, to, amount) => {
    if (!amount || parseFloat(amount) <= 0) return;
    const payment = { from, to, amount: parseFloat(amount), date: new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) };
    const updated = [...(payments[groupId] || []), payment];
    await storage.set(`payments:${groupId}`, JSON.stringify(updated));
    setPayments(prev => ({ ...prev, [groupId]: updated }));
  };

  const deletePayment = async (groupId, idx) => {
    const updated = (payments[groupId] || []).filter((_,i) => i !== idx);
    await storage.set(`payments:${groupId}`, JSON.stringify(updated));
    setPayments(prev => ({ ...prev, [groupId]: updated }));
  };

  const resetSplit = () => {
    setPeople([]);
    setItems([]);
    setDiscount({ amount:'', method:'equal' });
    setOrderDate('');
    setPaidBy('');
    setSplitView('breakdown');
    setActiveSplitId(null);
  };

  const loadSplit = (split) => {
    setPeople(split.people); setItems(split.items); setDiscount(split.discount);
    if (split.orderDate) setOrderDate(split.orderDate);
    setPaidBy(split.paidBy || '');
    setActiveSplitId(split.id);
    setShowSaved(false);
  };

  const { subtotals, discounts, finals, grandTotal } = computeTotals();
  const hasItems   = items.length > 0;
  const hasPeople  = people.length > 0;
  const unassigned = items.filter(i => Object.keys(i.assignedTo).length === 0).length;

  const SecLabel = ({ children }) => (
    <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:T.muted, marginBottom:10 }}>{children}</div>
  );

  const HeaderBtn = ({ onClick, active, icon, label, count }) => (
    <button onClick={onClick} style={{
      ...ghBtn({ display:'flex', alignItems:'center', gap:5, padding:'7px 12px' }),
      background: active ? T.accent : 'none',
      color: active ? T.accentText : T.ghostText,
      border: `1px solid ${active ? T.accent : T.ghostBorder}`,
    }}>
      <i className={`ti ti-${icon}`} style={{ fontSize:14 }} aria-hidden="true" />
      {label}{count > 0 ? ` (${count})` : ''}
    </button>
  );

  const getGroupStats = (group) => {
    const groupSplits = savedSplits.filter(s =>
      group.members.every(m => s.people.some(p => p.name === m.name))
    );
    const totalSpent = groupSplits.reduce((a,s) => a + (s.grandTotal||0), 0);
    const netBalances = {};
    group.members.forEach(m => { netBalances[m.name] = 0; });
    groupSplits.forEach(split => {
      if (!split.paidBy) return;
      const payer = split.people.find(p => p.id === split.paidBy);
      if (!payer) return;
      split.people.forEach(p => {
        if (p.id === split.paidBy) return;
        const owes = split.finals[p.id] || 0;
        if (netBalances[p.name] !== undefined) netBalances[p.name] -= owes;
        if (netBalances[payer.name] !== undefined) netBalances[payer.name] += owes;
      });
    });
    // Apply recorded payments
    const groupPayments = payments[group.id] || [];
    groupPayments.forEach(p => {
      if (netBalances[p.from] !== undefined) netBalances[p.from] += p.amount;
      if (netBalances[p.to] !== undefined) netBalances[p.to] -= p.amount;
    });
    const entries = group.members.map((m,i) => ({ name:m.name, color:T.COLORS[i%T.COLORS.length], amount:netBalances[m.name]||0 }));
    const debtors = entries.filter(e => e.amount < -0.01).map(e => ({...e}));
    const creditors = entries.filter(e => e.amount > 0.01).map(e => ({...e}));
    const transactions = [];
    let i = 0, j = 0;
    const d = debtors.map(x=>({...x})), c = creditors.map(x=>({...x}));
    while (i < d.length && j < c.length) {
      const amount = Math.min(-d[i].amount, c[j].amount);
      if (amount > 0.01) transactions.push({ from:d[i], to:c[j], amount });
      d[i].amount += amount; c[j].amount -= amount;
      if (Math.abs(d[i].amount) < 0.01) i++;
      if (Math.abs(c[j].amount) < 0.01) j++;
    }
    return { groupSplits, totalSpent, transactions };
  };

  const filterSplits = (splits) => {
    const now = new Date();
    if (graphFilter === 'month') {
      return splits.filter(s => {
        if (!s.orderDate) return false;
        const d = new Date(s.orderDate);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    }
    if (graphFilter === '3months') {
      const cutoff = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      return splits.filter(s => {
        if (!s.orderDate) return false;
        return new Date(s.orderDate) >= cutoff;
      });
    }
    return splits;
  };

  const BarChart = ({ data, color, label }) => {
    const max = Math.max(...data.map(d => d.value), 0.01);
    return (
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:T.muted, marginBottom:10 }}>{label}</div>
        <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:80 }}>
          {data.map((d, i) => (
            <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
              <div style={{ fontSize:9, color:T.text, fontWeight:600 }}>${d.value.toFixed(0)}</div>
              <div style={{ width:'100%', background:d.color || color, borderRadius:2, height:`${Math.max((d.value/max)*60, 2)}px`, transition:'height 0.4s ease', minHeight:2 }}/>
              <div style={{ fontSize:9, color:T.muted, textAlign:'center', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', width:'100%' }}>{d.name}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const PieChart = ({ data, size=100, donut=false }) => {
    const [active, setActive] = useState(null);
    const total = data.reduce((s,d) => s+d.value, 0);
    if (total === 0) return null;
    let angle = -Math.PI/2;
    const r = size/2, inner = donut ? r*0.52 : 0;
    const slices = data.map(d => {
      const start = angle;
      const sweep = (d.value/total) * 2 * Math.PI;
      angle += sweep;
      const mid = start + sweep/2;
      const x1=Math.cos(start)*r, y1=Math.sin(start)*r;
      const x2=Math.cos(angle)*r, y2=Math.sin(angle)*r;
      const ix1=Math.cos(start)*inner, iy1=Math.sin(start)*inner;
      const ix2=Math.cos(angle)*inner, iy2=Math.sin(angle)*inner;
      const large = sweep > Math.PI ? 1 : 0;
      const path = donut
        ? `M${ix1},${iy1} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} L${ix2},${iy2} A${inner},${inner} 0 ${large},0 ${ix1},${iy1} Z`
        : `M0,0 L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`;
      const pct = ((d.value/total)*100).toFixed(1);
      return { ...d, path, mid, pct };
    });
    return (
      <div style={{ position:'relative', flexShrink:0 }}>
        <svg width={size} height={size} viewBox={`${-r} ${-r} ${size} ${size}`} style={{ display:'block' }}>
          {slices.map((s,i) => (
            <path key={i} d={s.path}
              fill={s.color}
              stroke={dark?'#0a0a0a':'#fafaf8'}
              strokeWidth={active===i ? 2 : 1.5}
              transform={active===i ? `translate(${Math.cos(s.mid)*4},${Math.sin(s.mid)*4})` : ''}
              style={{ cursor:'pointer', transition:'transform 0.15s' }}
              onClick={() => setActive(active===i ? null : i)}
            />
          ))}
          {donut && active === null && <text x="0" y="5" textAnchor="middle" fill={T.text} fontSize="11" fontWeight="700" fontFamily="Urbanist,sans-serif">${total.toFixed(0)}</text>}
          {donut && active !== null && <>
            <text x="0" y="-4" textAnchor="middle" fill={slices[active].color} fontSize="9" fontWeight="700" fontFamily="Urbanist,sans-serif">{slices[active].name}</text>
            <text x="0" y="8" textAnchor="middle" fill={T.text} fontSize="10" fontWeight="700" fontFamily="Urbanist,sans-serif">${slices[active].value.toFixed(2)}</text>
          </>}
        </svg>
        {active !== null && !donut && (
          <div style={{ position:'absolute', top:-28, left:'50%', transform:'translateX(-50%)', background:T.surface, border:`1px solid ${T.border}`, borderRadius:4, padding:'3px 8px', fontSize:10, fontWeight:700, color:slices[active].color, whiteSpace:'nowrap', pointerEvents:'none' }}>
            {slices[active].name} · ${slices[active].value.toFixed(2)} ({slices[active].pct}%)
          </div>
        )}
      </div>
    );
  };

  const SpendBarChart = ({ data }) => {
    const [active, setActive] = useState(null);
    const max = Math.max(...data.map(d => d.value), 0.01);
    const total = data.reduce((s,d) => s+d.value, 0);
    return (
      <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:90, marginTop:8 }}>
        {data.map((d,i) => (
          <div key={i} onClick={() => setActive(active===i?null:i)} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4, cursor:'pointer' }}>
            <div style={{ fontSize:9, color: active===i ? d.color : T.text, fontWeight:700 }}>
              {active===i ? `${((d.value/total)*100).toFixed(1)}%` : `$${d.value.toFixed(0)}`}
            </div>
            <div style={{ width:'100%', background:d.color, borderRadius:2, height:`${Math.max((d.value/max)*60,2)}px`, transition:'all 0.2s', opacity: active===null||active===i ? 1 : 0.35, outline: active===i ? `2px solid ${d.color}` : 'none', outlineOffset:1 }}/>
            <div style={{ fontSize:9, color: active===i ? d.color : T.muted, textAlign:'center', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', width:'100%', fontWeight: active===i ? 700 : 400 }}>{d.name}</div>
          </div>
        ))}
      </div>
    );
  };

  const LineChart = ({ splits, members }) => {
    if (splits.length < 2) return <div style={{ fontSize:11, color:T.muted2, padding:'10px 0' }}>Need 2+ splits to show trend</div>;
    const sorted = [...splits].filter(s=>s.orderDate).sort((a,b)=>a.orderDate.localeCompare(b.orderDate));
    if (sorted.length < 2) return <div style={{ fontSize:11, color:T.muted2, padding:'10px 0' }}>Add dates to splits to show trend</div>;
    const W=280, H=70, pad=8;
    const totals = sorted.map(s => s.grandTotal || 0);
    const maxV = Math.max(...totals, 0.01);
    const pts = sorted.map((s,i) => {
      const x = pad + (i/(sorted.length-1))*(W-pad*2);
      const y = H - pad - ((s.grandTotal||0)/maxV)*(H-pad*2);
      return { x, y, label:s.name, val:s.grandTotal||0, date:s.orderDate };
    });
    const polyline = pts.map(p=>`${p.x},${p.y}`).join(' ');
    return (
      <div style={{ overflowX:'auto' }}>
        <svg width={W} height={H+20} style={{ display:'block' }}>
          <polyline points={polyline} fill="none" stroke={T.accent} strokeWidth="2" strokeLinejoin="round"/>
          {pts.map((p,i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="3" fill={T.accent}/>
              <text x={p.x} y={H+14} textAnchor="middle" fill={T.muted} fontSize="8" fontFamily="Urbanist,sans-serif">{p.date?.slice(5)}</text>
            </g>
          ))}
          <text x={pad} y={pad+6} fill={T.muted} fontSize="8" fontFamily="Urbanist,sans-serif">${maxV.toFixed(0)}</text>
          <text x={pad} y={H-pad} fill={T.muted} fontSize="8" fontFamily="Urbanist,sans-serif">$0</text>
        </svg>
      </div>
    );
  };

  // ── GROUP DETAIL PAGE ──
  if (activeGroup) {
    const group = activeGroup;
    const { groupSplits, totalSpent, transactions } = getGroupStats(group);
    const groupPayments = payments[group.id] || [];

    // Apply payments to transactions
    const adjustedTx = transactions.map(t => {
      const paid = groupPayments.filter(p => p.from === t.from.name && p.to === t.to.name).reduce((s,p) => s+p.amount, 0);
      return { ...t, paid, remaining: Math.max(0, t.amount - paid) };
    });

    return (
      <div style={{ background:T.bg, minHeight:'100vh', color:T.text, fontFamily:'"Urbanist",sans-serif' }}>
        {/* Header */}
        <div style={{ padding:'16px 20px', borderBottom:`1px solid ${T.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontSize:18, fontWeight:800 }}>{group.name}</div>
            <div style={{ fontSize:10, color:T.muted, marginTop:1 }}>{group.members.map(m=>m.name).join(', ')}</div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => setActiveGroup(null)} style={{ background:'none', border:`1px solid ${T.border}`, borderRadius:2, padding:'7px 10px', cursor:'pointer', color:T.muted, display:'flex', alignItems:'center' }}>
              <i className="ti ti-home" style={{ fontSize:14 }} aria-hidden="true"/>
            </button>
            <button onClick={()=>setDark(d=>!d)} style={{ background:'none', border:`1px solid ${T.border}`, borderRadius:2, padding:'7px 10px', cursor:'pointer', color:T.muted }}>
              {dark ? '☀' : '☾'}
            </button>
          </div>
        </div>

        <div style={{ padding:'20px 20px 80px' }}>
          {/* Stats */}
          <div style={{ display:'flex', gap:8, marginBottom:20 }}>
            <div style={{ flex:1, background:T.surface, border:`1px solid ${T.border}`, borderRadius:2, padding:'12px 14px' }}>
              <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:T.muted, marginBottom:4 }}>Total Spent</div>
              <div style={{ fontSize:22, fontWeight:800 }}>${totalSpent.toFixed(2)}</div>
            </div>
            <div style={{ flex:1, background:T.surface, border:`1px solid ${T.border}`, borderRadius:2, padding:'12px 14px' }}>
              <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:T.muted, marginBottom:4 }}>Splits</div>
              <div style={{ fontSize:22, fontWeight:800 }}>{groupSplits.length}</div>
            </div>
          </div>

          {/* Spending Charts */}
          <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:2, padding:'14px', marginBottom:20 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
              <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:T.muted }}>Spending</div>
              <div style={{ display:'flex', gap:4 }}>
                {['donut','bar'].map(t => (
                  <button key={t} onClick={() => setChartType(t)}
                    style={{ padding:'2px 8px', background: chartType===t ? T.accent : 'none', color: chartType===t ? T.accentText : T.muted, border:`1px solid ${chartType===t ? T.accent : T.ghostBorder}`, borderRadius:2, fontFamily:'"Urbanist",sans-serif', fontSize:9, fontWeight:700, cursor:'pointer', textTransform:'uppercase' }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display:'flex', gap:4, marginBottom:10 }}>
              {[['all','All'],['month','Month'],['3months','3 Mo']].map(([v,l]) => (
                <button key={v} onClick={() => setSpendFilter(v)}
                  style={{ padding:'2px 8px', background: spendFilter===v ? T.btnBg : 'none', color: spendFilter===v ? T.btnText : T.muted, border:`1px solid ${spendFilter===v ? T.border : T.ghostBorder}`, borderRadius:100, fontFamily:'"Urbanist",sans-serif', fontSize:9, fontWeight:600, cursor:'pointer' }}>
                  {l}
                </button>
              ))}
            </div>
            {(() => {
              const now = new Date();
              const filteredSplits = groupSplits.filter(s => {
                if (spendFilter === 'all') return true;
                const d = new Date(s.orderDate || s.savedAt);
                if (spendFilter === 'month') return d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear();
                if (spendFilter === '3months') return d >= new Date(now.getFullYear(), now.getMonth()-2, 1);
                return true;
              });
              const chartData = group.members.map((m,mi) => ({
                name: m.name,
                value: filteredSplits.reduce((sum, split) => {
                  const p = split.people.find(x => x.name === m.name);
                  return sum + (p ? (split.finals[p.id]||0) : 0);
                }, 0),
                color: T.COLORS[mi % T.COLORS.length]
              })).filter(d => d.value > 0);
              if (!chartData.length) return <div style={{ fontSize:11, color:T.muted2 }}>No data for this period</div>;
              const legend = (
                <div style={{ display:'flex', flexDirection:'column', gap:5, flex:1 }}>
                  {chartData.map((d,i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <div style={{ width:8, height:8, borderRadius:'50%', background:d.color, flexShrink:0 }}/>
                      <span style={{ fontSize:11, color:T.text }}>{d.name}</span>
                      <span style={{ fontSize:11, color:T.muted, marginLeft:'auto' }}>${d.value.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              );
              if (chartType === 'donut') return <div style={{ display:'flex', alignItems:'center', gap:16 }}><PieChart data={chartData} size={100} donut={true}/>{legend}</div>;
              return <SpendBarChart data={chartData}/>;
            })()}
          </div>

          {/* Settle Up */}
          <div style={{ background:T.surface, border:`1px solid ${T.muted}44`, borderRadius:2, marginBottom:20, overflow:'hidden' }}>
            <div onClick={() => setSettleUpGroup(settleUpGroup===group.id ? null : group.id)}
              style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 14px', cursor:'pointer' }}>
              <div style={{ fontSize:11, fontWeight:700, color:T.text }}>Record a Payment</div>
              <i className={`ti ti-chevron-${settleUpGroup===group.id?'up':'down'}`} style={{ fontSize:14, color:T.muted }}/>
            </div>
            {settleUpGroup === group.id && (
              <div style={{ borderTop:`1px solid ${T.border}`, padding:'12px 14px' }}>
                <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                  <select value={settleFrom} onChange={e=>setSettleFrom(e.target.value)}
                    style={{ flex:1, minWidth:90, background:'transparent', border:`1px solid ${settleFrom?'#2563eb':'#1e1e1e'}`, color:settleFrom?'#2563eb':T.muted, fontFamily:'"Urbanist",sans-serif', fontSize:12, padding:'8px 10px', borderRadius:6, outline:'none', cursor:'pointer', transition:'border-color 0.15s' }}>
                    <option value="">Who paid?</option>
                    {group.members.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                  </select>
                  <div style={{ fontSize:11, color:T.muted, flexShrink:0 }}>paid</div>
                  <select value={settleTo} onChange={e=>setSettleTo(e.target.value)}
                    style={{ flex:1, minWidth:90, background:'transparent', border:`1px solid ${settleTo?'#35f1a0':'#1e1e1e'}`, color:settleTo?'#35f1a0':T.muted, fontFamily:'"Urbanist",sans-serif', fontSize:12, padding:'8px 10px', borderRadius:6, outline:'none', cursor:'pointer', transition:'border-color 0.15s' }}>
                    <option value="">Who received?</option>
                    {group.members.filter(m=>m.name!==settleFrom).map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                  </select>
                  <div style={{ display:'flex', alignItems:'center', gap:4, background:'transparent', border:`1px solid #2a2a2a`, borderRadius:6, padding:'0 10px', flex:1, minWidth:80 }}>
                    <span style={{ fontSize:11, color:T.muted }}>$</span>
                    <input type="number" min="0" step="0.01" placeholder="Amount"
                      value={settleAmount} onChange={e=>setSettleAmount(e.target.value)}
                      onKeyDown={async e => {
                        if (e.key==='Enter' && settleFrom && settleTo && settleAmount) {
                          await recordPayment(group.id, settleFrom, settleTo, parseFloat(settleAmount));
                          setSettleFrom(''); setSettleTo(''); setSettleAmount(''); setSettleUpGroup(null);
                        }
                      }}
                      style={{ flex:1, background:'transparent', border:'none', color:T.text, fontFamily:'"Urbanist",sans-serif', fontSize:12, padding:'8px 0', outline:'none' }}/>
                  </div>
                  <button onClick={async () => {
                    if (!settleFrom || !settleTo || !settleAmount) return;
                    await recordPayment(group.id, settleFrom, settleTo, parseFloat(settleAmount));
                    setSettleFrom(''); setSettleTo(''); setSettleAmount(''); setSettleUpGroup(null);
                  }} style={{ background:'transparent', border:`1px solid #2563eb`, borderRadius:6, color:'#2563eb', fontFamily:'"Urbanist",sans-serif', fontSize:12, fontWeight:600, padding:'8px 18px', cursor:'pointer', flexShrink:0 }}>
                    OK
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Settlement */}
          <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:T.muted, marginBottom:12 }}>Settlement</div>

          {adjustedTx.length === 0 && (
            <div style={{ padding:'12px 14px', background:T.surface, border:`1px solid ${T.border}`, borderRadius:2, fontSize:12, color:T.muted, textAlign:'center', marginBottom:20 }}>
              {transactions.length === 0 ? 'All settled up!' : 'All payments recorded!'}
            </div>
          )}

          {adjustedTx.map((t, idx) => {
            const txKey = `${t.from.name}-${t.to.name}`;
            const settled = t.remaining < 0.01;
            return (
              <div key={idx} style={{ background:T.surface, border:`1px solid ${settled ? T.border : T.border}`, borderRadius:2, marginBottom:10, overflow:'hidden', opacity: settled ? 0.6 : 1 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 14px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:13, fontWeight:700, color:t.from.color }}>{t.from.name}</span>
                    <span style={{ fontSize:10, color:T.muted }}>owes</span>
                    <span style={{ fontSize:13, fontWeight:700, color:t.to.color }}>{t.to.name}</span>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    {t.paid > 0 && <div style={{ fontSize:10, color:T.accent }}>paid ${t.paid.toFixed(2)}</div>}
                    <div style={{ fontSize:20, fontWeight:800, color: settled ? T.muted : T.text, textDecoration: settled ? 'line-through' : 'none' }}>${t.remaining.toFixed(2)}</div>
                  </div>
                </div>


                {settled && (
                  <div style={{ borderTop:`1px solid ${T.border2}`, padding:'8px 14px', display:'flex', alignItems:'center', gap:6 }}>
                    <i className="ti ti-check" style={{ fontSize:13, color:T.accent }}/>
                    <span style={{ fontSize:11, color:T.accent }}>Settled</span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Payment history */}
          {groupPayments.length > 0 && (
            <div style={{ marginTop:24 }}>
              <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:T.muted, marginBottom:12 }}>Payment History</div>
              {groupPayments.map((p, idx) => (
                <div key={idx} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 14px', background:T.surface, border:`1px solid ${T.border}`, borderRadius:2, marginBottom:6 }}>
                  <div>
                    <div style={{ fontSize:12, color:T.text }}><span style={{ fontWeight:700 }}>{p.from}</span> paid <span style={{ fontWeight:700 }}>{p.to}</span></div>
                    <div style={{ fontSize:10, color:T.muted, marginTop:2 }}>{p.date}</div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ fontSize:16, fontWeight:800, color:T.accent }}>${p.amount.toFixed(2)}</span>
                    <button onClick={() => deletePayment(group.id, idx)} style={{ background:'none', border:'none', color:T.muted, cursor:'pointer', fontSize:16, opacity:0.4 }}>×</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Split history */}
          <div style={{ marginTop:24 }}>
            <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:T.muted, marginBottom:12 }}>Split History</div>
            {groupSplits.length === 0 && <div style={{ fontSize:12, color:T.muted }}>No splits yet</div>}
            {groupSplits.map(s => {
              const isExpanded = expandedGroupSplit === s.id;
              // Compute settlement for this split
              const splitBalances = {};
              s.people.forEach(p => { splitBalances[p.id] = -(s.finals[p.id] || 0); });
              if (s.paidBy) splitBalances[s.paidBy] = (splitBalances[s.paidBy] || 0) + s.grandTotal;
              const splitDebtors = s.people.filter(p => splitBalances[p.id] < -0.01).map(p => ({ ...p, amount: splitBalances[p.id] }));
              const splitCreditors = s.people.filter(p => splitBalances[p.id] > 0.01).map(p => ({ ...p, amount: splitBalances[p.id] }));
              const splitTx = [];
              let si = 0, sj = 0;
              const sd = splitDebtors.map(x=>({...x})), sc = splitCreditors.map(x=>({...x}));
              while (si < sd.length && sj < sc.length) {
                const amt = Math.min(-sd[si].amount, sc[sj].amount);
                if (amt > 0.01) splitTx.push({ from: sd[si], to: sc[sj], amount: amt });
                sd[si].amount += amt; sc[sj].amount -= amt;
                if (Math.abs(sd[si].amount) < 0.01) si++;
                if (Math.abs(sc[sj].amount) < 0.01) sj++;
              }
              return (
                <div key={s.id} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:2, marginBottom:6, overflow:'hidden' }}>
                  <div onClick={() => setExpandedGroupSplit(isExpanded ? null : s.id)}
                    style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', cursor:'pointer' }}>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:T.text }}>{s.name}</div>
                      <div style={{ fontSize:10, color:T.muted, marginTop:2 }}>{s.date} · ${s.grandTotal.toFixed(2)}</div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <button onClick={e => { e.stopPropagation(); setActiveGroup(null); setPage('split'); setTimeout(()=>setShowSaved(true),50); }}
                        style={{ background:T.accent, color:T.accentText, border:'none', borderRadius:2, padding:'5px 12px', fontFamily:'"Urbanist",sans-serif', fontSize:10, fontWeight:700, cursor:'pointer' }}>
                        View
                      </button>
                      <i className={`ti ti-chevron-${isExpanded?'up':'down'}`} style={{ fontSize:14, color:T.muted }}/>
                    </div>
                  </div>
                  {isExpanded && (
                    <div style={{ borderTop:`1px solid ${T.border2}`, padding:'10px 14px' }}>
                      {/* Per person amounts */}
                      <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:T.muted, marginBottom:8 }}>Breakdown</div>
                      {s.people.map((p, pi) => (
                        <div key={p.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'4px 0', borderBottom:`1px solid ${T.border2}` }}>
                          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                            <span style={{ width:7, height:7, borderRadius:'50%', background:T.COLORS[pi%T.COLORS.length], flexShrink:0, display:'inline-block' }}/>
                            <span style={{ fontSize:12, color:T.text }}>{p.name}</span>
                            {s.paidBy === p.id && <span style={{ fontSize:9, color:T.accent, fontWeight:700 }}>paid</span>}
                          </div>
                          <span style={{ fontSize:13, fontWeight:700, color:T.text }}>${(s.finals[p.id]||0).toFixed(2)}</span>
                        </div>
                      ))}
                      {/* Settlement for this split */}
                      {splitTx.length > 0 && (
                        <>
                          <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:T.muted, margin:'10px 0 8px' }}>Who pays who</div>
                          {splitTx.map((t, idx) => (
                            <div key={idx} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'4px 0' }}>
                              <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12 }}>
                                <span style={{ fontWeight:700, color:T.COLORS[s.people.findIndex(p=>p.id===t.from.id)%T.COLORS.length] }}>{t.from.name}</span>
                                <span style={{ fontSize:10, color:T.muted }}>pays</span>
                                <span style={{ fontWeight:700, color:T.COLORS[s.people.findIndex(p=>p.id===t.to.id)%T.COLORS.length] }}>{t.to.name}</span>
                              </div>
                              <span style={{ fontSize:14, fontWeight:800, color:T.text }}>${t.amount.toFixed(2)}</span>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── HOME PAGE ──
  if (page === 'home') return (
    <div style={{ background:T.bg, minHeight:'100vh', color:T.text, fontFamily:'"Urbanist",sans-serif', transition:'background 0.2s' }}>
      {/* Header */}
      <div style={{ padding:'18px 20px', borderBottom:`1px solid ${T.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <div style={{ fontSize:20, fontWeight:800, letterSpacing:'0.06em' }}>SPLIT.IT</div>
          <div style={{ fontSize:10, color:T.muted, marginTop:2, letterSpacing:'0.2em' }}>GROUP ORDER CALCULATOR</div>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
        <button onClick={()=>setDark(d=>!d)}
          style={{ background:'none', border:`1px solid ${T.border}`, borderRadius:2, padding:'7px 10px', cursor:'pointer', color:T.muted, display:'flex', alignItems:'center' }}>
          {dark
            ? <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="2.5"/><line x1="7" y1="1" x2="7" y2="2.5"/><line x1="7" y1="11.5" x2="7" y2="13"/><line x1="1" y1="7" x2="2.5" y2="7"/><line x1="11.5" y1="7" x2="13" y2="7"/><line x1="2.93" y1="2.93" x2="3.99" y2="3.99"/><line x1="10.01" y1="10.01" x2="11.07" y2="11.07"/><line x1="11.07" y1="2.93" x2="10.01" y2="3.99"/><line x1="3.99" y1="10.01" x2="2.93" y2="11.07"/></svg>
            : <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M11.5 8.5A5 5 0 0 1 5.5 2.5a5 5 0 1 0 6 6z"/></svg>
          }
        </button>
        </div>
      </div>

      <div style={{ padding:'20px 20px 80px' }}>

        {/* New Split button */}
        <button onClick={() => { resetSplit(); setActiveGroup(null); setPage('split'); }}
          style={{ width:'100%', padding:'14px', background:T.accent, color:T.accentText, border:'none', borderRadius:2, fontFamily:'"Urbanist",sans-serif', fontSize:13, fontWeight:700, letterSpacing:'0.1em', cursor:'pointer', marginBottom:24, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
          <i className="ti ti-plus" style={{ fontSize:16 }} aria-hidden="true"/> NEW SPLIT
        </button>

        {/* Groups */}
        {savedGroups.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 20px', color:T.muted2 }}>
            <div style={{ fontSize:32, marginBottom:12 }}>
              <i className="ti ti-users" style={{ fontSize:40, color:T.muted }} aria-hidden="true"/>
            </div>
            <div style={{ fontSize:13, fontWeight:600, color:T.muted, marginBottom:6 }}>No groups yet</div>
            <div style={{ fontSize:11, color:T.muted2 }}>Create a split, add people, and save them as a group</div>
            <button onClick={() => { resetSplit(); setPage('split'); }}
              style={{ marginTop:16, padding:'9px 20px', background:'none', border:`1px solid ${T.ghostBorder}`, borderRadius:2, color:T.ghostText, fontFamily:'"Urbanist",sans-serif', fontSize:11, fontWeight:600, cursor:'pointer' }}>
              Start a split
            </button>
          </div>
        ) : (
          <div>
            <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:T.muted, marginBottom:14 }}>Your Groups</div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {savedGroups.map((group, gi) => {
                const { groupSplits, totalSpent, transactions } = getGroupStats(group);
                return (
                  <div key={group.id} onClick={() => setActiveGroup(group)} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:2, overflow:'hidden', cursor:'pointer' }}>
                    {/* Group header */}
                    <div style={{ padding:'12px 16px', borderBottom:`1px solid ${T.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div>
                        <div style={{ fontSize:14, fontWeight:700, color:T.text, marginBottom:5 }}>{group.name}</div>
                        <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                          {group.members.map((m,i) => (
                            <span key={m.id} style={{ padding:'2px 8px', borderRadius:100, border:`1px solid ${T.COLORS[i%T.COLORS.length]}44`, background:`${T.COLORS[i%T.COLORS.length]}11`, color:T.COLORS[i%T.COLORS.length], fontSize:10, fontWeight:500 }}>
                              {m.name}
                            </span>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* Settlement lines */}
                    <div style={{ padding:'10px 16px' }}>
                      {groupSplits.length === 0 && (
                        <div style={{ fontSize:11, color:T.muted2 }}>No splits yet</div>
                      )}
                      {groupSplits.length > 0 && transactions.length === 0 && (
                        <div style={{ fontSize:11, color:T.muted, display:'flex', alignItems:'center', gap:6 }}>
                          <i className="ti ti-check" style={{ fontSize:13, color:T.accent }} aria-hidden="true"/> All settled up · ${totalSpent.toFixed(2)} total
                        </div>
                      )}
                      {transactions.map((t,idx) => (
                        <div key={idx} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'5px 0', borderBottom:`1px solid ${T.border2}` }}>
                          <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, flexWrap:'wrap' }}>
                            <span style={{ fontWeight:700, color:t.from.color }}>{t.from.name}</span>
                            <span style={{ color:T.muted, fontSize:10 }}>owes</span>
                            <span style={{ fontWeight:700, color:t.to.color }}>{t.to.name}</span>
                          </div>
                          <span style={{ fontSize:16, fontWeight:800, color:T.text, flexShrink:0, marginLeft:8 }}>${t.amount.toFixed(2)}</span>
                        </div>
                      ))}
                      {/* Gets back summary */}
                      {transactions.length > 0 && (() => {
                        const credited = {};
                        transactions.forEach(t => { credited[t.to.name] = (credited[t.to.name]||0) + t.amount; });
                        return Object.entries(credited).map(([name, amt], idx) => {
                          const person = group.members.find(m => m.name === name);
                          const color = person ? T.COLORS[group.members.indexOf(person) % T.COLORS.length] : T.accent;
                          return (
                            <div key={`cr-${idx}`} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'5px 0', borderTop:`1px solid ${T.border}`, marginTop:4 }}>
                              <div style={{ fontSize:11, color:T.muted }}>
                                <span style={{ fontWeight:700, color }}>{name}</span> gets back
                              </div>
                              <span style={{ fontSize:14, fontWeight:800, color:T.accent }}>${amt.toFixed(2)}</span>
                            </div>
                          );
                        });
                      })()}
                    </div>


                  </div>
                );
              })}
            </div>


          </div>
        )}

      </div>

      {/* ── BOTTOM NAV HOME ── */}
      <div style={{ position:'fixed', bottom:0, left:0, right:0, background:T.surface, borderTop:`1px solid ${T.border}`, display:'flex', zIndex:100 }}>
        {[
          { icon:'home', label:'Home', active: true, action:() => {} },
          { icon:'plus', label:'New', action:() => { resetSplit(); setPage('split'); } },
          { icon:'bookmark', label:`Saved${savedSplits.length>0?' ('+savedSplits.length+')':''}`, action:() => { setPage('split'); setTimeout(()=>setShowSaved(true),50); } },
          { icon:'users', label:`Groups${savedGroups.length>0?' ('+savedGroups.length+')':''}`, action:() => { setPage('split'); setTimeout(()=>setShowGroups(true),50); } },
        ].map((item, i) => (
          <button key={i} onClick={item.action}
            style={{ flex:1, padding:'10px 4px 8px', background:'none', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:3, color: item.active ? T.accent : T.muted, transition:'color 0.15s' }}>
            <i className={`ti ti-${item.icon}`} style={{ fontSize:18 }} aria-hidden="true"/>
            <span style={{ fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', fontFamily:'"Urbanist",sans-serif' }}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ background:T.bg, minHeight:'100vh', color:T.text, fontFamily:'"Urbanist",sans-serif', transition:'background 0.2s', paddingBottom:60 }}>

      <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}}
        onChange={e => { if(e.target.files[0]){ scanReceipt(e.target.files[0]); e.target.value=''; } }} />

      {/* ── HEADER ── */}
      <div style={{ padding:'16px 20px', borderBottom:`1px solid ${T.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <div style={{ fontSize:20, fontWeight:800, letterSpacing:'0.06em' }}>SPLIT.IT</div>
          <div style={{ fontSize:10, color:T.muted, marginTop:2, letterSpacing:'0.2em' }}>GROUP ORDER CALCULATOR</div>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <button onClick={() => setPage('home')} style={{ background:'none', border:`1px solid ${T.border}`, borderRadius:2, padding:'7px 10px', cursor:'pointer', color:T.muted, display:'flex', alignItems:'center' }}>
            <i className="ti ti-home" style={{ fontSize:14 }} aria-hidden="true"/>
          </button>
          <button onClick={()=>setDark(d=>!d)}
            style={{ background:'none', border:`1px solid ${T.border}`, borderRadius:2, padding:'7px 10px', cursor:'pointer', color:T.muted, display:'flex', alignItems:'center' }}>
            {dark
              ? <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="7" cy="7" r="2.5"/>
                  <line x1="7" y1="1" x2="7" y2="2.5"/><line x1="7" y1="11.5" x2="7" y2="13"/>
                  <line x1="1" y1="7" x2="2.5" y2="7"/><line x1="11.5" y1="7" x2="13" y2="7"/>
                  <line x1="2.93" y1="2.93" x2="3.99" y2="3.99"/><line x1="10.01" y1="10.01" x2="11.07" y2="11.07"/>
                  <line x1="11.07" y1="2.93" x2="10.01" y2="3.99"/><line x1="3.99" y1="10.01" x2="2.93" y2="11.07"/>
                </svg>
              : <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M11.5 8.5A5 5 0 0 1 5.5 2.5a5 5 0 1 0 6 6z"/>
                </svg>
            }
          </button>
        </div>
      </div>

      {/* ── GROUPS PANEL ── */}
      {showGroups && (
        <div style={{ borderBottom:`1px solid ${T.border}`, padding:'16px 20px', background:T.surface2 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <SecLabel>Saved Groups</SecLabel>
            <div style={{ display:'flex', gap:6 }}>
              {hasPeople && (
                <button onClick={()=>{ setShowGroupInput(s=>!s); setShowNewGroup(false); }}
                  style={{ ...ghBtn({ padding:'5px 12px', fontSize:10 }), background:showGroupInput?T.accent:'none', color:showGroupInput?T.accentText:T.ghostText, border:`1px solid ${showGroupInput?T.accent:T.ghostBorder}` }}>
                  Save current
                </button>
              )}
              <button onClick={()=>{ setShowNewGroup(s=>!s); setShowGroupInput(false); }}
                style={{ ...ghBtn({ padding:'5px 12px', fontSize:10 }), background:showNewGroup?T.accent:'none', color:showNewGroup?T.accentText:T.ghostText, border:`1px solid ${showNewGroup?T.accent:T.ghostBorder}` }}>
                + New Group
              </button>
            </div>
          </div>

          {/* Save current people as group */}
          {showGroupInput && (
            <div style={{ display:'flex', gap:8, marginBottom:14 }}>
              <input style={{ ...solidInput({ flex:1 }) }} placeholder="Group name... (e.g. Weee! Crew)"
                value={groupName} onChange={e=>setGroupName(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&saveGroup()} autoFocus />
              <button onClick={saveGroup}
                style={{ background:T.accent, color:T.accentText, border:'none', borderRadius:2, padding:'8px 16px', fontFamily:'"Urbanist",sans-serif', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                Save
              </button>
              <button onClick={()=>setShowGroupInput(false)} style={ghBtn({ padding:'8px 12px' })}>Cancel</button>
            </div>
          )}

          {/* Create new group */}
          {showNewGroup && (
            <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:2, padding:'14px', marginBottom:14 }}>
              <input style={{ ...solidInput({ width:'100%', marginBottom:10 }) }} placeholder="Group name... (e.g. Weee! Crew)"
                value={newGroupName} onChange={e=>setNewGroupName(e.target.value)} />
              <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:10 }}>
                {newGroupMembers.map((m, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:4, padding:'3px 8px', borderRadius:100, border:`1px solid ${T.COLORS[i%T.COLORS.length]}44`, background:`${T.COLORS[i%T.COLORS.length]}11`, color:T.COLORS[i%T.COLORS.length], fontSize:11 }}>
                    {m}
                    <button onClick={() => setNewGroupMembers(p => p.filter((_,j) => j!==i))} style={{ background:'none', border:'none', color:'inherit', cursor:'pointer', fontSize:14, padding:0, opacity:0.6 }}>×</button>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', gap:8, marginBottom:10 }}>
                <input style={{ ...solidInput({ flex:1 }) }} placeholder="Add person..."
                  value={newGroupMember} onChange={e=>setNewGroupMember(e.target.value)}
                  onKeyDown={e=>{ if(e.key==='Enter' && newGroupMember.trim()){ setNewGroupMembers(p=>[...p, newGroupMember.trim()]); setNewGroupMember(''); } }} />
                <button onClick={()=>{ if(newGroupMember.trim()){ setNewGroupMembers(p=>[...p, newGroupMember.trim()]); setNewGroupMember(''); } }}
                  style={{ background:T.btnBg, color:T.btnText, border:'none', borderRadius:2, padding:'7px 14px', fontFamily:'"Urbanist",sans-serif', fontSize:13, fontWeight:700, cursor:'pointer' }}>+</button>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={createGroup}
                  style={{ flex:1, background:T.accent, color:T.accentText, border:'none', borderRadius:2, padding:'9px', fontFamily:'"Urbanist",sans-serif', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                  Create Group
                </button>
                <button onClick={()=>{ setShowNewGroup(false); setNewGroupName(''); setNewGroupMembers([]); }} style={ghBtn({ padding:'9px 14px' })}>Cancel</button>
              </div>
            </div>
          )}

          {/* Standalone Record Payment */}
          {savedGroups.length > 0 && (
            <div style={{ marginBottom:16, background:T.surface, border:`0.5px solid ${T.border}`, borderRadius:8, overflow:'hidden' }}>
              <div onClick={() => setPanelSettleGroup(panelSettleGroup ? null : 'open')}
                style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', cursor:'pointer' }}>
                <div style={{ fontSize:11, fontWeight:500, color:T.muted, letterSpacing:'0.12em', textTransform:'uppercase' }}>Record a Payment</div>
                <i className={`ti ti-chevron-${panelSettleGroup?'up':'down'}`} style={{ fontSize:14, color:T.muted }}/>
              </div>
              {panelSettleGroup && (
                <div style={{ borderTop:`0.5px solid ${T.border}`, padding:'14px 16px' }}>
                  {/* Group selector */}
                  <select value={panelSettleGroup==='open'?'':panelSettleGroup}
                    onChange={e => { setPanelSettleGroup(e.target.value||'open'); setPanelSettleFrom(''); setPanelSettleTo(''); }}
                    style={{ width:'100%', background:T.inputBg, border:`0.5px solid ${T.border}`, color:T.muted, fontFamily:'"Urbanist",sans-serif', fontSize:13, padding:'8px 10px', borderRadius:8, outline:'none', cursor:'pointer', marginBottom:14, colorScheme: dark?'dark':'light' }}>
                    <option value="">Select group...</option>
                    {savedGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>

                  {/* Payment row */}
                  {panelSettleGroup && panelSettleGroup !== 'open' && (() => {
                    const g = savedGroups.find(x => x.id === parseInt(panelSettleGroup));
                    if (!g) return null;
                    const gPayments = (payments[g.id] || []);
                    return (
                      <div>
                        <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap', marginBottom:14 }}>
                          <select value={panelSettleFrom} onChange={e=>{ setPanelSettleFrom(e.target.value); setPanelSettleTo(''); }}
                            style={{ flex:1, minWidth:90, background: panelSettleFrom ? 'rgba(37,99,235,0.08)' : T.inputBg, border:`1.5px solid ${panelSettleFrom?'#2563eb':T.border}`, color:panelSettleFrom?'#2563eb':T.muted, fontFamily:'"Urbanist",sans-serif', fontSize:13, padding:'8px 10px', borderRadius:8, outline:'none', cursor:'pointer', colorScheme: dark?'dark':'light', transition:'all 0.15s' }}>
                            <option value="">Who paid?</option>
                            {g.members.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                          </select>
                          <span style={{ fontSize:12, color:T.muted, flexShrink:0 }}>paid</span>
                          <select value={panelSettleTo} onChange={e=>setPanelSettleTo(e.target.value)}
                            style={{ flex:1, minWidth:90, background: panelSettleTo ? 'rgba(53,241,160,0.08)' : T.inputBg, border:`1.5px solid ${panelSettleTo?'#35f1a0':T.border}`, color:panelSettleTo?'#35f1a0':T.muted, fontFamily:'"Urbanist",sans-serif', fontSize:13, padding:'8px 10px', borderRadius:8, outline:'none', cursor:'pointer', colorScheme: dark?'dark':'light', transition:'all 0.15s' }}>
                            <option value="">Who received?</option>
                            {g.members.filter(m=>m.name!==panelSettleFrom).map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                          </select>
                          <div style={{ display:'flex', alignItems:'center', gap:4, background:T.inputBg, border:`0.5px solid ${T.border}`, borderRadius:8, padding:'0 10px', flex:1, minWidth:80 }}>
                            <span style={{ fontSize:13, color:T.muted }}>$</span>
                            <input type="number" min="0" step="0.01" placeholder="0.00"
                              value={panelSettleAmount} onChange={e=>setPanelSettleAmount(e.target.value)}
                              onKeyDown={async e => {
                                if (e.key==='Enter' && panelSettleFrom && panelSettleTo && panelSettleAmount) {
                                  await recordPayment(parseInt(panelSettleGroup), panelSettleFrom, panelSettleTo, parseFloat(panelSettleAmount));
                                  setPanelSettleFrom(''); setPanelSettleTo(''); setPanelSettleAmount('');
                                }
                              }}
                              style={{ flex:1, background:'transparent', border:'none', color:T.text, fontFamily:'"Urbanist",sans-serif', fontSize:13, padding:'8px 0', outline:'none' }}/>
                          </div>
                          <button onClick={async () => {
                            if (!panelSettleFrom || !panelSettleTo || !panelSettleAmount) return;
                            await recordPayment(parseInt(panelSettleGroup), panelSettleFrom, panelSettleTo, parseFloat(panelSettleAmount));
                            setPanelSettleFrom(''); setPanelSettleTo(''); setPanelSettleAmount('');
                          }} style={{ background:'transparent', border:`1.5px solid #2563eb`, borderRadius:8, color:'#2563eb', fontFamily:'"Urbanist",sans-serif', fontSize:13, fontWeight:500, padding:'8px 18px', cursor:'pointer', flexShrink:0 }}>
                            OK
                          </button>
                        </div>
                        {/* Payment history */}
                        {gPayments.length > 0 && (
                          <div>
                            <div style={{ fontSize:11, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', color:T.muted, marginBottom:8 }}>Payment History</div>
                            {gPayments.map((p,idx) => (
                              <div key={idx} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 0', borderBottom: idx < gPayments.length-1 ? `0.5px solid ${T.border}` : 'none' }}>
                                <div>
                                  <div style={{ fontSize:13, color:T.text }}><span style={{ fontWeight:500 }}>{p.from}</span> paid <span style={{ fontWeight:500 }}>{p.to}</span></div>
                                  <div style={{ fontSize:12, color:T.muted, marginTop:2 }}>{p.date}</div>
                                </div>
                                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                  <span style={{ fontSize:14, fontWeight:500, color:'#2563eb' }}>${p.amount.toFixed(2)}</span>
                                  <button onClick={() => deletePayment(g.id, idx)} style={{ background:'none', border:'none', color:T.muted, cursor:'pointer', fontSize:16, opacity:0.5, padding:0 }}>×</button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {savedGroups.length === 0 ? (
            <div style={{ fontSize:12, color:T.muted, padding:'8px 0' }}>
              No saved groups yet. Add people above and save them as a group.
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {savedGroups.map(group => {
                const { groupSplits, totalSpent, transactions } = getGroupStats(group);
                return (
                  <div key={group.id} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:2, overflow:'hidden' }}>
                    {/* Header */}
                    <div style={{ padding:'12px 14px', borderBottom:`1px solid ${T.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div>
                        <div style={{ fontSize:13, fontWeight:600, color:T.text, marginBottom:5 }}>{group.name}</div>
                        <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                          {group.members.map((m,i) => (
                            <span key={m.id} style={{ padding:'2px 8px', borderRadius:100, border:`1px solid ${T.COLORS[i%T.COLORS.length]}44`, background:`${T.COLORS[i%T.COLORS.length]}11`, color:T.COLORS[i%T.COLORS.length], fontSize:10 }}>
                              {m.name}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div style={{ display:'flex', gap:6, alignItems:'center', marginLeft:12, flexShrink:0 }}>
                        <button onClick={()=>loadGroup(group)}
                          style={{ background:T.accent, color:T.accentText, border:'none', borderRadius:2, padding:'6px 14px', fontFamily:'"Urbanist",sans-serif', fontSize:10, fontWeight:700, cursor:'pointer' }}>
                          Load
                        </button>
                        <button onClick={()=>deleteGroup(group.id)}
                          style={{ background:'none', border:`1px solid ${T.removeBorder}`, color:T.removeText, borderRadius:2, padding:'6px 10px', cursor:'pointer', opacity:0.7 }}>
                          ×
                        </button>
                      </div>
                    </div>
                    {/* Settlement lines */}
                    <div style={{ padding:'8px 14px' }}>
                      {groupSplits.length === 0 && <div style={{ fontSize:11, color:T.muted2 }}>No splits yet</div>}
                      {groupSplits.length > 0 && transactions.length === 0 && (
                        <div style={{ fontSize:11, color:T.muted, display:'flex', alignItems:'center', gap:6 }}>
                          <i className="ti ti-check" style={{ fontSize:12, color:T.accent }}/> All settled up · ${totalSpent.toFixed(2)} total
                        </div>
                      )}
                      {transactions.map((t,idx) => (
                        <div key={idx} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'4px 0', borderBottom: idx < transactions.length-1 ? `1px solid ${T.border2}` : 'none' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12 }}>
                            <span style={{ fontWeight:700, color:t.from.color }}>{t.from.name}</span>
                            <span style={{ color:T.muted, fontSize:10 }}>owes</span>
                            <span style={{ fontWeight:700, color:t.to.color }}>{t.to.name}</span>
                          </div>
                          <span style={{ fontSize:14, fontWeight:800, color:T.text }}>${t.amount.toFixed(2)}</span>
                        </div>
                      ))}
                      {transactions.length > 0 && (() => {
                        const credited = {};
                        transactions.forEach(t => { credited[t.to.name] = (credited[t.to.name]||0) + t.amount; });
                        return Object.entries(credited).map(([name, amt], idx) => {
                          const mi = group.members.findIndex(m => m.name === name);
                          const color = mi >= 0 ? T.COLORS[mi % T.COLORS.length] : T.accent;
                          return (
                            <div key={`cr-${idx}`} style={{ display:'flex', justifyContent:'space-between', padding:'4px 0', borderTop:`1px solid ${T.border}`, marginTop:4 }}>
                              <div style={{ fontSize:11, color:T.muted }}><span style={{ fontWeight:700, color }}>{name}</span> gets back</div>
                              <span style={{ fontSize:13, fontWeight:800, color:T.accent }}>${amt.toFixed(2)}</span>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── SAVED SPLITS PANEL ── */}
      {showSaved && (
        <div style={{ borderBottom:`1px solid ${T.border}`, padding:'16px 20px', background:T.surface2 }}>
          <SecLabel>Saved Splits</SecLabel>
          {savedSplits.length === 0 ? (
            <div style={{ fontSize:12, color:T.muted, padding:'8px 0' }}>No saved splits yet.</div>
          ) : savedSplits.map(split => (
            <div key={split.id}>
              {renamingSplit === split.id ? (
                <div style={{ display:'flex', gap:8, marginBottom:6 }}>
                  <input autoFocus
                    style={{ ...solidInput({ flex:1 }) }}
                    value={renameVal}
                    onChange={e => setRenameVal(e.target.value)}
                    onKeyDown={e => { if(e.key==='Enter') renameSplit(split.id, renameVal); if(e.key==='Escape'){ setRenamingSplit(null); setRenameVal(''); } }}
                  />
                  <button onClick={() => renameSplit(split.id, renameVal)}
                    style={{ background:T.accent, color:T.accentText, border:'none', borderRadius:2, padding:'8px 14px', fontFamily:'"Urbanist",sans-serif', fontSize:10, fontWeight:700, cursor:'pointer' }}>
                    Save
                  </button>
                  <button onClick={() => { setRenamingSplit(null); setRenameVal(''); }} style={ghBtn({ padding:'8px 12px', fontSize:10 })}>Cancel</button>
                </div>
              ) : (
                <div className="saved-row"
                  style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 12px', borderRadius:2, border:`1px solid ${T.border}`, marginBottom:6, background:T.surface, cursor:'pointer', transition:'background 0.15s' }}
                  onClick={()=>setExpandedSplit(expandedSplit===split.id ? null : split.id)}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:T.text }}>{split.name}</div>
                    <div style={{ fontSize:10, color:T.muted, marginTop:2 }}>
                      {split.date} · {split.people.map(p=>p.name).join(', ')} · ${split.grandTotal.toFixed(2)}
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                    <button onClick={e=>{ e.stopPropagation(); loadSplit(split); }}
                      style={{ background:T.accent, color:T.accentText, border:'none', borderRadius:2, padding:'5px 12px', fontFamily:'"Urbanist",sans-serif', fontSize:10, fontWeight:700, cursor:'pointer' }}>
                      Load
                    </button>
                    <button onClick={e=>{ e.stopPropagation(); setRenamingSplit(split.id); setRenameVal(split.name); }}
                      style={{ background:'none', border:`1px solid ${T.ghostBorder}`, color:T.ghostText, borderRadius:2, padding:'5px 10px', fontSize:10, cursor:'pointer', fontFamily:'"Urbanist",sans-serif' }}
                      title="Rename">
                      <i className="ti ti-pencil" style={{ fontSize:12 }} aria-hidden="true"/>
                    </button>
                    <button onClick={e=>{ e.stopPropagation(); deleteSplit(split.id); }}
                      style={{ background:'none', border:`1px solid ${T.removeBorder}`, color:T.removeText, borderRadius:2, padding:'5px 10px', fontSize:10, cursor:'pointer', opacity:0.7 }}>
                      ×
                    </button>
                    <i className={`ti ti-chevron-${expandedSplit===split.id?'up':'down'}`} style={{ fontSize:14, color:T.muted }} aria-hidden="true"/>
                  </div>
                </div>
              )}
              {expandedSplit === split.id && (
                <div style={{ background:T.savedBg, border:`1px solid ${T.savedBorder}`, borderRadius:2, padding:'12px 14px', marginBottom:8, marginTop:-2 }}>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                    {split.people.map((p,i) => (
                      <div key={p.id} style={{ flex:'1 1 100px', background:T.surface, border:`1px solid ${T.border}`, borderRadius:2, padding:'10px 12px', borderLeft:`3px solid ${T.COLORS[i%T.COLORS.length]}` }}>
                        <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:T.COLORS[i%T.COLORS.length], marginBottom:4 }}>{p.name}</div>
                        <div style={{ fontSize:18, fontWeight:800, color:T.text }}>${(split.finals[p.id]||0).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', marginTop:10, fontSize:11, color:T.muted, paddingTop:10, borderTop:`1px solid ${T.border}` }}>
                    <span>Grand Total</span>
                    <span style={{ fontWeight:700, color:T.text }}>${split.grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── DASHBOARD ── */}
      {showDashboard && (
        <div style={{ borderBottom:`1px solid ${T.border}`, padding:'16px 20px', background:T.surface2 }}>
          <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:T.muted, marginBottom:14 }}>Group Dashboard</div>

          {savedGroups.length === 0 && (
            <div style={{ fontSize:12, color:T.muted, padding:'8px 0' }}>No saved groups yet. Create a group first.</div>
          )}

          {/* Group selector */}
          {savedGroups.length > 0 && (
            <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:16 }}>
              {savedGroups.map(g => (
                <button key={g.id} onClick={() => setDashGroup(dashGroup?.id === g.id ? null : g)}
                  style={{ padding:'5px 14px', background: dashGroup?.id===g.id ? T.accent : 'none', color: dashGroup?.id===g.id ? T.accentText : T.muted, border:`1px solid ${dashGroup?.id===g.id ? T.accent : T.ghostBorder}`, borderRadius:100, fontFamily:'"Urbanist",sans-serif', fontSize:11, fontWeight:600, cursor:'pointer', transition:'all 0.15s' }}>
                  {g.name}
                </button>
              ))}
            </div>
          )}

          {/* Dashboard content for selected group */}
          {dashGroup && (() => {
            const memberIds = dashGroup.members.map(m => m.id);
            const memberNames = {};
            dashGroup.members.forEach((m,i) => { memberNames[m.id] = { name:m.name, color:T.COLORS[i%T.COLORS.length] }; });

            // Find all splits that include ALL members of this group
            const groupSplits = savedSplits.filter(s =>
              dashGroup.members.every(m => s.people.some(p => p.name === m.name))
            );

            if (groupSplits.length === 0) return (
              <div style={{ fontSize:12, color:T.muted, padding:'8px 0' }}>No saved splits found for this group.</div>
            );

            // Aggregate balances across all splits
            const netBalances = {};
            dashGroup.members.forEach(m => { netBalances[m.name] = 0; });

            groupSplits.forEach(split => {
              if (!split.paidBy) return;
              const payer = split.people.find(p => p.id === split.paidBy);
              if (!payer) return;
              split.people.forEach(p => {
                if (p.id === split.paidBy) return;
                const owes = split.finals[p.id] || 0;
                if (netBalances[p.name] !== undefined) netBalances[p.name] -= owes;
                if (netBalances[payer.name] !== undefined) netBalances[payer.name] += owes;
              });
            });

            // Simplify debts
            const entries = dashGroup.members.map((m,i) => ({ name:m.name, color:T.COLORS[i%T.COLORS.length], amount:netBalances[m.name]||0 }));
            const debtors = entries.filter(e => e.amount < -0.01).map(e => ({...e}));
            const creditors = entries.filter(e => e.amount > 0.01).map(e => ({...e}));
            const transactions = [];
            let i = 0, j = 0;
            while (i < debtors.length && j < creditors.length) {
              const amount = Math.min(-debtors[i].amount, creditors[j].amount);
              if (amount > 0.01) transactions.push({ from:debtors[i], to:creditors[j], amount });
              debtors[i].amount += amount;
              creditors[j].amount -= amount;
              if (Math.abs(debtors[i].amount) < 0.01) i++;
              if (Math.abs(creditors[j].amount) < 0.01) j++;
            }

            const totalSpent = groupSplits.reduce((a,s) => a + (s.grandTotal||0), 0);

            return (
              <div>
                {/* Stats */}
                <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
                  <div style={{ flex:'1 1 100px', background:T.surface, border:`1px solid ${T.border}`, borderRadius:2, padding:'10px 14px' }}>
                    <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:T.muted, marginBottom:4 }}>Total Spent</div>
                    <div style={{ fontSize:20, fontWeight:800, color:T.text }}>${totalSpent.toFixed(2)}</div>
                  </div>
                  <div style={{ flex:'1 1 100px', background:T.surface, border:`1px solid ${T.border}`, borderRadius:2, padding:'10px 14px' }}>
                    <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:T.muted, marginBottom:4 }}>Splits</div>
                    <div style={{ fontSize:20, fontWeight:800, color:T.text }}>{groupSplits.length}</div>
                  </div>
                </div>

                {/* Settlements */}
                <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:T.muted, marginBottom:10 }}>Overall Settlement</div>
                {transactions.length === 0 ? (
                  <div style={{ padding:'10px 14px', background:T.surface, border:`1px solid ${T.border}`, borderRadius:2, fontSize:12, color:T.muted, textAlign:'center' }}>
                    All settled! {groupSplits.filter(s=>!s.paidBy).length > 0 ? `(${groupSplits.filter(s=>!s.paidBy).length} splits missing payer info)` : ''}
                  </div>
                ) : (
                  transactions.map((t,idx) => (
                    <div key={idx} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 14px', background:T.surface, border:`1px solid ${T.border}`, borderRadius:2, marginBottom:6 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontSize:13, fontWeight:700, color:t.from.color }}>{t.from.name}</span>
                        <span style={{ fontSize:10, color:T.muted }}>owes</span>
                        <span style={{ fontSize:13, fontWeight:700, color:t.to.color }}>{t.to.name}</span>
                      </div>
                      <span style={{ fontSize:20, fontWeight:800, color:T.text }}>${t.amount.toFixed(2)}</span>
                    </div>
                  ))
                )}

                {/* Split history */}
                <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:T.muted, margin:'16px 0 10px' }}>Split History</div>
                {groupSplits.map(s => (
                  <div key={s.id} style={{ padding:'10px 14px', background:T.surface, border:`1px solid ${T.border}`, borderRadius:2, marginBottom:6, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:T.text }}>{s.name}</div>
                      <div style={{ fontSize:10, color:T.muted, marginTop:2 }}>{s.date} · ${s.grandTotal.toFixed(2)}</div>
                    </div>
                    <button onClick={() => { loadSplit(s); setShowDashboard(false); }}
                      style={{ background:T.accent, color:T.accentText, border:'none', borderRadius:2, padding:'5px 12px', fontFamily:'"Urbanist",sans-serif', fontSize:10, fontWeight:700, cursor:'pointer' }}>
                      Load
                    </button>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* ── PEOPLE ── */}
      {!showSaved && !showGroups && <div style={{ padding:'14px 20px', borderBottom:`1px solid ${T.border}` }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          <SecLabel>People</SecLabel>
          {hasPeople && !showGroups && (
            <button onClick={()=>{ setShowGroups(true); setShowGroupInput(true); }}
              style={{ ...ghBtn({ padding:'4px 10px', fontSize:9, display:'flex', alignItems:'center', gap:4 }) }}>
              <i className="ti ti-device-floppy" style={{ fontSize:12 }} aria-hidden="true"/>
              Save as group
            </button>
          )}
        </div>

        {/* Group quick-load dropdown */}
        {savedGroups.length > 0 && (
          <div style={{ marginBottom:10 }}>
            <select onChange={e => { const g = savedGroups.find(g=>g.id===parseInt(e.target.value)); if(g) loadGroup(g); e.target.value=''; }}
              style={{ width:'100%', background:T.inputBg, border:`1px solid ${T.ghostBorder}`, color:T.muted, fontFamily:'"Urbanist",sans-serif', fontSize:12, padding:'8px 10px', borderRadius:2, outline:'none', cursor:'pointer', colorScheme: dark ? 'dark' : 'light' }}>
              <option value="">Load a group...</option>
              {savedGroups.map(group => (
                <option key={group.id} value={group.id}>{group.name} ({group.members.map(m=>m.name).join(', ')})</option>
              ))}
            </select>
          </div>
        )}

        <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
          <div style={{ position:'relative' }}>
            <input style={{ ...solidInput({ width:140 }) }} placeholder="Add person..."
              value={newName}
              onChange={e=>{ setNewName(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onKeyDown={e=>{ if(e.key==='Enter'){ addPerson(); setShowSuggestions(false); } }} />
            {showSuggestions && (() => {
              const allMembers = [...new Set(savedGroups.flatMap(g => g.members.map(m => m.name)))];
              const existing = new Set(people.map(p => p.name));
              const filtered = allMembers.filter(m => !existing.has(m) && (newName === '' || m.toLowerCase().includes(newName.toLowerCase())));
              if (!filtered.length) return null;
              return (
                <div style={{ position:'absolute', top:'calc(100% + 4px)', left:0, zIndex:999, background:T.inputBg, border:`1px solid ${T.accent}`, borderRadius:2, minWidth:160, overflow:'hidden' }}>
                  <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:T.muted, padding:'6px 12px 4px' }}>From your groups</div>
                  {filtered.map((name, i) => (
                    <div key={i}
                      onMouseDown={e => { e.preventDefault(); setPeople(p => [...p, { id:Date.now()+i, name, color:T.COLORS[p.length % T.COLORS.length] }]); setNewName(''); setShowSuggestions(false); }}
                      style={{ padding:'8px 12px', fontSize:12, color:T.text, cursor:'pointer', background:'transparent', borderTop:`1px solid ${T.border2}` }}>
                      {name}
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
          <button onClick={addPerson}
            style={{ background:T.btnBg, color:T.btnText, border:'none', borderRadius:2, padding:'7px 14px', fontFamily:'"Urbanist",sans-serif', fontSize:13, fontWeight:700, cursor:'pointer', lineHeight:1 }}>
            +
          </button>
          {people.map(p => (
            <div key={p.id} style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 10px 5px 8px', borderRadius:100, border:`1px solid ${p.color}44`, background:`${p.color}11`, color:p.color, fontSize:12, fontWeight:500 }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:p.color, flexShrink:0 }}/>
              {p.name}
              <button onClick={()=>removePerson(p.id)} style={{ background:'none', border:'none', color:p.color, cursor:'pointer', fontSize:15, lineHeight:1, padding:0, opacity:0.5, marginLeft:2 }}>×</button>
            </div>
          ))}
        </div>
      </div>}

      {/* ── DATE ── */}
      {!showSaved && !showGroups && <div style={{ padding:'12px 20px', borderBottom:`1px solid ${T.border}`, display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:T.muted, flexShrink:0 }}>Date</div>
        <input type="date" value={orderDate} onChange={e=>setOrderDate(e.target.value)}
          style={{ background:'none', border:'none', color: orderDate ? T.text : T.muted, fontFamily:'"Urbanist",sans-serif', fontSize:12, outline:'none', cursor:'pointer', padding:'2px 0', colorScheme: dark ? 'dark' : 'light' }} />
        {orderDate && (
          <span style={{ fontSize:10, color:T.muted }}>
            {new Date(orderDate+'T00:00:00').toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'})}
          </span>
        )}
        {orderDate && (
          <button onClick={()=>setOrderDate('')} style={{ background:'none', border:'none', color:T.muted, cursor:'pointer', fontSize:14, lineHeight:1, padding:0, opacity:0.5, marginLeft:'auto' }}>×</button>
        )}
      </div>}

      {/* ── BILL ── */}
      <div style={{ padding:'0 20px' }}>

        {!hasItems && !showSaved && !showGroups && (
          <>
            <div onClick={()=>!scanning&&fileRef.current.click()}
              style={{ border:`1px dashed ${scanning?T.accent:T.border}`, borderRadius:2, padding:'40px 20px', textAlign:'center', cursor:scanning?'default':'pointer', margin:'20px 0', transition:'border-color 0.2s' }}>
              <div style={{ fontSize:11, color:scanning?T.accent:T.muted, letterSpacing:'0.16em', marginBottom:5 }}>
                {scanning ? 'SCANNING...' : 'UPLOAD BILL / RECEIPT'}
              </div>
              <div style={{ fontSize:10, color:T.muted2 }}>
                {scanning ? 'Extracting line items...' : 'Auto-detects items · or add manually below'}
              </div>
            </div>
            {addingItem ? (
              <div style={{ display:'flex', gap:8, marginBottom:16 }}>
                <input style={{ ...solidInput({ flex:2 }) }} placeholder="Item name..." value={newItem.name}
                  onChange={e=>setNewItem(p=>({...p,name:e.target.value}))} autoFocus onKeyDown={e=>e.key==='Enter'&&addItemManually()} />
                <input type="number" style={{ ...solidInput({ width:60 }) }} placeholder="Qty" value={newItem.qty} onChange={e=>setNewItem(p=>({...p,qty:e.target.value}))} />
                <input type="number" style={{ ...solidInput({ width:90 }) }} placeholder="$0.00" value={newItem.price} onChange={e=>setNewItem(p=>({...p,price:e.target.value}))} step="0.01" />
                <button onClick={addItemManually} style={{ background:T.btnBg, color:T.btnText, border:'none', borderRadius:2, padding:'8px 14px', fontFamily:'"Urbanist",sans-serif', fontSize:11, fontWeight:700, cursor:'pointer' }}>Add</button>
                <button onClick={()=>setAddingItem(false)} style={ghBtn()}>Cancel</button>
              </div>
            ) : (
              <button onClick={()=>setAddingItem(true)} style={{ background:'none', border:`1px solid ${T.accent}`, borderRadius:2, padding:'9px 18px', color:T.accent, fontFamily:'"Urbanist",sans-serif', fontSize:12, fontWeight:600, cursor:'pointer', marginBottom:16, letterSpacing:'0.06em' }}>+ Add item manually</button>
            )}
          </>
        )}


        {hasItems && (
          <div style={{ marginTop:20 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 52px 90px 1fr', gap:8, padding:'0 6px 8px', borderBottom:`1px solid ${T.border}` }}>
              {['Item','Qty','Price','Who ordered?'].map((h,i) => (
                <div key={i} style={{ fontSize:9, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:T.muted }}>{h}</div>
              ))}
            </div>

            {items.map(item => {
              const warn = hasPeople && Object.keys(item.assignedTo).length === 0;
              return (
                <div key={item.id} className="item-row"
                  style={{ display:'grid', gridTemplateColumns:'1fr 52px 90px 1fr', gap:8, padding:'8px 6px', borderBottom:`1px solid ${T.border2}`, alignItems:'center', borderLeft:`2px solid ${warn?T.warnText+'55':'transparent'}`, transition:'background 0.15s' }}>
                  <input value={item.name} onChange={e=>updateItem(item.id,'name',e.target.value)} style={inp()} onFocus={focusBorder} onBlur={blurBorder}/>
                  <input type="number" min="1" value={item.qty} onChange={e=>updateItem(item.id,'qty',parseInt(e.target.value)||1)} style={inp({textAlign:'center'})} onFocus={focusBorder} onBlur={blurBorder}/>
                  <div style={{ display:'flex', alignItems:'center', gap:2 }}>
                    <span style={{ fontSize:11, color:T.muted, flexShrink:0 }}>$</span>
                    <input type="number" min="0" step="0.01" value={item.price} onChange={e=>updateItem(item.id,'price',parseFloat(e.target.value)||0)} style={inp()} onFocus={focusBorder} onBlur={blurBorder}/>
                  </div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:4, alignItems:'center' }}>
                    {people.map(p => {
                      const assignedQty = item.assignedTo[p.id] || 0;
                      const checked = assignedQty > 0;
                      const multiQty = parseInt(item.qty) > 1;
                      return multiQty ? (
                        <div key={p.id} style={{ display:'flex', alignItems:'center', gap:0, borderRadius:100, border:`1px solid ${checked?p.color:p.color+'33'}`, background:checked?p.color+'1a':'transparent', overflow:'hidden', opacity:checked?1:0.35, transition:'all 0.15s' }}>
                          <button onClick={()=>setPersonQty(item.id,p.id,assignedQty-1)}
                            style={{ background:'none', border:'none', color:p.color, cursor:'pointer', padding:'3px 7px', fontSize:12, fontWeight:700, lineHeight:1, fontFamily:'"Urbanist",sans-serif' }}>−</button>
                          <span style={{ fontSize:10, color:p.color, minWidth:14, textAlign:'center', fontWeight:600 }}
                            onClick={()=>!checked&&setPersonQty(item.id,p.id,1)}>
                            {checked ? `${p.name} ×${assignedQty}` : p.name}
                          </span>
                          <button onClick={()=>setPersonQty(item.id,p.id,assignedQty+1)}
                            style={{ background:'none', border:'none', color:p.color, cursor:'pointer', padding:'3px 7px', fontSize:12, fontWeight:700, lineHeight:1, fontFamily:'"Urbanist",sans-serif' }}>+</button>
                        </div>
                      ) : (
                        <div key={p.id} className="chip" onClick={()=>toggleAssign(item.id,p.id)}
                          style={{ display:'flex', alignItems:'center', gap:3, padding:'3px 8px', borderRadius:100, border:`1px solid ${checked?p.color:p.color+'33'}`, background:checked?p.color+'1a':'transparent', color:p.color, fontSize:10, cursor:'pointer', userSelect:'none', opacity:checked?1:0.3, transition:'all 0.15s', whiteSpace:'nowrap' }}>
                          {checked?'–':'+'} {p.name}
                        </div>
                      );
                    })}
                    <button onClick={()=>removeItem(item.id)} style={{ background:'none', border:'none', color:T.muted, cursor:'pointer', fontSize:16, lineHeight:1, padding:'0 2px', opacity:0.35, marginLeft:2 }}>×</button>
                  </div>
                </div>
              );
            })}

            {/* Discount */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 52px 90px 1fr', gap:8, padding:'10px 6px', borderBottom:`1px solid ${T.border}`, alignItems:'center', borderLeft:'2px solid transparent' }}>
              <div style={{ fontSize:11, color:T.discountC, fontWeight:600 }}>Discount</div>
              <div/>
              <div style={{ display:'flex', alignItems:'center', gap:2 }}>
                <span style={{ fontSize:11, color:T.discountC, flexShrink:0 }}>−$</span>
                <input type="number" min="0" step="0.01" value={discount.amount}
                  onChange={e=>setDiscount(p=>({...p,amount:e.target.value}))} placeholder="0.00"
                  style={{ ...inp(), color:T.discountC }} onFocus={focusBorder} onBlur={blurBorder}/>
              </div>
              <div style={{ display:'flex', gap:4 }}>
                {['equal','prop'].map(m => {
                  const active = discount.method===(m==='equal'?'equal':'proportional');
                  return (
                    <button key={m} onClick={()=>setDiscount(p=>({...p,method:m==='equal'?'equal':'proportional'}))}
                      style={{ padding:'3px 8px', background:active?T.accent:'none', color:active?T.accentText:T.muted, border:`1px solid ${active?T.accent:T.ghostBorder}`, borderRadius:2, fontFamily:'"Urbanist",sans-serif', fontSize:9, fontWeight:700, letterSpacing:'0.08em', cursor:'pointer', textTransform:'uppercase', transition:'all 0.15s' }}>
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Grand Total row */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 6px', borderBottom:`1px solid ${T.border}` }}>
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:T.muted }}>Grand Total</div>
              <div style={{ fontSize:22, fontWeight:800, color:T.text }}>${(() => {
                const total = items.reduce((sum, item) => sum + parseFloat(item.price||0) * (parseInt(item.qty)||1), 0);
                const disc = parseFloat(discount.amount) || 0;
                return Math.max(0, total - disc).toFixed(2);
              })()}</div>
            </div>

            {/* Add / upload more */}
            <div style={{ display:'flex', gap:8, padding:'12px 0' }}>
              {addingItem ? (
                <>
                  <input style={{ ...solidInput({ flex:2 }) }} placeholder="Item name..." value={newItem.name}
                    onChange={e=>setNewItem(p=>({...p,name:e.target.value}))} autoFocus onKeyDown={e=>e.key==='Enter'&&addItemManually()} />
                  <input type="number" style={{ ...solidInput({ width:60 }) }} placeholder="Qty" value={newItem.qty} onChange={e=>setNewItem(p=>({...p,qty:e.target.value}))} />
                  <input type="number" style={{ ...solidInput({ width:90 }) }} placeholder="$0.00" value={newItem.price} onChange={e=>setNewItem(p=>({...p,price:e.target.value}))} step="0.01" />
                  <button onClick={addItemManually} style={{ background:T.btnBg, color:T.btnText, border:'none', borderRadius:2, padding:'7px 14px', fontFamily:'"Urbanist",sans-serif', fontSize:11, fontWeight:700, cursor:'pointer' }}>Add</button>
                  <button onClick={()=>setAddingItem(false)} style={ghBtn()}>Cancel</button>
                </>
              ) : (
                <>
                  <button onClick={()=>setAddingItem(true)} style={ghBtn()}>+ Add item</button>
                  <button onClick={()=>fileRef.current.click()} style={ghBtn()}>+ Upload more</button>
                </>
              )}
            </div>
          </div>
        )}

        {hasItems && hasPeople && unassigned > 0 && (
          <div style={{ padding:'8px 12px', background:T.warnBg, border:`1px solid ${T.warnBorder}`, borderRadius:2, fontSize:11, color:T.warnText, marginTop:4, marginBottom:16 }}>
            {unassigned} item{unassigned>1?'s':''} not yet assigned
          </div>
        )}

        {/* ── TOTALS ── */}
        {hasItems && hasPeople && (
          <div style={{ marginTop:8, paddingTop:20, borderTop:`1px solid ${T.border}` }}>
            <div>


            {/* Paid by */}
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14, padding:'10px 14px', background:T.surface, border:`1px solid ${T.border}`, borderRadius:2 }}>
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:T.muted, flexShrink:0 }}>Paid by</div>
              <select value={paidBy} onChange={e => setPaidBy(e.target.value)}
                style={{ flex:1, background:T.inputBg, border:`1px solid ${paidBy ? people.find(p=>p.id===parseInt(paidBy)||p.id===paidBy)?.color || T.border : T.ghostBorder}`, color: paidBy ? people.find(p=>p.id===parseInt(paidBy)||p.id===paidBy)?.color || '#93c5fd' : T.muted, fontFamily:'"Urbanist",sans-serif', fontSize:12, padding:'7px 10px', borderRadius:6, outline:'none', cursor:'pointer', transition:'border-color 0.15s', colorScheme: dark ? 'dark' : 'light' }}>
                <option value="">Select person...</option>
                {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            {splitView === 'breakdown' && (
              <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:14 }}>
              {people.map(p => {
                const myItems = items.filter(i => (i.assignedTo[p.id]||0) > 0);
                const sub = subtotals[p.id] || 0;
                const disc = discounts[p.id] || 0;
                const final = finals[p.id] || 0;
                return (
                  <div key={p.id} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:2, borderLeft:`3px solid ${p.color}`, overflow:'hidden' }}>
                    {/* Person header */}
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 14px 10px' }}>
                      <div>
                        <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:p.color }}>{p.name}</div>
                        {paidBy && paidBy !== p.id && people.find(x => x.id === paidBy) && (
                          <div style={{ fontSize:10, color:T.muted, marginTop:2 }}>
                            owes {people.find(x => x.id === paidBy).name}
                          </div>
                        )}
                        {paidBy === p.id && (
                          <div style={{ fontSize:10, color:T.accent, marginTop:2 }}>paid the bill</div>
                        )}
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <div style={{ fontSize:22, fontWeight:800, color:T.text }}>${final.toFixed(2)}</div>
                        {paidBy === p.id && grandTotal > 0 && (
                          <div style={{ fontSize:10, color:T.accent, marginTop:2 }}>gets back ${(grandTotal - final).toFixed(2)}</div>
                        )}
                      </div>
                    </div>
                    {/* Item rows */}
                    {myItems.length > 0 && (
                      <div style={{ borderTop:`1px solid ${T.border2}`, padding:'8px 14px 4px' }}>
                        {myItems.map(item => {
                          const qty = item.assignedTo[p.id];
                          const lineTotal = parseFloat(item.price) * qty;
                          const totalQty = parseInt(item.qty) || 1;
                          const isShared = Object.keys(item.assignedTo).length > 1;
                          return (
                            <div key={item.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', padding:'4px 0', borderBottom:`1px solid ${T.border2}` }}>
                              <div style={{ display:'flex', alignItems:'baseline', gap:6 }}>
                                <span style={{ fontSize:11, color:T.text }}>{item.name}</span>
                                {(qty > 1 || isShared) && (
                                  <span style={{ fontSize:9, color:T.muted, letterSpacing:'0.06em' }}>
                                    ×{qty}{isShared ? ` of ${totalQty}` : ''}
                                  </span>
                                )}
                              </div>
                              <span style={{ fontSize:11, color:T.text, fontWeight:500 }}>${lineTotal.toFixed(2)}</span>
                            </div>
                          );
                        })}
                        {/* Subtotal */}
                        <div style={{ display:'flex', justifyContent:'space-between', padding:'6px 0 2px', fontSize:10, color:T.muted }}>
                          <span>Subtotal</span>
                          <span>${sub.toFixed(2)}</span>
                        </div>
                        {/* Discount */}
                        {disc > 0 && (
                          <div style={{ display:'flex', justifyContent:'space-between', padding:'2px 0 6px', fontSize:10, color:T.discountC }}>
                            <span>Discount ({discount.method})</span>
                            <span>−${disc.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              </div>
            )}
            {splitView === 'settle' && (() => {
              // Calculate net balances
              const balances = {};
              people.forEach(p => { balances[p.id] = -(finals[p.id] || 0); });
              if (paidBy) { const pid = typeof paidBy === 'string' ? parseInt(paidBy) || paidBy : paidBy; balances[pid] = (balances[pid] || 0) + grandTotal; }

              // Simplify debts
              const transactions = [];
              const debtors = people.filter(p => balances[p.id] < -0.01).map(p => ({ id:p.id, name:p.name, color:p.color, amount: balances[p.id] }));
              const creditors = people.filter(p => balances[p.id] > 0.01).map(p => ({ id:p.id, name:p.name, color:p.color, amount: balances[p.id] }));

              let i = 0, j = 0;
              const d = debtors.map(x => ({...x}));
              const c = creditors.map(x => ({...x}));
              while (i < d.length && j < c.length) {
                const amount = Math.min(-d[i].amount, c[j].amount);
                if (amount > 0.01) {
                  transactions.push({ from: d[i], to: c[j], amount });
                }
                d[i].amount += amount;
                c[j].amount -= amount;
                if (Math.abs(d[i].amount) < 0.01) i++;
                if (Math.abs(c[j].amount) < 0.01) j++;
              }

              return (
                <div style={{ marginBottom:14 }}>
                  {!paidBy && (
                    <div style={{ padding:'10px 14px', background:T.warnBg, border:`1px solid ${T.warnBorder}`, borderRadius:2, fontSize:11, color:T.warnText, marginBottom:12 }}>
                      Select who paid above to see settlement
                    </div>
                  )}
                  {paidBy && transactions.length === 0 && (
                    <div style={{ padding:'10px 14px', background:T.surface, border:`1px solid ${T.border}`, borderRadius:2, fontSize:11, color:T.muted, textAlign:'center' }}>
                      All settled!
                    </div>
                  )}
                  {transactions.map((t, idx) => (
                    <div key={idx} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 14px', background:T.surface, border:`1px solid ${T.border}`, borderRadius:2, marginBottom:6 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontSize:12, fontWeight:600, color:t.from.color }}>{t.from.name}</span>
                        <span style={{ fontSize:10, color:T.muted }}>pays</span>
                        <span style={{ fontSize:12, fontWeight:600, color:t.to.color }}>{t.to.name}</span>
                      </div>
                      <span style={{ fontSize:18, fontWeight:800, color:T.text }}>${t.amount.toFixed(2)}</span>
                    </div>
                  ))}
                  <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 14px', border:`1px solid ${T.border}`, borderRadius:2, marginTop:8 }}>
                    <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:T.muted }}>Grand Total</div>
                    <div style={{ fontSize:18, fontWeight:800 }}>${grandTotal.toFixed(2)}</div>
                  </div>
                </div>
              );
            })()}

            {showSaveInput && (
              <div style={{ display:'flex', gap:8, marginBottom:10 }}>
                <input style={{ ...solidInput({ flex:1 }) }} placeholder="Name this split... (e.g. Weee! May 22)"
                  value={savingName} onChange={e=>setSavingName(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&saveSplit()} autoFocus />
                <button onClick={saveSplit}
                  style={{ background:T.accent, color:T.accentText, border:'none', borderRadius:2, padding:'8px 16px', fontFamily:'"Urbanist",sans-serif', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                  Save
                </button>
                <button onClick={()=>setShowSaveInput(false)} style={ghBtn({ padding:'8px 12px' })}>Cancel</button>
              </div>
            )}

            {activeSplitId && (
              <button onClick={updateSplit}
                style={{ width:'100%', padding:13, background: updateStatus==='saved' ? T.accent : 'none', color: updateStatus==='saved' ? T.accentText : T.ghostText, border:`1px solid ${updateStatus==='saved' ? T.accent : T.ghostBorder}`, borderRadius:2, fontFamily:'"Urbanist",sans-serif', fontSize:12, fontWeight:700, letterSpacing:'0.1em', cursor:'pointer', marginBottom:8, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                <i className={`ti ti-${updateStatus==='saved'?'check':'device-floppy'}`} style={{ fontSize:14 }} aria-hidden="true"/>
                {updateStatus==='saved' ? 'UPDATED!' : 'UPDATE SAVED SPLIT'}
              </button>
            )}

            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={exportSplit}
                style={{ flex:1, padding:13, background:T.accent, color:T.accentText, border:'none', borderRadius:2, fontFamily:'"Urbanist",sans-serif', fontSize:12, fontWeight:700, letterSpacing:'0.1em', cursor:'pointer' }}>
                {copied ? '— COPIED' : 'COPY SPLIT ↗'}
              </button>
              <button onClick={()=>{ setShowSaveInput(s=>!s); setSaveStatus(''); }}
                style={{ ...ghBtn({ padding:'13px 18px', display:'flex', alignItems:'center', gap:6 }), background:saveStatus==='saved'?T.accent:'none', color:saveStatus==='saved'?T.accentText:T.ghostText, border:`1px solid ${saveStatus==='saved'?T.accent:T.ghostBorder}` }}>
                <i className={`ti ti-${saveStatus==='saved'?'check':'bookmark'}`} style={{ fontSize:14 }} aria-hidden="true"/>
                {saveStatus==='saved' ? 'Saved!' : 'Save'}
              </button>

            </div>
          </div>
        )}
      </div>

      {/* ── BOTTOM NAV ── */}
      <div style={{ position:'fixed', bottom:0, left:0, right:0, background:T.surface, borderTop:`1px solid ${T.border}`, display:'flex', zIndex:100 }}>
        {[
          { icon:'home', label:'Home', action:() => setPage('home') },
          { icon:'plus', label:'New', action:() => { resetSplit(); setShowSaved(false); setShowGroups(false); setShowDashboard(false); } },
          { icon:'bookmark', label:`Saved${savedSplits.length>0?' ('+savedSplits.length+')':''}`, action:() => { setShowSaved(s=>!s); setShowGroups(false); setShowDashboard(false); }, active: showSaved },
          { icon:'users', label:`Groups${savedGroups.length>0?' ('+savedGroups.length+')':''}`, action:() => { setShowGroups(s=>!s); setShowSaved(false); setShowDashboard(false); }, active: showGroups },
        ].map((item, i) => (
          <button key={i} onClick={item.action}
            style={{ flex:1, padding:'10px 4px 8px', background:'none', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:3, color: item.active ? T.accent : T.muted, transition:'color 0.15s' }}>
            <i className={`ti ti-${item.icon}`} style={{ fontSize:18 }} aria-hidden="true"/>
            <span style={{ fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', fontFamily:'"Urbanist",sans-serif' }}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}