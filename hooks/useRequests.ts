import { supabase } from '@/lib/supabase/client';
import { useRequestsStore } from '@/store/useRequestsStore';
import { useCallback, useState } from 'react';

const useRequests = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const { setRequests } = useRequestsStore();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
    
        try {
            const { data, error: supabaseError } = await supabase.from('profiles').select('*').eq('is_approved', false);
    
            if (supabaseError) throw supabaseError;

            setRequests(data);
    
        } catch (err: any) {
            console.error("Fetch Error:", err);
            setError(err.message || 'An error occurred while fetching data');
        } finally {
            setLoading(false);
        }
    }, [setRequests]);

    const approveRequest = async(id: string) => {
        setError(null);
        try {
            const { error } = await supabase
              .from('profiles')
              .update({ is_approved: true, role: 'admin' }) // Or 'driver' based on your choice
              .eq('id', id);
        
            if (error) {
              throw new Error(error.message || 'Failed to approve request. Please try again.');
            }
        } catch (err: any) {
            console.error("Approval Error:", err);
            setError(err.message);
        }
    } 

    return { fetchData, approveRequest, loading, error };
};

export default useRequests;