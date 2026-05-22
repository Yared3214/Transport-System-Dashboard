import { supabase } from '@/lib/supabase/client';
import { useEmployeesStore } from '@/store/useEmployeesStore';
import { useCallback, useState } from 'react';

const useEmployees = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const { setEmployees } = useEmployeesStore();

    const fetchEmployees = useCallback(async () => {
        setLoading(true);
        setError(null);
    
        try {
            const { data, error: supabaseError } = await supabase.from('employees').select('*, pickup_points(name), locations(location_name)');
    
            if (supabaseError) throw supabaseError;

            setEmployees(data);
    
        } catch (err: any) {
            console.error("Fetch Error:", err);
            setError(err.message || 'An error occurred while fetching data');
        } finally {
            setLoading(false);
        }
    }, [setEmployees]);

    return { fetchEmployees, loading, error };
};

export default useEmployees;