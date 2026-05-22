import { supabase } from '@/lib/supabase/client';
import { useDriversStore } from '@/store/useDriversStore';
import { useCallback, useState } from 'react';

const useDrivers = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const { setDrivers } = useDriversStore();

    const fetchDrivers = useCallback(async () => {
        setLoading(true);
        setError(null);
    
        try {
            const { data, error: supabaseError } = await supabase.from('drivers').select('*, locations(location_name)');
    
            if (supabaseError) throw supabaseError;

            setDrivers(data);
    
        } catch (err: any) {
            console.error("Fetch Error:", err);
            setError(err.message || 'An error occurred while fetching data');
        } finally {
            setLoading(false);
        }
    }, [setDrivers]);

    return { fetchDrivers, loading, error };
};

export default useDrivers;