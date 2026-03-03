import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { discordUsername, minecraftUsername, eventType, availability, additionalInfo } = await req.json();

    const webhookUrl = Deno.env.get('DISCORD_WEBHOOK_URL');
    
    if (!webhookUrl) {
      throw new Error('Discord webhook URL not configured');
    }

    const message = {
      content: `🎮 **New Event Application Received!**\n\n**Discord Username:** ${discordUsername}\n**Minecraft Username:** ${minecraftUsername}\n**Event Type:** ${eventType}\n**Availability:** ${availability}\n**Additional Info:** ${additionalInfo || 'N/A'}`,
    };

    const discordResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!discordResponse.ok) {
      const errorText = await discordResponse.text();
      throw new Error(`Discord API error: ${discordResponse.status}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Application submitted to Discord' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});