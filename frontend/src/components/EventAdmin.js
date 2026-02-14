import React, { useState, useEffect } from 'react';
import { Calendar, Check, Clock, Edit, MapPin, Plus, RefreshCw, Search, Trash2, X } from 'lucide-react';
import axiosInstance from '../utils/axiosConfig';

const EventAdmin = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('list'); // list, create, edit
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    image: ''
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [formSuccess, setFormSuccess] = useState('');
  
  // Fetch events from backend
  useEffect(() => {
    fetchEvents();
  }, []);
  
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/api/events');
      setEvents(response.data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter events based on search
  const filteredEvents = events.filter(event => {
    const matchesSearch = searchTerm === '' || 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.date) errors.date = 'Date is required';
    if (!formData.time.trim()) errors.time = 'Time is required';
    if (!formData.location.trim()) errors.location = 'Location is required';
    return errors;
  };

  // Create new event
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setLoading(true);
      setFormErrors({});
      await axiosInstance.post('/api/events', formData);
      setFormSuccess('Event created successfully!');
      setTimeout(() => {
        setFormSuccess('');
        setCurrentView('list');
        fetchEvents();
      }, 2000);
    } catch (error) {
      console.error('Error creating event:', error);
      setFormErrors({ submit: 'Failed to create event. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Update existing event
  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setLoading(true);
      setFormErrors({});
      await axiosInstance.put(`/api/events/${selectedEvent._id}`, formData);
      setFormSuccess('Event updated successfully!');
      setTimeout(() => {
        setFormSuccess('');
        setCurrentView('list');
        fetchEvents();
      }, 2000);
    } catch (error) {
      console.error('Error updating event:', error);
      setFormErrors({ submit: 'Failed to update event. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Delete event
  const handleDeleteEvent = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        setLoading(true);
        await axiosInstance.delete(`/api/events/${id}`);
        fetchEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
        setError('Failed to delete event.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Switch to edit view
  const startEdit = (event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date.split('T')[0], // Format for date input
      time: event.time,
      location: event.location,
      image: event.image || ''
    });
    setFormErrors({});
    setCurrentView('edit');
  };

  // Switch to create view
  const startCreate = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      image: ''
    });
    setFormErrors({});
    setCurrentView('create');
  };

  if (loading && currentView === 'list' && events.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Event Management</h1>
            <p className="text-gray-600">Create and manage upcoming church events</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            {currentView === 'list' ? (
              <button 
                onClick={startCreate}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add New Event
              </button>
            ) : (
              <button 
                onClick={() => setCurrentView('list')}
                className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <X className="w-5 h-5 mr-2" />
                Cancel
              </button>
            )}
            <button 
              onClick={fetchEvents}
              className="p-2 bg-white text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {formSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6 flex items-center">
            <Check className="w-5 h-5 mr-2" />
            <span className="block sm:inline">{formSuccess}</span>
          </div>
        )}

        {/* List View */}
        {currentView === 'list' && (
          <>
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search events by title or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map(event => (
                <div key={event._id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
                  {event.image && (
                    <div className="h-40 bg-gray-200 overflow-hidden">
                      <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{event.title}</h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600 text-sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <Clock className="w-4 h-4 mr-2" />
                        {event.time}
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4 border-t border-gray-50">
                      <button 
                        onClick={() => startEdit(event)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteEvent(event._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredEvents.length === 0 && (
                <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-gray-300">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No events found. Create your first event!</p>
                  <button 
                    onClick={startCreate}
                    className="mt-4 text-blue-600 font-medium hover:underline"
                  >
                    Add New Event
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Create/Edit View */}
        {(currentView === 'create' || currentView === 'edit') && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">
                {currentView === 'create' ? 'Create New Event' : 'Edit Event'}
              </h2>
            </div>
            <form onSubmit={currentView === 'create' ? handleCreateEvent : handleUpdateEvent} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Event Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border ${formErrors.title ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Enter event title"
                  />
                  {formErrors.title && <p className="text-red-500 text-xs">{formErrors.title}</p>}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Image URL</label>
                  <input
                    type="text"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="text-gray-400 text-xs">Optional: Direct link to an image</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border ${formErrors.date ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {formErrors.date && <p className="text-red-500 text-xs">{formErrors.date}</p>}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Time *</label>
                  <input
                    type="text"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border ${formErrors.time ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="e.g. 06:00 PM"
                  />
                  {formErrors.time && <p className="text-red-500 text-xs">{formErrors.time}</p>}
                </div>

                <div className="col-span-full space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border ${formErrors.location ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Enter event location"
                  />
                  {formErrors.location && <p className="text-red-500 text-xs">{formErrors.location}</p>}
                </div>

                <div className="col-span-full space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    className={`w-full px-4 py-2 border ${formErrors.description ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Describe the event..."
                  ></textarea>
                  {formErrors.description && <p className="text-red-500 text-xs">{formErrors.description}</p>}
                </div>
              </div>

              {formErrors.submit && <p className="text-red-500 text-sm text-center">{formErrors.submit}</p>}

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCurrentView('list')}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
                >
                  {loading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                  {currentView === 'create' ? 'Create Event' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventAdmin;
