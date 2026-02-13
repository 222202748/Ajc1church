import React from 'react';
import { Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

import AwakenurNavbar from './components/Navbar';
import Header from './components/Header';
import EventCountdown from './components/EventCountdown';
import Pastors from './components/Pastors';
import BlogArticles from './components/BlogArticles';
import Blog from './components/Blog';
import EventRegistration from './components/EventRegistration';
import Footer from './components/Footer';
import Events from './components/AllEvents';
import Contact from './components/Contact';
import Donation from './components/Donation';
import HomeBlogPreview from './components/HomeBlogPreview';
import { LanguageProvider } from './contexts/LanguageContext';
import AdminDashboard from './components/Admindashboard';
import Adminlogin from './components/Adminlogin';
import BlogAdmin from './components/BlogAdmin';
import AdminProfile from './components/AdminProfile';
import BlogArticle from './components/BlogArticle';
import Greeting from './components/Greeting';
import Testimonials from './components/Testimonials';
import PrayerRequest from './components/PrayerRequest';
import ServiceSchedule from './components/ServiceSchedule';
import Sermons from './components/Sermons';
import ProtectedRoute from './components/ProtectedRoute';



const Home = () => (
  <>
    <Header />
    <EventCountdown />
    <Greeting />
    <Pastors />
    <Testimonials />
    <HomeBlogPreview />
  </>
);

function App() {
  return (
    <LanguageProvider>
      <div className="App">
        <AwakenurNavbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogArticle />} />
          <Route path="/pastors" element={<Pastors />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/donate" element={<Donation />} />
          <Route path="/prayer-request" element={<PrayerRequest />} />
          <Route path="/service-schedule" element={<ServiceSchedule />} />
          <Route path="/sermons" element={<Sermons />} />
          <Route path="/Admin" element={<Adminlogin />} />
          <Route path="/Admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/Admin/blog" element={<ProtectedRoute><BlogAdmin /></ProtectedRoute>} />
          <Route path="/Admin/profile" element={<ProtectedRoute><AdminProfile /></ProtectedRoute>} />
          <Route path="/event-registration" element={<EventRegistration />} />
        </Routes>
        <Footer />
      </div>
    </LanguageProvider>
  );
}

export default App;