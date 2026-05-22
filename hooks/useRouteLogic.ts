import { useRouteStore } from '@/store/useRouteStore';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { sendRouteToTelegram } from '@/lib/telegram';
import { useCallback } from 'react';

export const useRouteLogic = (id: string, isEdit: boolean) => {
  const router = useRouter();
  const { 
    setLoading, setFormData, setDriverIds,
    setSelectedIds, setSaving, setSendingTelegram,
    formData, selectedIds, allDrivers, allEmployees 
  } = useRouteStore();

  // 1. Initial Data Loader
  const loadData = useCallback(async () => {
    setLoading(true);

    const drivIdRes = await supabase.from('pickup_points').select('driver_id');

    if (drivIdRes.data) {
      setDriverIds(drivIdRes.data);
    }

    if (isEdit) {
      const { data: pickup } = await supabase
        .from('pickup_points')
        .select(`*, employees(id)`)
        .eq('id', id)
        .single();

      if (pickup) {
        setFormData({
          name: pickup.name,
          location_id: pickup.location_id,
          driver_id: pickup.driver_id,
          type: pickup.type,
          shift: pickup.shift,
          time: pickup.time,
          overtime_type: pickup.overtime_type
        });
        setSelectedIds(pickup.employees.map((e: any) => e.id));
      }
    }
    setLoading(false);
  },[id, isEdit, setLoading, setDriverIds, setFormData, setSelectedIds]);

  // 2. Finalize (Save) Logic
  const handleFinalize = async () => {
    setSaving(true);
    const { data: pickup, error: pError } = await supabase
      .from('pickup_points')
      .upsert({
        ...(isEdit ? { id } : {}),
        ...formData
      })
      .select().single();

    if (pError) {
      console.error(pError);
      setSaving(false);
      return;
    }

    // Clear and Re-assign
    await supabase.from('employees').update({ pickup_id: null }).eq('pickup_id', pickup.id);
    if (selectedIds.length > 0) {
      await supabase.from('employees').update({ pickup_id: pickup.id }).in('id', selectedIds);
    }

    setSaving(false);
    router.push('/');
  };

  // 3. Telegram Logic
  const handleTelegramBroadcast = async () => {
    setSendingTelegram(true);
    const driver = allDrivers.find(d => d.id === formData.driver_id);
    const staffNames = allEmployees
      .filter(e => selectedIds.includes(e.id))
      .map(s => s.full_name);

    const success = await sendRouteToTelegram({
      routeName: formData.name || "Unnamed Route",
      driverName: driver?.full_name || "Unassigned",
      staffNames,
      ...formData
    });

    alert(success ? "🚀 Broadcasted!" : "❌ Failed!");
    setSendingTelegram(false);
  };

  return { loadData, handleFinalize, handleTelegramBroadcast };
};