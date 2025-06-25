import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, ChevronLeft, ChevronRight, Edit2, Trash2, Save, X } from 'lucide-react';
import Calculator from './Calculator';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  type: 'meeting' | 'personal' | 'work';
  description?: string;
}

const SchedulePanel: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    date: '',
    time: '',
    duration: '30',
    type: 'personal' as 'meeting' | 'personal' | 'work',
    description: ''
  });

  useEffect(() => {
    const saved = localStorage.getItem('scheduleEvents');
    if (saved) {
      setEvents(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('scheduleEvents', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    // Set default date to today
    const today = new Date();
    setEventForm(prev => ({
      ...prev,
      date: today.toISOString().split('T')[0]
    }));
  }, []);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date | null) => {
    if (!date) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const hasEvents = (date: Date | null) => {
    if (!date) return false;
    const dateStr = date.toISOString().split('T')[0];
    return events.some(event => event.date === dateStr);
  };

  const getSelectedDateEvents = () => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    return events
      .filter(event => event.date === dateStr)
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title.trim() || !eventForm.date || !eventForm.time) return;

    if (editingEventId) {
      setEvents(prev => prev.map(event => 
        event.id === editingEventId 
          ? { ...event, ...eventForm }
          : event
      ));
      setEditingEventId(null);
    } else {
      const newEvent: Event = {
        id: Date.now().toString(),
        ...eventForm
      };
      setEvents(prev => [...prev, newEvent]);
    }

    setEventForm({
      title: '',
      date: new Date().toISOString().split('T')[0],
      time: '',
      duration: '30',
      type: 'personal',
      description: ''
    });
    setIsAddingEvent(false);
  };

  const handleEdit = (event: Event) => {
    setEventForm(event);
    setEditingEventId(event.id);
    setIsAddingEvent(true);
  };

  const handleDelete = (id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id));
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-500';
      case 'work': return 'bg-primary';
      case 'personal': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const selectedDateEvents = getSelectedDateEvents();

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Schedule Panel */}
      <div className="xl:col-span-2">
        <div className="glass-panel p-6 transition-all h-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="orbitron text-xl font-bold text-primary">Schedule</h2>
            <button
              onClick={() => setIsAddingEvent(!isAddingEvent)}
              className="p-2 rounded-full bg-gradient-to-r from-primary to-primary-dark 
                       text-white golden-glow transition-all hover:scale-110"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add/Edit Event Form */}
          {isAddingEvent && (
            <form onSubmit={handleSubmit} className="mb-6 p-4 bg-glass rounded-lg border border-primary/30">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Event title"
                  value={eventForm.title}
                  onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                  className="px-4 py-2 bg-glass border border-primary/30 rounded-lg text-secondary 
                           placeholder-muted focus:outline-none focus:border-primary transition-all"
                  required
                />
                <select
                  value={eventForm.type}
                  onChange={(e) => setEventForm(prev => ({ ...prev, type: e.target.value as any }))}
                  className="px-4 py-2 bg-glass border border-primary/30 rounded-lg text-secondary 
                           focus:outline-none focus:border-primary transition-all"
                >
                  <option value="personal">Personal</option>
                  <option value="work">Work</option>
                  <option value="meeting">Meeting</option>
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input
                  type="date"
                  value={eventForm.date}
                  onChange={(e) => setEventForm(prev => ({ ...prev, date: e.target.value }))}
                  className="px-4 py-2 bg-glass border border-primary/30 rounded-lg text-secondary 
                           focus:outline-none focus:border-primary transition-all"
                  required
                />
                <input
                  type="time"
                  value={eventForm.time}
                  onChange={(e) => setEventForm(prev => ({ ...prev, time: e.target.value }))}
                  className="px-4 py-2 bg-glass border border-primary/30 rounded-lg text-secondary 
                           focus:outline-none focus:border-primary transition-all"
                  required
                />
                <select
                  value={eventForm.duration}
                  onChange={(e) => setEventForm(prev => ({ ...prev, duration: e.target.value }))}
                  className="px-4 py-2 bg-glass border border-primary/30 rounded-lg text-secondary 
                           focus:outline-none focus:border-primary transition-all"
                >
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                  <option value="60">1 hour</option>
                  <option value="120">2 hours</option>
                  <option value="240">4 hours</option>
                </select>
              </div>
              
              <textarea
                placeholder="Description (optional)"
                value={eventForm.description}
                onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
                className="w-full px-4 py-2 mb-4 bg-glass border border-primary/30 rounded-lg text-secondary 
                         placeholder-muted focus:outline-none focus:border-primary transition-all resize-none"
              />
              
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-400 to-green-600 
                           text-white rounded-lg hover:scale-105 transition-all"
                >
                  <Save className="w-4 h-4" />
                  {editingEventId ? 'Update' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingEvent(false);
                    setEditingEventId(null);
                    setEventForm({
                      title: '',
                      date: new Date().toISOString().split('T')[0],
                      time: '',
                      duration: '30',
                      type: 'personal',
                      description: ''
                    });
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white 
                           rounded-lg hover:scale-105 transition-all"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calendar */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-secondary">{monthName}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-1 rounded-full hover:bg-glass-hover transition-all"
                  >
                    <ChevronLeft className="w-4 h-4 text-muted" />
                  </button>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-1 rounded-full hover:bg-glass-hover transition-all"
                  >
                    <ChevronRight className="w-4 h-4 text-muted" />
                  </button>
                </div>
              </div>

              <div className="calendar-grid text-center text-sm">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 font-semibold text-muted">
                    {day}
                  </div>
                ))}
                
                {days.map((date, index) => (
                  <button
                    key={index}
                    onClick={() => date && setSelectedDate(date)}
                    className={`p-2 rounded-lg transition-all hover:bg-glass-hover relative ${
                      !date ? 'invisible' : ''
                    } ${
                      isToday(date) ? 'bg-gradient-to-r from-primary to-primary-dark text-white font-bold' : ''
                    } ${
                      isSelected(date) && !isToday(date) ? 'bg-glass-hover font-semibold' : ''
                    }`}
                  >
                    {date?.getDate()}
                    {hasEvents(date) && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Events List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-secondary">
                  Events for {selectedDate.toLocaleDateString()}
                </h3>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto">
                {selectedDateEvents.map(event => (
                  <div key={event.id} 
                       className="flex items-start gap-4 p-4 bg-glass rounded-lg 
                                hover:bg-glass-hover transition-all group">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getEventTypeColor(event.type)}`} />
                      <Clock className="w-4 h-4 text-primary" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-secondary truncate">{event.title}</h4>
                      <p className="text-sm text-muted">{event.duration} min • {event.type}</p>
                      {event.description && (
                        <p className="text-sm text-muted mt-1">{event.description}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="font-bold text-primary orbitron">{event.time}</p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(event)}
                          className="p-1 bg-primary text-white rounded hover:scale-110 transition-all"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="p-1 bg-red-500 text-white rounded hover:scale-110 transition-all"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedDateEvents.length === 0 && (
                <div className="text-center py-8 text-muted">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No events scheduled for this day</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Calculator Widget */}
      <div className="xl:col-span-1">
        <Calculator />
      </div>
    </div>
  );
};

export default SchedulePanel;