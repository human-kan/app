/**
 * vapiOutbound.ts
 * Triggers an outbound Vapi call to a prospect after they submit the lead form.
 * The agent will call their phone, qualify them, and book a calendar appointment.
 *
 * SECURITY NOTE: The private key is exposed via VITE_ prefix (client-side).
 * For production, move this call to a Supabase Edge Function.
 */

const VAPI_PRIVATE_KEY = import.meta.env.VITE_VAPI_PRIVATE_KEY as string;
const VAPI_PHONE_NUMBER_ID = import.meta.env.VITE_VAPI_PHONE_NUMBER_ID as string;
const VAPI_OUTBOUND_ASSISTANT_ID = import.meta.env.VITE_VAPI_OUTBOUND_ASSISTANT_ID as string;

interface OutboundCallParams {
  phoneNumber: string;   // prospect's phone number e.g. "+14155551234"
  businessName: string;  // passed to the agent as context
}

/**
 * Initiates an outbound call via Vapi.
 * Returns the call object on success, throws on failure.
 */
export async function triggerOutboundCall({ phoneNumber, businessName }: OutboundCallParams) {
  if (!VAPI_PRIVATE_KEY || !VAPI_PHONE_NUMBER_ID || !VAPI_OUTBOUND_ASSISTANT_ID) {
    console.warn('[Vapi Outbound] Missing env vars — skipping outbound call.');
    return null;
  }

  const response = await fetch('https://api.vapi.ai/call/phone', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VAPI_PRIVATE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      assistantId: VAPI_OUTBOUND_ASSISTANT_ID,
      phoneNumberId: VAPI_PHONE_NUMBER_ID,
      customer: {
        number: phoneNumber,
        name: businessName,
      },
      // Pass business name to the assistant as context
      assistantOverrides: {
        variableValues: {
          businessName,
          callerIntent: 'new_lead_booking',
        },
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Vapi outbound call failed: ${response.status} — ${errorBody}`);
  }

  return response.json();
}
