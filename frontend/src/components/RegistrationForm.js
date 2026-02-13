import React, { useState } from 'react';

const RegistrationForm = ({ eventType, eventTitle, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    numberOfPeople: 1
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      numberOfPeople: 1
    });
  };

  return (
    <div className="registration-form">
      <style>{`
        .registration-form {
          max-width: 500px;
          margin: 2rem auto;
          padding: 2rem;
          background: linear-gradient(135deg, #92400e, #b45309);
          border-radius: 15px;
          color: white;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .registration-form h2 {
          text-align: center;
          margin-bottom: 2rem;
          font-size: 2rem;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        .form-group input {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 1rem;
        }

        .form-group input:focus {
          outline: none;
          border-color: white;
          background: rgba(255, 255, 255, 0.2);
        }

        .submit-btn {
          width: 100%;
          padding: 1rem;
          border: none;
          border-radius: 8px;
          background: white;
          color: #92400e;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .submit-btn:hover {
          background: #fef3c7;
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .registration-form {
            margin: 1rem;
            padding: 1.5rem;
          }
        }
      `}</style>

      <h2>Register for {eventTitle}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="numberOfPeople">Number of People Attending</label>
          <input
            type="number"
            id="numberOfPeople"
            min="1"
            value={formData.numberOfPeople}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 1;
              setFormData({ ...formData, numberOfPeople: value });
            }}
            required
          />
        </div>

        <button type="submit" className="submit-btn">
          Register Now
        </button>
      </form>
    </div>
  );
};

export default RegistrationForm;