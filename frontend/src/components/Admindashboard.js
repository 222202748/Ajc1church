import React, { useState, useEffect } from 'react';
import { Users, Calendar, Mail, Phone, MapPin, Download, Search, Filter, Eye, Trash2, RefreshCw, UserPlus, DollarSign, BarChart3, FileText, Video } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';
import axiosInstance from '../utils/axiosConfig';
import DonationDashboard from './DonationDashboard';
import { useNavigate } from 'react-router-dom';
import SermonVideoUpload from './SermonVideoUpload';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('events');
  const [registrations, setRegistrations] = useState([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('confirmed');
  const [loading, setLoading] = useState(true);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [error, setError] = useState(null);

  // Fetch registrations from backend
  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get(API_ENDPOINTS.EVENT_REGISTRATIONS);
      const data = response.data;
      setRegistrations(data);
      setFilteredRegistrations(data);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      setError('Failed to load registrations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Search and filter functionality
  useEffect(() => {
    let filtered = registrations;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(reg =>
        reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.phone.includes(searchTerm)
      );
    }

    // Apply status filter
    if (filterStatus === 'confirmed') {
      filtered = filtered.filter(reg => reg.status === 'confirmed' || !reg.status);
    } else if (filterStatus !== 'all') {
      filtered = filtered.filter(reg => reg.status === filterStatus);
    }

    setFilteredRegistrations(filtered);
  }, [searchTerm, filterStatus, registrations]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Address', 'Registration Date', 'Status', 'Attendees', 'Notes'],
      ...filteredRegistrations.map(reg => [
        reg.name,
        reg.email,
        reg.phone,
        reg.address || '',
        formatDate(reg.createdAt || reg.registrationDate),
        reg.status || 'pending',
        reg.attendeeCount || 1,
        reg.notes || ''
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `event-registrations-${new Date().toISOString().split('T')[0]}.csv`;
    a.style.visibility = 'hidden';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleDeleteRegistration = async (id) => {
    if (window.confirm('Are you sure you want to delete this registration?')) {
      try {
        await axiosInstance.delete(`${API_ENDPOINTS.EVENT_REGISTRATIONS}/${id}`);

        // Remove the deleted registration from the state
        setRegistrations(prev => prev.filter(reg => reg._id !== id));
        setFilteredRegistrations(prev => prev.filter(reg => reg._id !== id));
        alert('Registration deleted successfully!');
      } catch (error) {
        console.error('Error deleting registration:', error);
        alert('Failed to delete registration. Please try again.');
      }
    }
  };

  const refreshData = () => {
    fetchRegistrations();
  };

  const totalRegistrations = registrations.length;
  const confirmedCount = registrations.filter(r => (r.status === 'confirmed' || r.confirmed)).length;
  const cancelledCount = registrations.filter(r => r.status === 'cancelled').length;
  const totalAttendees = registrations
    .filter(r => (r.status === 'confirmed' || r.confirmed))
    .reduce((sum, reg) => sum + (reg.attendeeCount || 1), 0);

  const attendedAttendees = registrations
    .filter(r => r.attended)
    .reduce((sum, reg) => sum + (reg.attendeeCount || 1), 0);

  const handleConfirm = async (id) => {
    try {
      const res = await axiosInstance.patch(`${API_ENDPOINTS.EVENT_REGISTRATIONS}/${id}/confirm`, {}, { requiresAuth: false });
      const updated = res.data;
      setRegistrations(prev => prev.map(r => (r._id === id || r.id === id) ? updated : r));
      setFilteredRegistrations(prev => prev.map(r => (r._id === id || r.id === id) ? updated : r));
    } catch (e) {
      alert('Failed to confirm registration');
    }
  };

  const handleMarkAttended = async (id) => {
    try {
      const res = await axiosInstance.patch(`${API_ENDPOINTS.EVENT_REGISTRATIONS}/${id}/attend`, {}, { requiresAuth: false });
      const updated = res.data;
      setRegistrations(prev => prev.map(r => (r._id === id || r.id === id) ? updated : r));
      setFilteredRegistrations(prev => prev.map(r => (r._id === id || r.id === id) ? updated : r));
    } catch (e) {
      alert('Failed to mark attendance');
    }
  };

  const EventRegistrationDashboard = () => (
    <div>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Registration Dashboard</h1>
            <p className="text-gray-600">Monthly Event - June 2025</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <button
              onClick={refreshData}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Registrations</p>
              <p className="text-2xl font-bold text-gray-900">{totalRegistrations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserPlus className="w-8 h-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Attendees</p>
              <p className="text-2xl font-bold text-purple-600">{totalAttendees}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold text-green-600">{confirmedCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Events</p>
              <p className="text-2xl font-bold text-blue-600">1</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-red-600 rounded-full"></div>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Cancelled</p>
              <p className="text-2xl font-bold text-red-600">{cancelledCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="w-8 h-8 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Attended</p>
              <p className="text-xs text-gray-500">People</p>
              <p className="text-xl font-bold text-indigo-600">{attendedAttendees}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex items-center space-x-2 flex-1">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="confirmed">Confirmed Only</option>
              <option value="all">All Status</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Registrations Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Registrations ({filteredRegistrations.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading registrations...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{error}</p>
            <button 
              onClick={fetchRegistrations}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No registrations found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registration Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attendees
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRegistrations.map((registration) => (
                  <tr key={registration._id || registration.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {registration.name}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          {registration.address || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        {registration.email}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        {registration.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {formatDate(registration.createdAt || registration.registrationDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <UserPlus className="w-4 h-4 mr-2 text-gray-400" />
                        {registration.attendeeCount || 1} {(registration.attendeeCount || 1) === 1 ? 'person' : 'people'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(registration.status || 'pending')}`}>
                        {(registration.status || 'pending').charAt(0).toUpperCase() + (registration.status || 'pending').slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedRegistration(registration)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleConfirm(registration._id || registration.id)}
                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-100"
                          title="Confirm"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => handleMarkAttended(registration._id || registration.id)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-100"
                          title="Mark Attended"
                        >
                          ✔
                        </button>
                        <button
                          onClick={() => handleDeleteRegistration(registration._id || registration.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100"
                          title="Delete Registration"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Registration Details Modal */}
      {selectedRegistration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Registration Details</h3>
                <button
                  onClick={() => setSelectedRegistration(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRegistration.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRegistration.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRegistration.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRegistration.address || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Registration Date</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(selectedRegistration.createdAt || selectedRegistration.registrationDate)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Number of Attendees</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRegistration.attendeeCount || 1} {(selectedRegistration.attendeeCount || 1) === 1 ? 'person' : 'people'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border mt-1 ${getStatusColor(selectedRegistration.status || 'pending')}`}>
                    {(selectedRegistration.status || 'pending').charAt(0).toUpperCase() + (selectedRegistration.status || 'pending').slice(1)}
                  </span>
                </div>
                {selectedRegistration.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRegistration.notes}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => setSelectedRegistration(null)}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Main Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">Manage church events and donations</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab('events')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'events'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Event Registrations</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('donations')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'donations'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4" />
                  <span>Donation Management</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('sermons')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'sermons'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Video className="w-4 h-4" />
                  <span>Sermon Videos</span>
                </div>
              </button>
              <button
                onClick={() => navigate('/Admin/blog')}
                className="py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              >
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Blog Management</span>
                </div>
              </button>
              <button
                onClick={() => navigate('/Admin/profile')}
                className="py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              >
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Profile Settings</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'events' && <EventRegistrationDashboard />}
        {activeTab === 'donations' && <DonationDashboard />}
        {activeTab === 'sermons' && <SermonVideoUpload />}
      </div>
    </div>
  );
};

export default AdminDashboard;
