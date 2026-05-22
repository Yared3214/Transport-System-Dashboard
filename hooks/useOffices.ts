import { supabase } from '@/lib/supabase/client';
import { useOfficesStore } from '@/store/useOfficesStore';
import { useCallback, useState } from 'react';

const useOffices = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const { setOffices } = useOfficesStore();

    const fetchOffices = useCallback(async () => {
        setLoading(true);
        setError(null);
    
        try {
            const { data, error: supabaseError } = await supabase.from('locations').select('*, pickup_points(count)');
    
            if (supabaseError) throw supabaseError;

            setOffices(data);
    
        } catch (err: any) {
            console.error("Fetch Error:", err);
            setError(err.message || 'An error occurred while fetching data');
        } finally {
            setLoading(false);
        }
    }, [setOffices]);

    return { fetchOffices, loading, error };
};

export default useOffices;