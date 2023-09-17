import { useState } from 'react';

export default function Search({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchTerm = (event) => {
    const searchedTerm = event.target.value;

    if (searchedTerm.length === 0) {
      setSearchTerm(searchedTerm);
      onSearch(searchTerm);
    }
  };

  return (
    <div className="flex justify-center mt-6 mb-4">
      <input
        id="search"
        className="text-gray-500 border border-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-0 focus:border-2 focus:-m-0.5 focus:px-2 focus:py-1.5 hover:border-emerald-500 placeholder-gray-500 rounded px-2 py-1.5"
        type='text'
        onChange={handleSearchTerm}
        onKeyDown={(event) => {
          if ((event.key === "Enter")) {
            if (event.target.value.length > 0) {
              onSearch(event.target.value)
            }
          }
        }}
        placeholder='search posts'
      />
    </div>
  );
}   
