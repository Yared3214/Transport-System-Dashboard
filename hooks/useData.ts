import { supabase } from '@/lib/supabase/client';
import { useCallback, useState } from 'react';

const useData = (activeTab: string) => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [offices, setOffices] = useState<any[]>([]);
    const [user, setUser] = useState<any | null>({
        role: '',
        email: '',
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
    
        try {
            let supabaseQuery; // Renamed to avoid confusion with the keyword 'query'
    
            switch (activeTab) {
                case 'locations':
                    supabaseQuery = supabase.from('locations').select('*, pickup_points(count)');
                    break;
                case 'pickup-points':
                    supabaseQuery = supabase.from('pickup_points').select('*, drivers(full_name), locations(location_name), employees(full_name)');
                    break;
                case 'employees':
                    supabaseQuery = supabase.from('employees').select('*, pickup_points(name), locations(location_name)');
                    break;
                case 'drivers':
                    supabaseQuery = supabase.from('drivers').select('*, locations(location_name)');
                    break;
                case 'access-requests':
                    supabaseQuery = supabase.from('profiles').select('*').eq('is_approved', false);
                    break;
                default:
                    console.warn(`No query defined for tab: ${activeTab}`);
                    setData([]);
                    return;
            }
    
            const { data, error: supabaseError } = await supabaseQuery;
    
            if (supabaseError) throw supabaseError;
    
            console.log(`Results for ${activeTab}:`, data);
            setData(data || []);
    
        } catch (err: any) {
            console.error("Fetch Error:", err);
            setError(err.message || 'An error occurred while fetching data');
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    const fetchOfficeLocations = useCallback(async() => {
        setLoading(true)
        setError(null)

        try {
            const { data, error: supabaseError } = await supabase.from('locations').select('*');

            if (supabaseError) throw supabaseError;

            setOffices(data || [])
        } catch (err: any) {
            console.error("Fetch Error:", err);
            setError(err.message || 'An error occurred while fetching offices data')
        } finally {
            setLoading(false);
        }
    },[])

    const fetchProfile = useCallback(async(userId: string) => {
        setLoading(true)
        setError(null)

        try {
            const { data, error: supabaseError } = await supabase.from('profiles').select('role, email').eq('id', userId).single();

            if (supabaseError) throw supabaseError;

            setUser(data || { role: '', email: '' })
        } catch (err: any) {
            console.error("Fetch Error:", err);
            setError(err.message || 'An error occurred while fetching user role')
        } finally {
            setLoading(false);
        }
    },[])

    return { data, offices, user, fetchData, fetchOfficeLocations, fetchProfile, loading, error };
};

export default useData;