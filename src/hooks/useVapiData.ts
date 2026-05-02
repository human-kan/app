import { useState, useEffect, useCallback } from 'react';
import { db } from '../db';

const VAPI_PRIVATE_KEY = import.meta.env.VITE_VAPI_PRIVATE_KEY;

export interface VapiMetrics {
  totalCalls: number;
  appointmentsBooked: number;
  totalRevenueCaptured: number;
  revenueRecovered: number;
  potentialRevenueOpportunity: number;
  zeroTouchResolutionRate: number; 
  costOfService: number;
  monthlyRevenueGenerated: number;
  roiMultiple: number;
  afterHoursCalls: number;
  afterHoursBookings: number;
  afterHoursRevenue: number;
  missedCallsRecovered: number;
  staffTimeSavedHours: number;
  loading: boolean;
  error: string | null;
  callLogs: any[];
  avgClientValue: number;
  onDeleteCall?: (id: string) => void;
  onUpdateSentiment?: (id: string, sentiment: string) => void;
}

export function useVapiData(assistantId: string, avgClientValueStr: string) {
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [manualSentiments, setManualSentiments] = useState<Record<string, string>>({});

  const [data, setData] = useState<VapiMetrics>({
    totalCalls: 0,
    appointmentsBooked: 0,
    totalRevenueCaptured: 0,
    revenueRecovered: 0,
    potentialRevenueOpportunity: 0,
    zeroTouchResolutionRate: 0,
    costOfService: 500,
    monthlyRevenueGenerated: 0,
    roiMultiple: 0,
    afterHoursCalls: 0,
    afterHoursBookings: 0,
    afterHoursRevenue: 0,
    missedCallsRecovered: 0,
    staffTimeSavedHours: 0,
    loading: false,
    error: null,
    callLogs: [],
    avgClientValue: 350
  });

  // Sync state when assistantId changes
  useEffect(() => {
    const fetchOverrides = async () => {
      if (!assistantId) {
        setDeletedIds([]);
        setManualSentiments({});
        return;
      }
      
      try {
        const overrides = await db.getOverrides(assistantId);
        const deleted = overrides.filter(o => o.type === 'delete').map(o => o.call_id);
        const sentiments = overrides
          .filter(o => o.type === 'sentiment')
          .reduce((acc, o) => ({ ...acc, [o.call_id]: o.value }), {});
        
        setDeletedIds(deleted);
        setManualSentiments(sentiments);
      } catch (err) {
        console.error("Failed to fetch overrides:", err);
      }
    };
    
    fetchOverrides();
  }, [assistantId]);

  const onDeleteCall = useCallback(async (id: string) => {
    if (!assistantId) return;
    if (window.confirm("Are you sure you want to delete this call log? This will reset your calculated revenue and metrics.")) {
      setDeletedIds(prev => [...prev, id]);
      await db.addOverride(assistantId, id, 'delete', 'true');
    }
  }, [assistantId]);

  const onUpdateSentiment = useCallback(async (id: string, sentiment: string) => {
    if (!assistantId) return;
    setManualSentiments(prev => ({ ...prev, [id]: sentiment }));
    await db.addOverride(assistantId, id, 'sentiment', sentiment);
  }, [assistantId]);

  useEffect(() => {
    if (!assistantId) return;

    let isMounted = true;
    const clientValue = parseInt(avgClientValueStr) || 350;

    const fetchVapiAnalytics = async () => {
      setData(prev => ({ ...prev, loading: true, error: null, avgClientValue: clientValue }));
      
      try {
        const response = await fetch(`https://api.vapi.ai/call?assistantId=${assistantId}&limit=100`, {
          headers: { 'Authorization': `Bearer ${VAPI_PRIVATE_KEY}` }
        });

        if (!response.ok) throw new Error('Failed to connect to Vapi API. Check Assistant ID.');

        let callsData = await response.json();
        if (!isMounted) return;

        if (!callsData || !Array.isArray(callsData) || callsData.length === 0) {
          setData(prev => ({ ...prev, loading: false, error: 'No call history found for this account.' }));
          return;
        }

        // --- LOCAL FILTERING & OVERRIDES ---
        callsData = callsData.filter((c: any) => !deletedIds.includes(c.id));
        
        callsData = callsData.map((c: any) => {
          if (manualSentiments[c.id]) {
            return { ...c, manualSentiment: manualSentiments[c.id] };
          }
          return c;
        });

        const total = callsData.length;
        
        // --- REAL-TIME PARSING LOGIC ---
        let realBookings = 0;
        let ahCalls = 0;
        let ahBookings = 0;
        let totalDurationSeconds = 0;

        const bookingKeywords = ['booked', 'appointment', 'schedule', 'confirmed', 'set up', 'reserved', 'coming in', 'see you'];

        callsData.forEach((call: any) => {
          const start = call.startedAt ? new Date(call.startedAt).getTime() : 0;
          const end = call.endedAt ? new Date(call.endedAt).getTime() : 0;
          const callDurationSeconds = (start > 0 && end > start) ? (end - start) / 1000 : 0;
          totalDurationSeconds += callDurationSeconds;

          const mS = call.manualSentiment;
          let isBooking = false;

          if (mS) {
            // Strictly only 'Scheduled' counts as a booked appointment for revenue
            isBooking = mS === 'Scheduled';
          } else {
            const summary = (call.summary || '').toLowerCase();
            const transcript = (call.transcript || '').toLowerCase();
            const analysisSuccess = call.analysis?.successEvaluation === true || 
                                  call.analysis?.successEvaluation === 'true';
            
            isBooking = analysisSuccess || 
                        bookingKeywords.some(kw => summary.includes(kw)) ||
                        bookingKeywords.some(kw => transcript.includes(kw));
          }
          
          if (isBooking) realBookings++;

          const startTimeMatch = call.startedAt ? call.startedAt.match(/T(\d{2}):/) : null;
          if (startTimeMatch) {
            const hour = parseInt(startTimeMatch[1]);
            const isAH = hour < 8 || hour >= 17;
            if (isAH) {
              ahCalls++;
              if (isBooking) ahBookings++;
            }
          }
        });

        const totalRev = realBookings * clientValue;
        const cost = 500;
        const roi = cost > 0 ? parseFloat((totalRev / cost).toFixed(1)) : 0;
        const timeSavedHours = parseFloat((totalDurationSeconds / 3600).toFixed(1));
        const rawLogs = callsData.slice(0, 15);

        setData({
          totalCalls: total,
          appointmentsBooked: realBookings,
          totalRevenueCaptured: totalRev,
          revenueRecovered: realBookings * clientValue, 
          potentialRevenueOpportunity: total * clientValue,
          zeroTouchResolutionRate: 92, 
          costOfService: cost,
          monthlyRevenueGenerated: totalRev * 4,
          roiMultiple: roi,
          afterHoursCalls: ahCalls,
          afterHoursBookings: ahBookings,
          afterHoursRevenue: ahBookings * clientValue,
          missedCallsRecovered: realBookings,
          staffTimeSavedHours: timeSavedHours,
          loading: false,
          error: null,
          callLogs: rawLogs,
          avgClientValue: clientValue,
          onDeleteCall,
          onUpdateSentiment
        });

      } catch (err: any) {
        if (!isMounted) return;
        setData(prev => ({ ...prev, loading: false, error: err.message || 'Error pulling revenue data.' }));
      }
    };

    fetchVapiAnalytics();
    return () => { isMounted = false; };
  }, [assistantId, avgClientValueStr, deletedIds, manualSentiments, onDeleteCall, onUpdateSentiment]);

  return data;
}
