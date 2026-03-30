import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Calendar, RefreshCw } from 'lucide-react';

interface TimezoneOption {
  value: string;
  label: string;
}

const TIMEZONE_OPTIONS: TimezoneOption[] = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'New York (EST/EDT)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
];

const TimezoneConverter: React.FC = () => {
  const [selectedTimezones, setSelectedTimezones] = useState<string[]>(['UTC', 'Asia/Shanghai']);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [meetingTime, setMeetingTime] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const addTimezone = () => {
    if (selectedTimezones.length < 5) {
      const available = TIMEZONE_OPTIONS.map(tz => tz.value).filter(tz => !selectedTimezones.includes(tz));
      if (available.length > 0) {
        setSelectedTimezones([...selectedTimezones, available[0]]);
      }
    }
  };

  const removeTimezone = (timezone: string) => {
    if (selectedTimezones.length > 1) {
      setSelectedTimezones(selectedTimezones.filter(tz => tz !== timezone));
    }
  };

  const formatTimeForTimezone = (date: Date, timezone: string): string => {
    try {
      return date.toLocaleString('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    } catch (error) {
      return 'Invalid timezone';
    }
  };

  const handleMeetingTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMeetingTime(e.target.value);
  };

  const convertMeetingTime = (): Date | null => {
    if (!meetingTime) return null;
    const [datePart, timePart] = meetingTime.split('T');
    if (!datePart || !timePart) return null;
    
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);
    
    return new Date(year, month - 1, day, hour, minute);
  };

  const meetingDate = convertMeetingTime();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">🌍 Timezone Converter</h1>
      
      {/* Current Time Display */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Clock className="mr-2" size={20} />
          Current Time Across Timezones
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedTimezones.map((tz) => {
            const option = TIMEZONE_OPTIONS.find(opt => opt.value === tz);
            return (
              <div key={tz} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{option?.label || tz}</h3>
                  <button 
                    onClick={() => removeTimezone(tz)}
                    className="text-red-500 hover:text-red-700"
                    disabled={selectedTimezones.length <= 1}
                  >
                    ×
                  </button>
                </div>
                <p className="text-lg font-mono">
                  {formatTimeForTimezone(currentTime, tz)}
                </p>
              </div>
            );
          })}
        </div>
        
        {selectedTimezones.length < 5 && (
          <button
            onClick={addTimezone}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Add Timezone
          </button>
        )}
      </div>

      {/* Meeting Time Converter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Calendar className="mr-2" size={20} />
          Meeting Time Converter
        </h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Enter meeting time (your local time):
          </label>
          <input
            type="datetime-local"
            value={meetingTime}
            onChange={handleMeetingTimeChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
          />
        </div>
        
        {meetingDate && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">Meeting time in selected timezones:</h3>
            <div className="space-y-2">
              {selectedTimezones.map((tz) => {
                const option = TIMEZONE_OPTIONS.find(opt => opt.value === tz);
                return (
                  <div key={`meeting-${tz}`} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <span>{option?.label || tz}</span>
                    <span className="font-mono">
                      {formatTimeForTimezone(meetingDate, tz)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>Compare times across different timezones and plan your meetings effectively.</p>
      </div>
    </div>
  );
};

export default TimezoneConverter;