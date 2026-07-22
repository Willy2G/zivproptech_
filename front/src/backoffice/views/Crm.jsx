import { useEffect, useMemo, useState } from 'react';
import { Loader2, Mail, Search, Trash2, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, MessageSquare, Settings, Send, Plus, CheckCircle, XCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import SoftwareBadge from '../components/ui/SoftwareBadge.jsx';
import Modal from '../../components/modals/Modal.jsx';
import { Field, TextInput, TextArea, SaveButton, Select } from '../components/ui/FormControls.jsx';
import { leadStatuses } from '../data/mockLeads.js';
import { fetchLeads, updateLeadStatus as apiUpdateStatus, deleteLead as apiDeleteLead, createLead, updateLead } from '../../services/api.js';
import { useToast } from '../context/ToastContext.jsx';

const SELECT_STYLE = {
  new: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  in_progress: 'bg-blue-50 border-blue-200 text-blue-800',
  closed: 'bg-gray-50 border-gray-200 text-gray-800',
  completed: 'bg-green-50 border-green-200 text-green-800',
  postponed: 'bg-orange-50 border-orange-200 text-orange-800',
};

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function Crm() {
  const { showToast } = useToast();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [msgModal, setMsgModal] = useState({ open: false, type: 'sms', recipient: '', subject: '', content: '' });
  const [leadModal, setLeadModal] = useState({ open: false, isEditing: false, id: null, full_name: '', email: '', phone: '', software_interest: 'suit_foncier', status: 'new' });

  const openMsgModal = (type, recipient = '') => {
    setMsgModal({ open: true, type, recipient, subject: '', content: '' });
  };

  const closeMsgModal = () => setMsgModal(m => ({ ...m, open: false }));

  const handleSendMsg = (e) => {
    e.preventDefault();
    // Simulation d'envoi
    setTimeout(() => {
      showToast(`${msgModal.type === 'sms' ? 'SMS' : 'Email'} envoyé avec succès.`);
      closeMsgModal();
    }, 1000);
  };

  useEffect(() => {
    fetchLeads()
      .then(setLeads)
      .catch(() => showToast('Impossible de charger les leads.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <ChevronUp className="h-3 w-3 opacity-20" />;
    return sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;
  };

  const processed = useMemo(() => {
    let data = [...leads];
    const q = search.trim().toLowerCase();
    if (q) data = data.filter(l => [l.full_name, l.email, l.phone].filter(Boolean).some(v => v.toLowerCase().includes(q)));
    data.sort((a, b) => {
      const va = a[sortKey] || '';
      const vb = b[sortKey] || '';
      return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
    return data;
  }, [leads, search, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(processed.length / perPage));
  const paginated = processed.slice((page - 1) * perPage, page * perPage);

  const handleStatus = async (lead, status) => {
    let newMessage = lead.message;
    if (status === 'postponed' && lead.software_interest === 'Rendez-vous') {
      const { value: newDate } = await Swal.fire({
        title: 'Reporter le rendez-vous',
        input: 'text',
        inputLabel: 'Veuillez saisir la nouvelle date et heure (ex: Mardi 15h)',
        inputPlaceholder: 'Entrez la date...',
        showCancelButton: true,
        confirmButtonText: 'Valider',
        cancelButtonText: 'Annuler',
        confirmButtonColor: '#00A8B5',
      });
      
      if (!newDate) return;

      newMessage = (lead.message ? lead.message + '\n\n' : '') + `[Reporté] Nouvelle date : ${newDate}`;
    }

    const payload = { ...lead, status, message: newMessage };
    setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status, message: newMessage } : l));
    
    try { 
      if (status === 'postponed') {
        await updateLead(lead.id, payload);
      } else {
        await apiUpdateStatus(lead.id, status); 
      }
      showToast('Statut mis à jour.'); 
    }
    catch { showToast('Erreur de mise à jour.'); }
  };

  const handleDelete = async (lead) => {
    const result = await Swal.fire({
      title: 'Confirmer la suppression',
      text: `Voulez-vous vraiment supprimer « ${lead.full_name} » ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    });

    if (!result.isConfirmed) return;

    setLeads(prev => prev.filter(l => l.id !== lead.id));
    try { await apiDeleteLead(lead.id); showToast('Lead supprimé.'); }
    catch { showToast('Erreur de suppression.'); }
  };

  const handleSaveLead = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        full_name: leadModal.full_name,
        email: leadModal.email,
        phone: leadModal.phone,
        software_interest: leadModal.software_interest,
        status: leadModal.status
      };
      
      if (leadModal.isEditing) {
        await updateLead(leadModal.id, payload);
        setLeads(prev => prev.map(l => l.id === leadModal.id ? { ...l, ...payload } : l));
        showToast('Lead mis à jour.');
      } else {
        const res = await createLead(payload);
        setLeads(prev => [{ id: res.id, ...payload, created_at: new Date().toISOString() }, ...prev]);
        showToast('Lead enregistré.');
      }
      setLeadModal({ open: false, isEditing: false, id: null, full_name: '', email: '', phone: '', software_interest: 'suit_foncier', status: 'new' });
    } catch (err) {
      showToast(err.message || 'Erreur lors de la sauvegarde.');
    }
  };

  const openEditLead = (lead) => {
    setLeadModal({
      open: true,
      isEditing: true,
      id: lead.id,
      full_name: lead.full_name,
      email: lead.email || '',
      phone: lead.phone || '',
      software_interest: lead.software_interest || 'suit_foncier',
      status: lead.status || 'new'
    });
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col xl:flex-row justify-between items-center gap-4">
        <p className="text-sm text-gray-500 whitespace-nowrap">{processed.length} lead(s) trouvé(s)</p>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto xl:justify-end">
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => setLeadModal(m => ({ ...m, open: true, isEditing: false, full_name: '', email: '', phone: '', software_interest: 'suit_foncier', status: 'new' }))} className="flex items-center gap-2 bg-ziv-cyan text-white px-4 py-2 rounded-lg text-sm font-medium hover:brightness-110 transition-colors shadow-sm">
              <Plus className="h-4 w-4" /> Nouveau Lead
            </button>
            <button onClick={() => openMsgModal('sms')} className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-black transition-colors shadow-sm hidden sm:flex">
              <MessageSquare className="h-4 w-4" /> SMS
            </button>
            <button onClick={() => openMsgModal('email')} className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors shadow-sm hidden sm:flex">
              <Mail className="h-4 w-4" /> Email
            </button>
            <a href="/admin/seo" className="flex items-center gap-2 border border-gray-200 bg-white text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
              <Settings className="h-4 w-4 text-gray-500" /> Paramètres
            </a>
          </div>
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Rechercher..." className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ziv-cyan w-full md:w-64" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 className="h-6 w-6 animate-spin mr-2" /> Chargement...
        </div>
      ) : (
        <>
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="text-xs text-gray-400 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-4 cursor-pointer select-none" onClick={() => handleSort('full_name')}>
                  <span className="flex items-center gap-1">Contact <SortIcon col="full_name" /></span>
                </th>
                <th className="px-6 py-4">Coordonnées</th>
                <th className="px-6 py-4">Intérêt</th>
                <th className="px-6 py-4 cursor-pointer select-none" onClick={() => handleSort('status')}>
                  <span className="flex items-center gap-1">Statut <SortIcon col="status" /></span>
                </th>
                <th className="px-6 py-4 cursor-pointer select-none" onClick={() => handleSort('created_at')}>
                  <span className="flex items-center gap-1">Date <SortIcon col="created_at" /></span>
                </th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">Aucun lead.</td></tr>
              )}
              {paginated.map(lead => (
                <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4"><p className="font-bold text-gray-900">{lead.full_name}</p></td>
                  <td className="px-6 py-4">
                    <p className="text-gray-900">{lead.phone}</p>
                    <p className="text-xs">{lead.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <SoftwareBadge value={lead.software_interest} />
                    {lead.software_interest === 'Rendez-vous' && lead.message && (
                      <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-md border border-gray-100 max-w-[200px] break-words whitespace-pre-wrap">
                        {lead.message}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <select value={lead.status} onChange={e => handleStatus(lead, e.target.value)}
                      className={`border text-xs rounded-lg block w-full p-2 focus:ring-2 ${SELECT_STYLE[lead.status] || ''}`}>
                      {Object.entries(leadStatuses).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400">{formatDate(lead.created_at)}</td>
                  <td className="px-6 py-4">
                    {lead.software_interest === 'Rendez-vous' && lead.status === 'new' && (
                      <span className="inline-flex mr-2 align-middle">
                        <button onClick={() => handleStatus(lead, 'in_progress')} className="text-green-500 hover:text-green-600 mr-1 bg-green-50 p-1.5 rounded" title="Confirmer le rendez-vous"><CheckCircle className="h-4 w-4" /></button>
                        <button onClick={() => handleStatus(lead, 'closed')} className="text-red-500 hover:text-red-600 bg-red-50 p-1.5 rounded" title="Refuser le rendez-vous"><XCircle className="h-4 w-4" /></button>
                        <span className="text-gray-200 mx-2 self-center">|</span>
                      </span>
                    )}
                    {lead.software_interest === 'Rendez-vous' && lead.status === 'in_progress' && (
                      <span className="inline-flex mr-2 align-middle">
                        <button onClick={() => handleStatus(lead, 'completed')} className="text-teal-500 hover:text-teal-600 mr-1 bg-teal-50 p-1.5 rounded" title="Marquer comme Effectué"><CheckCircle className="h-4 w-4" /></button>
                        <button onClick={() => handleStatus(lead, 'postponed')} className="text-orange-500 hover:text-orange-600 bg-orange-50 p-1.5 rounded" title="Reporter le rendez-vous"><Settings className="h-4 w-4" /></button>
                        <span className="text-gray-200 mx-2 self-center">|</span>
                      </span>
                    )}
                    <button onClick={() => openEditLead(lead)} className="text-gray-400 hover:text-blue-500 mr-2 align-middle" title="Modifier le lead"><Settings className="h-4 w-4" /></button>
                    <button onClick={() => openMsgModal('email', lead.email)} className="text-gray-400 hover:text-ziv-cyan mr-2 align-middle" title="Envoyer un email"><Mail className="h-4 w-4" /></button>
                    <button onClick={() => openMsgModal('sms', lead.phone)} className="text-gray-400 hover:text-blue-500 mr-2 align-middle" title="Envoyer un SMS"><MessageSquare className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(lead)} className="text-gray-400 hover:text-red-500 align-middle" title="Supprimer"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50 text-sm">
            <span className="text-gray-500">Page {page} / {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-2 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-2 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        </>
      )}

      {/* Modal d'envoi de message */}
      <Modal open={msgModal.open} onClose={closeMsgModal} maxWidth="sm:max-w-lg" contentClass="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          {msgModal.type === 'sms' ? <MessageSquare className="h-5 w-5 mr-2 text-ziv-cyan" /> : <Mail className="h-5 w-5 mr-2 text-ziv-cyan" />}
          Envoyer un {msgModal.type === 'sms' ? 'SMS' : 'Email'}
        </h3>
        <form onSubmit={handleSendMsg} className="space-y-4">
          <Field label={msgModal.type === 'sms' ? 'Numéro de téléphone' : 'Adresse Email'}>
            <TextInput 
              value={msgModal.recipient} 
              onChange={e => setMsgModal(m => ({ ...m, recipient: e.target.value }))} 
              placeholder={msgModal.type === 'sms' ? '+225 00 00 00 00 00' : 'contact@exemple.com'} 
              required 
            />
          </Field>
          
          {msgModal.type === 'email' && (
            <Field label="Sujet">
              <TextInput 
                value={msgModal.subject} 
                onChange={e => setMsgModal(m => ({ ...m, subject: e.target.value }))} 
                placeholder="Objet de l'email" 
                required 
              />
            </Field>
          )}

          <Field label="Message">
            <TextArea 
              rows={5} 
              value={msgModal.content} 
              onChange={e => setMsgModal(m => ({ ...m, content: e.target.value }))} 
              placeholder="Votre message..." 
              required 
            />
          </Field>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button type="button" onClick={closeMsgModal} className="px-4 py-2 text-gray-500 hover:text-gray-700 mr-4 font-semibold text-sm">
              Annuler
            </button>
            <SaveButton><Send className="h-4 w-4 mr-2" /> Envoyer le message</SaveButton>
          </div>
        </form>
      </Modal>

      {/* Modal Nouveau/Edition Lead */}
      <Modal open={leadModal.open} onClose={() => setLeadModal(m => ({ ...m, open: false }))} maxWidth="sm:max-w-md" contentClass="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Plus className="h-5 w-5 mr-2 text-ziv-cyan" /> {leadModal.isEditing ? 'Modifier Lead' : 'Nouveau Lead'}
        </h3>
        <form onSubmit={handleSaveLead} className="space-y-4">
          <Field label="Nom Complet / Entreprise">
            <TextInput value={leadModal.full_name} onChange={e => setLeadModal(m => ({ ...m, full_name: e.target.value }))} placeholder="Ex: Koffi B. (Aménagement Pro)" required />
          </Field>
          <Field label="Email">
            <TextInput type="email" value={leadModal.email} onChange={e => setLeadModal(m => ({ ...m, email: e.target.value }))} placeholder="contact@exemple.com" required />
          </Field>
          <Field label="Téléphone">
            <TextInput value={leadModal.phone} onChange={e => setLeadModal(m => ({ ...m, phone: e.target.value }))} placeholder="+225 00 00 00 00 00" required />
          </Field>
          <Field label="Intérêt Logiciel / Produit">
            <Select value={leadModal.software_interest} onChange={e => setLeadModal(m => ({ ...m, software_interest: e.target.value }))}>
              <option value="suit_foncier">Suite ZIV PROPTECH Globale</option>
              <option value="lotiges_erp">LOTI'GES ERP (Aménagement Foncier)</option>
              <option value="lotiges_crm">LOTI'GES VEFA (Promotion)</option>
              <option value="easy_vente">EASY VENTE (Commercialisation)</option>
              <option value="gespat">GESPAT (Gestion Locative)</option>
              <option value="syndycarre">SYNDYCARRE (Syndic)</option>
              <option value="gedaj">GEDAJ (LBC / Notaire)</option>
              <option value="Guide Digitalisation">Guide Digitalisation</option>
              <option value="Autre">Autre Demande</option>
            </Select>
          </Field>
          {leadModal.isEditing && (
            <Field label="Statut">
              <Select value={leadModal.status} onChange={e => setLeadModal(m => ({ ...m, status: e.target.value }))}>
                {Object.entries(leadStatuses).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
              </Select>
            </Field>
          )}
          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setLeadModal(m => ({ ...m, open: false }))} className="px-4 py-2 text-gray-500 hover:text-gray-700 mr-4 font-semibold text-sm">
              Annuler
            </button>
            <SaveButton>Enregistrer</SaveButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}
