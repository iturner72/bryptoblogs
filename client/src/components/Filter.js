import { useState, useEffect } from 'react';
import Select from 'react-select';

export default function Filter({ onFilterChange, supabase }) {
  const [companyOptions, setCompanyOptions] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  
    const customStyles = {
        placeholder: (provided) => ({
            ...provided,
            color: '#64748b', // Tailwind's 'text-slate-500'
        }),
        control: (provided, state) => ({
            ...provided,
            borderColor: state.isFocused ? '#10b981' : '#94a3b8', // Tailwind's 'text-emerald-500' and 'text-slate-400'
            boxShadow: state.isFocused ? '0 0 0 1px #10b981' : '', // Tailwind's 'text-emerald-500'
            '&:hover': {
                borderColor: '#10b981' // Tailwind's 'text-emerald-500'
            }
        })
    };

  const handleOptionsChange = async (selectedOptions) => {
    const selectedValues = selectedOptions.map(option => option.value);
    setSelectedCompanies(selectedValues);
    onFilterChange(selectedValues.sort());
  };

  useEffect(() => {
    const fetchCompanies = async () => {
      let { data: companies, error } = await supabase
        .from('links')
        .select('company')
        .order('company', { ascending: true });

      if (error) {
        console.error('Error fetching companies:', error);
        return;
      }

      const formattedCompanies = companies.map(company => ({ value: company.company, label: company.company }));
      setCompanyOptions(formattedCompanies);
    };

    fetchCompanies();
  }, []);

  return (
    <div className="flex justify-center mt-6 mb-4">
      <Select
        instanceId="filter"
        options={companyOptions}
        onChange={handleOptionsChange}
        isMulti
        closeMenuOnSelect={false}
        controlShouldRenderValue={false}
        hideSelectedOptions={false}
        placeholder={selectedCompanies.length === 0 ? `filter by company` : selectedCompanies.length === 1 ? `${selectedCompanies.length} company selected` : `${selectedCompanies.length} companies selected`}
        styles={customStyles}
      />
    </div>
  );
}
