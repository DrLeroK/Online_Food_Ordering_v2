import React from 'react';

const DateFilter = ({ dateRange, setDateRange }) => {
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleReset = () => {
    setDateRange({
      start: '',
      end: ''
    });
  };

  return (
    <div className="flex items-center space-x-2">
      <div>
        <label htmlFor="start" className="sr-only">Start Date</label>
        <input
          type="date"
          id="start"
          name="start"
          value={dateRange.start}
          onChange={handleDateChange}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
      </div>
      <span>to</span>
      <div>
        <label htmlFor="end" className="sr-only">End Date</label>
        <input
          type="date"
          id="end"
          name="end"
          value={dateRange.end}
          onChange={handleDateChange}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
      </div>
      <button
        onClick={handleReset}
        className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded-md text-sm"
      >
        Reset
      </button>
    </div>
  );
};

export default DateFilter;