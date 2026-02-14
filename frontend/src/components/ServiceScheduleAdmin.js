import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, MapPin, Edit, Trash2, Plus, RefreshCw, Save, X, Info } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';
import axiosInstance from '../utils/axiosConfig';
import { useLanguage } from '../contexts/LanguageContext';

const ServiceScheduleAdmin = () => {
  const { language } = useLanguage();
  const isTamil = language === 'tamil';

  const t = {
    title: isTamil ? 'சேவை அட்டவணை மேலாண்மை' : 'Service Schedule Management',
    subtitle: isTamil ? 'வாராந்திர, சிறப்பு மற்றும் வரவிருக்கும் நிகழ்வுகளை நிர்வகிக்கவும்' : 'Manage weekly, special and upcoming events',
    addSchedule: isTamil ? 'புதிய அட்டவணையைச் சேர்' : 'Add New Schedule',
    weekly: isTamil ? 'வாராந்திர' : 'Weekly',
    special: isTamil ? 'சிறப்பு' : 'Special',
    upcoming: isTamil ? 'வரவிருக்கும்' : 'Upcoming',
    type: isTamil ? 'வகை' : 'Type',
    day: isTamil ? 'நாள்' : 'Day',
    date: isTamil ? 'தேதி' : 'Date',
    time: isTamil ? 'நேரம்' : 'Time',
    serviceName: isTamil ? 'சேவை பெயர்' : 'Service Name',
    location: isTamil ? 'இடம்' : 'Location',
    actions: isTamil ? 'செயல்கள்' : 'Actions',
    save: isTamil ? 'சேமி' : 'Save',
    cancel: isTamil ? 'ரத்துசெய்' : 'Cancel',
    edit: isTamil ? 'திருத்து' : 'Edit',
    delete: isTamil ? 'நீக்கு' : 'Delete',
    loading: isTamil ? 'ஏற்றப்படுகிறது...' : 'Loading...',
    noSchedules: isTamil ? 'அட்டவணைகள் எதுவும் இல்லை' : 'No schedules found',
    deleteConfirm: isTamil ? 'நிச்சயமாக நீக்க வேண்டுமா?' : 'Are you sure you want to delete?',
    successAdd: isTamil ? 'வெற்றிகரமாகச் சேர்க்கப்பட்டது' : 'Added successfully',
    successUpdate: isTamil ? 'வெற்றிகரமாகப் புதுப்பிக்கப்பட்டது' : 'Updated successfully',
    successDelete: isTamil ? 'வெற்றிகரமாக நீக்கப்பட்டது' : 'Deleted successfully',
    errorFetch: isTamil ? 'தரவை ஏறுவதில் பிழை' : 'Error fetching data',
    errorSave: isTamil ? 'சேமிப்பதில் பிழை' : 'Error saving data',
    days: {
      Sunday: isTamil ? 'ஞாயிறு' : 'Sunday',
      Monday: isTamil ? 'திங்கள்' : 'Monday',
      Tuesday: isTamil ? 'செவ்வாய்' : 'Tuesday',
      Wednesday: isTamil ? 'புதன்' : 'Wednesday',
      Thursday: isTamil ? 'வியாழன்' : 'Thursday',
      Friday: isTamil ? 'வெள்ளி' : 'Friday',
      Saturday: isTamil ? 'சனி' : 'Saturday'
    }
  };

  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    type: 'weekly',
    day: 'Sunday',
    date: '',
    time: '',
    serviceName: '',
    location: '',
    description: ''
  });

  const fetchSchedules = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_ENDPOINTS.serviceSchedules);
      setSchedules(response.data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      type: 'weekly',
      day: 'Sunday',
      date: '',
      time: '',
      serviceName: '',
      location: '',
      description: ''
    });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (schedule) => {
    setFormData({
      type: schedule.type,
      day: schedule.day || 'Sunday',
      date: schedule.date ? schedule.date.split('T')[0] : '',
      time: schedule.time,
      serviceName: schedule.serviceName,
      location: schedule.location,
      description: schedule.description || ''
    });
    setEditingId(schedule._id);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axiosInstance.put(`${API_ENDPOINTS.serviceSchedules}/${editingId}`, formData);
        alert(t.successUpdate);
      } else {
        await axiosInstance.post(API_ENDPOINTS.serviceSchedules, formData);
        alert(t.successAdd);
      }
      resetForm();
      fetchSchedules();
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert(t.errorSave);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t.deleteConfirm)) {
      try {
        await axiosInstance.delete(`${API_ENDPOINTS.serviceSchedules}/${id}`);
        alert(t.successDelete);
        fetchSchedules();
      } catch (error) {
        console.error('Error deleting schedule:', error);
      }
    }
  };

  const getDayLabel = (day) => t.days[day] || day;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{t.title}</h2>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 bg-[#8B4513] text-white px-4 py-2 rounded-lg hover:bg-[#6F370F] transition-colors"
        >
          <Plus size={20} />
          {t.addSchedule}
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-xl shadow-md mb-8 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">{editingId ? t.edit : t.addSchedule}</h3>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.type}</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#8B4513] outline-none"
              >
                <option value="weekly">{t.weekly}</option>
                <option value="special">{t.special}</option>
                <option value="upcoming">{t.upcoming}</option>
              </select>
            </div>

            {formData.type === 'weekly' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.day}</label>
                <select
                  name="day"
                  value={formData.day}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#8B4513] outline-none"
                >
                  {Object.keys(t.days).map(day => (
                    <option key={day} value={day}>{t.days[day]}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.date}</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#8B4513] outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.time}</label>
              <input
                type="text"
                name="time"
                placeholder="e.g. 10:30 AM"
                value={formData.time}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#8B4513] outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.serviceName}</label>
              <input
                type="text"
                name="serviceName"
                value={formData.serviceName}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#8B4513] outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.location}</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#8B4513] outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">{isTamil ? 'விளக்கம்' : 'Description'}</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#8B4513] outline-none"
                rows="2"
              ></textarea>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-[#8B4513] text-white rounded-lg hover:bg-[#6F370F] flex items-center gap-2"
              >
                <Save size={18} />
                {t.save}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 font-semibold text-gray-700">{t.type}</th>
                <th className="p-4 font-semibold text-gray-700">{isTamil ? 'நாள் / தேதி' : 'Day / Date'}</th>
                <th className="p-4 font-semibold text-gray-700">{t.time}</th>
                <th className="p-4 font-semibold text-gray-700">{t.serviceName}</th>
                <th className="p-4 font-semibold text-gray-700">{t.location}</th>
                <th className="p-4 font-semibold text-gray-700 text-center">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    <RefreshCw className="animate-spin inline mr-2" />
                    {t.loading}
                  </td>
                </tr>
              ) : schedules.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    <Info className="inline mr-2" />
                    {t.noSchedules}
                  </td>
                </tr>
              ) : (
                schedules.map(schedule => (
                  <tr key={schedule._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        schedule.type === 'weekly' ? 'bg-blue-100 text-blue-700' :
                        schedule.type === 'special' ? 'bg-purple-100 text-purple-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {t[schedule.type]}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">
                      {schedule.type === 'weekly' ? getDayLabel(schedule.day) : new Date(schedule.date).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-gray-600">{schedule.time}</td>
                    <td className="p-4 font-medium text-gray-800">{schedule.serviceName}</td>
                    <td className="p-4 text-gray-600">{schedule.location}</td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(schedule)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title={t.edit}
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(schedule._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title={t.delete}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ServiceScheduleAdmin;
