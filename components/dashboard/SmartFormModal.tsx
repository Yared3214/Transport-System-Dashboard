import { Building2, MapPin, Save, Truck, Users, X } from "lucide-react";
import { FormInput } from "./FormInput";
import { FormSelect } from "./FormSelect";
import { useState } from "react";

export const SmartFormModal = ({ 
  type, 
  isOpen, 
  onClose, 
  initialData, 
  offices, 
  onSave, }: any) => {
  const [formData, setFormData] = useState<any>(initialData || {});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
  
    // Location Validation
    if (type === 'location') {
      if (!formData.location_name) newErrors.location_name = "Office name is required";
      if (!formData.address) newErrors.address = "Physical address is required";
    }
  
    // Employee Validation
    if (type === 'employee') {
      if (!formData.full_name) newErrors.full_name = "Employee name is required";
      if (!formData.location_id) newErrors.location_id = "Please select a work office";
    }
  
    // Driver Validation
    if (type === 'driver') {
      if (!formData.full_name) newErrors.full_name = "Legal name is required";
      if (!formData.location_id) newErrors.location_id = "An office assignment is required";
      if (!formData.phone_number) {
        newErrors.phone_number = "Phone number is required";
      } else if (!/^\+?[0-9]{10,14}$/.test(formData.phone_number)) {
        newErrors.phone_number = "Enter a valid phone number (e.g. +251...)";
      }
    }
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Update internal state when input changes
  const handleChange = (key: string, value: any) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    // Map UI keys to your DB Column names
    let payload = {};
    if (type === 'location') payload = { location_name: formData.location_name, address: formData.address };
    if (type === 'driver') payload = { full_name: formData.full_name, phone_number: formData.phone_number, location_id: formData.location_id };
    if (type === 'employee') payload = { full_name: formData.full_name, location_id: formData.location_id, pickup_id: formData.pickup_id };

    onSave(payload);
  };

  if (!isOpen) return null;
  const isEdit = !!initialData;
  const config = {
    location: { title: "Office Location", icon: <Building2 />, color: "text-emerald-400" },
    pickup: { title: "Pickup Point", icon: <MapPin />, color: "text-indigo-400" },
    employee: { title: "Employee", icon: <Users />, color: "text-purple-400" },
    driver: { title: "Driver", icon: <Truck />, color: "text-blue-400" },
  }[type as 'location' | 'pickup' | 'employee' | 'driver'];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#060608]/80 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-slate-950 border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-300">
        <div className="p-8 border-b border-slate-800 bg-slate-900/30 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl bg-slate-800 ${config.color}`}>{config.icon}</div>
            <div>
              <h3 className="text-xl font-bold text-white leading-tight">{isEdit ? `Edit ${config.title}` : `New ${config.title}`}</h3>
              <p className="text-xs text-slate-500 font-medium">Please fill in the required details below</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-white"><X size={20}/></button>
        </div>
        <form className="p-8 space-y-6" onSubmit={handleSubmit}>
          {type === 'location' && (
            <div className="space-y-4">
              <div>
              <FormInput 
              label="Office Name" 
              placeholder="e.g. HQ - Bole Road" 
              defaultValue={initialData?.location_name} 
              onChange={(e: any) => {
                handleChange('location_name', e.target.value);
                if (errors.location_name) setErrors({...errors, location_name: ''});
              }}/>
              <ErrorMessage message={errors.location_name} />
              </div>

              <div>
              <FormInput 
              label="Physical Address" 
              placeholder="Street, Building, Floor" 
              defaultValue={initialData?.address} 
              onChange={(e: any) => {
                handleChange('address', e.target.value);
                if (errors.address) setErrors({...errors, address: ''});
              }}/>
              <ErrorMessage message={errors.address} />
              </div>
            </div>
          )}

          {type === 'employee' && (
            <div className="space-y-4">
              <div>
              <FormInput 
              label="Full Name" 
              placeholder="Enter employee name" 
              defaultValue={initialData?.full_name}
              onChange={(e: any) => {
                handleChange('full_name', e.target.value);
                if (errors.full_name) setErrors({...errors, full_name: ''})
                }} />
              <ErrorMessage message={errors.full_name} />
              </div>

              <div>
              <FormSelect 
              label="Work Office" 
              options={offices} 
              defaultValue={initialData?.location_id}
              onChange={(e: any) => {
                handleChange('location_id', e.target.value);
                if (errors.location_id) setErrors({...errors, location_id: ''})
                }}/>
              <ErrorMessage message={errors.location_id} />
              </div>
            </div>
          )}
          {type === 'driver' && (
            <div className="space-y-4">
              <div>
                <FormInput 
                  label="Driver Name" 
                  defaultValue={initialData?.full_name} 
                  onChange={(e: any) => {
                    handleChange('full_name', e.target.value);
                    if (errors.full_name) setErrors({...errors, full_name: ''});
                  }}
                />
                <ErrorMessage message={errors.full_name} />
              </div>

              <div>
                <FormInput 
                  label="Phone Number" 
                  placeholder="+251 ..." 
                  defaultValue={initialData?.phone_number} 
                  onChange={(e: any) => {
                    handleChange('phone_number', e.target.value);
                    if (errors.phone_number) setErrors({...errors, phone_number: ''});
                  }}
                />
                <ErrorMessage message={errors.phone_number} />
              </div>

              <div>
                <FormSelect 
                  label="Assigned Office Destination" 
                  options={offices} 
                  defaultValue={initialData?.location_id}
                  onChange={(e: any) => {
                    handleChange('location_id', e.target.value);
                    if (errors.location_id) setErrors({...errors, location_id: ''});
                  }}
                />
                <ErrorMessage message={errors.location_id} />
              </div>
              
            </div>
          )}
          <div className="pt-4 flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-2xl font-bold text-sm border border-slate-800">Cancel</button>
            <button type="submit" className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-sm shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2"><Save size={18}/>{isEdit ? 'Update' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ErrorMessage = ({ message }: { message?: string }) => {
  if (!message) return null;
  return (
    <div className="flex items-center gap-2 mt-1.5 px-1 animate-in slide-in-from-top-1 duration-200">
      <div className="w-1 h-1 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
      <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
        {message}
      </span>
    </div>
  );
};