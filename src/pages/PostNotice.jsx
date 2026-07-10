import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, Calendar, Clock, Phone, Plus, Trash2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MOCK_CATEGORIES, MOCK_LOCATIONS } from '../services/mockData';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';
import PageTransition from '../components/PageTransition';

export default function PostNotice() {
  const { user, createNotice } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=post-notice');
    } else if (user.role !== 'employer') {
      alert('Only employers can post job notices.');
      navigate('/');
    }
  }, [user, navigate]);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [salary, setSalary] = useState('');
  const [salaryType, setSalaryType] = useState('day');
  const [peopleNeeded, setPeopleNeeded] = useState('1');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [date, setDate] = useState('');
  const [workingTime, setWorkingTime] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
  
  // Requirements array
  const [reqInput, setReqInput] = useState('');
  const [requirements, setRequirements] = useState([]);

  // Errors state
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleAddRequirement = () => {
    if (reqInput.trim() && !requirements.includes(reqInput.trim())) {
      setRequirements([...requirements, reqInput.trim()]);
      setReqInput('');
    }
  };

  const handleRemoveRequirement = (idxToRemove) => {
    setRequirements(requirements.filter((_, idx) => idx !== idxToRemove));
  };

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!category) newErrors.category = 'Category is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!salary || Number(salary) <= 0) newErrors.salary = 'Please enter a valid salary amount';
    if (!peopleNeeded || Number(peopleNeeded) <= 0) newErrors.peopleNeeded = 'Please specify headcount needed';
    if (!location) newErrors.location = 'Location is required';
    if (!address.trim()) newErrors.address = 'Detailed address is required';
    if (!date) newErrors.date = 'Working date is required';
    if (!workingTime.trim()) newErrors.workingTime = 'Working hours are required';
    if (!phoneNumber.trim()) newErrors.phoneNumber = 'Contact phone number is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    // Simulate database delay
    setTimeout(() => {
      const noticeData = {
        title,
        category,
        description,
        salary: Number(salary),
        salaryType,
        peopleNeeded: Number(peopleNeeded),
        location,
        address,
        date,
        workingTime,
        phoneNumber,
        requirements: requirements.length > 0 ? requirements : ["Punctuality is required"]
      };

      const res = createNotice(noticeData);
      setLoading(false);

      if (res.success) {
        navigate('/my-notices');
      } else {
        alert(res.message || 'Failed to create notice');
      }
    }, 1000);
  };

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-left mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Post a New Job Notice</h1>
          <p className="text-sm text-slate-500 mt-1">
            Recruit local temporary helpers by publishing a job post. Fields marked with <span className="text-red-500">*</span> are mandatory.
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-10 shadow-sm text-left">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* 1. Basic Info */}
            <div className="space-y-5">
              <h3 className="font-heading text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">
                Basic Information
              </h3>

              <Input
                label="Job Title"
                id="title"
                placeholder="e.g. Catering Helper Needed for Wedding Event"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                error={errors.title}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Select
                  label="Category"
                  id="category"
                  options={MOCK_CATEGORIES}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  error={errors.category}
                  icon={Briefcase}
                  required
                  placeholder="Select a category"
                />

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <Input
                      label="Salary (₹)"
                      id="salary"
                      type="number"
                      placeholder="e.g. 800"
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      error={errors.salary}
                      required
                    />
                  </div>
                  <div>
                    <Select
                      label="Unit"
                      id="salaryType"
                      options={[
                        { value: 'day', label: '/ day' },
                        { value: 'hour', label: '/ hr' }
                      ]}
                      value={salaryType}
                      onChange={(e) => setSalaryType(e.target.value)}
                      placeholder=""
                    />
                  </div>
                </div>
              </div>

              <div className="w-full text-left space-y-1.5">
                <label htmlFor="description" className="block text-sm font-semibold text-slate-700">
                  Job Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  rows="4"
                  placeholder="Clearly describe the responsibilities and what kind of work the helper needs to do..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`w-full px-4 py-3 bg-slate-50 border ${
                    errors.description 
                      ? 'border-red-300 focus:ring-red-200 focus:border-red-500' 
                      : 'border-slate-200 focus:ring-primary/20 focus:border-primary'
                  } rounded-xl text-sm transition-all outline-none focus:ring-4 focus:bg-white`}
                />
                {errors.description && (
                  <p className="text-xs font-medium text-red-500 mt-1">{errors.description}</p>
                )}
              </div>
            </div>

            {/* 2. Operations & Schedule */}
            <div className="space-y-5">
              <h3 className="font-heading text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">
                Operations & Scheduling
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <Input
                  label="Helpers Needed (Headcount)"
                  id="peopleNeeded"
                  type="number"
                  placeholder="e.g. 3"
                  value={peopleNeeded}
                  onChange={(e) => setPeopleNeeded(e.target.value)}
                  error={errors.peopleNeeded}
                  required
                />

                <Input
                  label="Work Date"
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  error={errors.date}
                  icon={Calendar}
                  required
                />

                <Input
                  label="Working Hours"
                  id="workingTime"
                  placeholder="e.g. 6:00 PM - 11:00 PM"
                  value={workingTime}
                  onChange={(e) => setWorkingTime(e.target.value)}
                  error={errors.workingTime}
                  icon={Clock}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Select
                  label="Location Area"
                  id="location"
                  options={MOCK_LOCATIONS}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  error={errors.location}
                  icon={MapPin}
                  required
                  placeholder="Select general area"
                />

                <Input
                  label="Contact Phone"
                  id="phoneNumber"
                  placeholder="e.g. +91 98765 43210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  error={errors.phoneNumber}
                  icon={Phone}
                  required
                />
              </div>

              <Input
                label="Full Address (Detailed)"
                id="address"
                placeholder="e.g. Royal Mahal Hall, Near PSG Tech, RS Puram"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                error={errors.address}
                icon={MapPin}
                required
              />
            </div>

            {/* 3. Requirements Checklist Creator */}
            <div className="space-y-4">
              <h3 className="font-heading text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">
                Requirements Checklist (Optional)
              </h3>
              
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Add a requirement (e.g. Must bring own vehicle)"
                    value={reqInput}
                    onChange={(e) => setReqInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddRequirement();
                      }
                    }}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-primary focus:bg-white rounded-xl text-sm transition-all outline-none focus:ring-4 focus:ring-primary/10"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddRequirement}
                  className="px-4 py-3 bg-indigo-50 border border-indigo-100 text-primary hover:bg-indigo-100 rounded-xl transition-all flex items-center justify-center font-bold"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>

              {/* Requirement pill tags */}
              {requirements.length > 0 && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                  {requirements.map((req, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white border border-slate-150 rounded-xl px-3.5 py-2 text-sm text-slate-700">
                      <span>{req}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveRequirement(idx)}
                        className="text-slate-400 hover:text-red-500 p-1 rounded-md transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => navigate('/my-notices')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={loading}
              >
                Publish Job Notice
              </Button>
            </div>
          </form>
        </div>
      </div>
    </PageTransition>
  );
}
