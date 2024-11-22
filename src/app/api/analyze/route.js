import { OpenAIStream } from 'ai';

if (!process.env.MISTRAL_API_KEY) {
  throw new Error('Missing MISTRAL_API_KEY environment variable');
}

export const runtime = 'edge';

export async function POST(req) {
  const { url } = await req.json();

  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'mistral-tiny',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at analyzing websites. Analyze the provided URL for Performance, SEO, Accessibility, Best Practices, and Security. Consider factors like load time, mobile responsiveness, meta tags, HTTPS, and more. Provide realistic scores.',
        },
        {
          role: 'user',
          content: `Analyze "${url}" and generate website metrics in this exact JSON format: [{"name": "Performance", "value": number between 0-100}, {"name": "SEO", "value": number between 0-100}, {"name": "Accessibility", "value": number between 0-100}, {"name": "Best Practices", "value": number between 0-100}, {"name": "Security", "value": number between 0-100}]. Only respond with the JSON.`,
        },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    return new Response(
      JSON.stringify({ error: 'Failed to analyze website' }), 
      { status: response.status }
    );
  }

  const data = await response.json();
  return new Response(JSON.stringify(data.choices[0].message.content), {
    headers: { 'Content-Type': 'application/json' },
  });
}
