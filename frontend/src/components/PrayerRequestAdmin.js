import React, { useState, useEffect, useCallback } from 'react';
import { Mail, Search, Trash2, RefreshCw, Eye, CheckCircle, Clock, Archive, Heart } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';
import axiosInstance from '../utils/axiosConfig';
import { useLanguage } from '../contexts/LanguageContext';

const PrayerRequestAdmin = () => {
  const { language } = useLanguage();
  const isTamil = language === 'tamil';

  const t = {
    search: isTamil ? 'பிரார்த்தனை கோரிக்கைகளைத் தேடுங்கள்...' : 'Search prayer requests...',
    allStatus: isTamil ? 'அனைத்து நிலை' : 'All Status',
    pending: isTamil ? 'நிலுவையில் உள்ளது' : 'Pending',
    praying: isTamil ? 'பிரார்த்திக்கப்படுகிறது' : 'Praying',
    answered: isTamil ? 'பதில் அளிக்கப்பட்டது' : 'Answered',
    archived: isTamil ? 'காப்பகப்படுத்தப்பட்டது' : 'Archived',
    from: isTamil ? 'அனுப்புநர்' : 'From',
    type: isTamil ? 'வகை' : 'Type',
    request: isTamil ? 'கோரிக்கை' : 'Request',
    status: isTamil ? 'நிலை' : 'Status',
    actions: isTamil ? 'செயல்கள்' : 'Actions',
    noFound: isTamil ? 'பிரார்த்தனை கோரிக்கைகள் எதுவும் இல்லை' : 'No prayer requests found',
    detailTitle: isTamil ? 'பிரார்த்தனை கோரிக்கை விவரம்' : 'Prayer Request Detail',
    message: isTamil ? 'கோரிக்கை செய்தி' : 'Request Message',
    close: isTamil ? 'மூடு' : 'Close',
    email: isTamil ? 'மின்னஞ்சல்' : 'Email',
    phone: isTamil ? 'தொலைபேசி' : 'Phone',
    loading: isTamil ? 'பிரார்த்தனை கோரிக்கைகள் ஏற்றப்படுகின்றன...' : 'Loading prayer requests...',
    deleteConfirm: isTamil ? 'இந்தக் கோரிக்கையை நீக்க விரும்புகிறீர்களா?' : 'Are you sure you want to delete this request?',
    updateError: isTamil ? 'நிலையை மாற்ற முடியவில்லை' : 'Failed to update status',
    deleteError: isTamil ? 'கோரிக்கையை நீக்க முடியவில்லை' : 'Failed to delete request'
  };
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [error, setError] = useState(null);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get(API_ENDPOINTS.prayerRequests);
      setRequests(response.data);
      setFilteredRequests(response.data);
    } catch (error) {
      console.error('Error fetching prayer requests:', error);
      setError(t.loadingError || 'Failed to load prayer requests.');
    } finally {
      setLoading(false);
    }
  }, [t.loadingError]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    let filtered = requests;
    if (searchTerm) {
      filtered = filtered.filter(req => 
        req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.prayerRequest.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter(req => req.status === filterStatus);
    }
    setFilteredRequests(filtered);
  }, [searchTerm, filterStatus, requests]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await axiosInstance.put(`${API_ENDPOINTS.prayerRequests}/${id}`, { status: newStatus });
      fetchRequests();
      if (selectedRequest && selectedRequest._id === id) {
        setSelectedRequest(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert(t.updateError);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t.deleteConfirm)) {
      try {
        await axiosInstance.delete(`${API_ENDPOINTS.prayerRequests}/${id}`);
        fetchRequests();
        setSelectedRequest(null);
      } catch (error) {
        console.error('Error deleting request:', error);
        alert(t.deleteError);
      }
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'praying': return <Heart className="w-4 h-4 text-pink-500" />;
      case 'answered': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'archived': return <Archive className="w-4 h-4 text-gray-500" />;
      default: return null;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'praying': return 'bg-pink-100 text-pink-800';
      case 'answered': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={t.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">{t.allStatus}</option>
            <option value="pending">{t.pending}</option>
            <option value="praying">{t.praying}</option>
            <option value="answered">{t.answered}</option>
            <option value="archived">{t.archived}</option>
          </select>
          <button 
            onClick={fetchRequests}
            className="p-2 text-gray-600 hover:text-blue-600 border border-gray-300 rounded-lg hover:border-blue-600"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500 bg-red-50 rounded-lg">{error}</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.from}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.type}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.request}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t.status}</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRequests.map((req) => (
                  <tr key={req._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{req.name}</div>
                      <div className="text-sm text-gray-500">{req.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize text-sm">{req.requestType}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs truncate text-sm">{req.prayerRequest}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(req.status)}`}>
                        <span className="mr-1.5">{getStatusIcon(req.status)}</span>
                        <span className="capitalize">
                          {req.status === 'pending' ? t.pending : 
                           req.status === 'praying' ? t.praying : 
                           req.status === 'answered' ? t.answered : 
                           req.status === 'archived' ? t.archived : 
                           req.status}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setSelectedRequest(req)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Eye className="w-5 h-5" /></button>
                        <button onClick={() => handleDelete(req._id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-5 h-5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredRequests.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">{t.noFound}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-blue-50/50">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Heart className="w-6 h-6 text-pink-500" />
                {t.detailTitle}
              </h3>
              <button onClick={() => setSelectedRequest(null)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.from}</label>
                  <p className="mt-1 text-gray-900 font-medium text-lg">{selectedRequest.name}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.type}</label>
                  <p className="mt-1 text-gray-900 font-medium capitalize text-lg">{selectedRequest.requestType}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.email}</label>
                  <p className="mt-1 text-blue-600 font-medium flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {selectedRequest.email}
                  </p>
                </div>
                {selectedRequest.phone && (
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.phone}</label>
                    <p className="mt-1 text-gray-900 font-medium">{selectedRequest.phone}</p>
                  </div>
                )}
              </div>
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.message}</label>
                <p className="mt-3 text-gray-800 whitespace-pre-wrap leading-relaxed italic">"{selectedRequest.prayerRequest}"</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
                <div className="flex flex-wrap justify-center gap-2">
                  {['pending', 'praying', 'answered', 'archived'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(selectedRequest._id, status)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${
                        selectedRequest.status === status 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-105' 
                          : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <span className="capitalize">
                        {status === 'pending' ? t.pending : 
                         status === 'praying' ? t.praying : 
                         status === 'answered' ? t.answered : 
                         status === 'archived' ? t.archived : 
                         status}
                      </span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 font-semibold"
                >
                  {t.close}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrayerRequestAdmin;
