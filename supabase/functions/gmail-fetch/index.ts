import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailMessage {
  id: string;
  threadId: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  date: string;
  headers: Record<string, string>;
  snippet: string;
}

function decodeBase64Url(str: string): string {
  try {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
    return atob(padded);
  } catch {
    return str;
  }
}

function extractHeader(headers: any[], name: string): string {
  const header = headers?.find((h: any) => h.name.toLowerCase() === name.toLowerCase());
  return header?.value || '';
}

function extractBody(payload: any): string {
  if (payload.body?.data) {
    return decodeBase64Url(payload.body.data);
  }
  
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return decodeBase64Url(part.body.data);
      }
    }
    for (const part of payload.parts) {
      if (part.mimeType === 'text/html' && part.body?.data) {
        // Strip HTML tags for plain text
        const html = decodeBase64Url(part.body.data);
        return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      }
    }
    // Check nested parts
    for (const part of payload.parts) {
      if (part.parts) {
        const nestedBody = extractBody(part);
        if (nestedBody) return nestedBody;
      }
    }
  }
  
  return '';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { accessToken, maxResults = 10, pageToken } = await req.json();

    if (!accessToken) {
      throw new Error('Access token required');
    }

    console.log('Fetching emails with maxResults:', maxResults);

    // Fetch list of messages
    let listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`;
    if (pageToken) {
      listUrl += `&pageToken=${pageToken}`;
    }

    const listResponse = await fetch(listUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!listResponse.ok) {
      const errorText = await listResponse.text();
      console.error('Gmail list error:', listResponse.status, errorText);
      throw new Error(`Failed to fetch emails: ${listResponse.status}`);
    }

    const listData = await listResponse.json();
    const messageIds = listData.messages || [];
    
    console.log('Found', messageIds.length, 'messages');

    // Fetch full message details for each
    const emails: EmailMessage[] = [];
    
    for (const msg of messageIds) {
      const msgResponse = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      
      if (!msgResponse.ok) {
        console.error('Failed to fetch message:', msg.id);
        continue;
      }
      
      const msgData = await msgResponse.json();
      const headers = msgData.payload?.headers || [];
      
      // Extract all relevant headers for security analysis
      const headerMap: Record<string, string> = {};
      for (const h of headers) {
        headerMap[h.name.toLowerCase()] = h.value;
      }

      const email: EmailMessage = {
        id: msgData.id,
        threadId: msgData.threadId,
        from: extractHeader(headers, 'From'),
        to: extractHeader(headers, 'To'),
        subject: extractHeader(headers, 'Subject'),
        body: extractBody(msgData.payload),
        date: extractHeader(headers, 'Date'),
        snippet: msgData.snippet || '',
        headers: {
          'return-path': headerMap['return-path'] || '',
          'reply-to': headerMap['reply-to'] || '',
          'received-spf': headerMap['received-spf'] || '',
          'dkim-signature': headerMap['dkim-signature'] || '',
          'authentication-results': headerMap['authentication-results'] || '',
          'x-originating-ip': headerMap['x-originating-ip'] || '',
          'message-id': headerMap['message-id'] || '',
        }
      };
      
      emails.push(email);
    }

    console.log('Successfully fetched', emails.length, 'full messages');

    return new Response(JSON.stringify({ 
      emails,
      nextPageToken: listData.nextPageToken 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Gmail fetch error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
