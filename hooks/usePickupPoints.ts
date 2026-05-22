import { supabase } from '@/lib/supabase/client';
import { usePickupPointsStore } from '@/store/usePickupPoints';
import { useCallback, useState } from 'react';

const usePickupPoints = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const { setPickupPoints } = usePickupPointsStore();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
    
        try {
            const { data, error: supabaseError } = await supabase.from('pickup_points').select('*, drivers(full_name), locations(location_name), employees(full_name)');
    
            if (supabaseError) throw supabaseError;

            setPickupPoints(data);
    
        } catch (err: any) {
            console.error("Fetch Error:", err);
            setError(err.message || 'An error occurred while fetching data');
        } finally {
            setLoading(false);
        }
    }, [setPickupPoints]);

    return { fetchData, loading, error };
};

export default usePickupPoints;