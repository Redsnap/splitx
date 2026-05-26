export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { base64, mediaType } = req.body;
  try {
    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-4-scout-17b-16e-instruct',
          messages: [{
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: `data:${mediaType};base64,${base64}` } },
              { type: 'text', text: 'Extract all purchased line items and the purchase date from this receipt or order. Return ONLY a JSON object, no markdown, no backticks. Format: {"date":"YYYY-MM-DD or empty string if not found","items":[{"name":"item name","price":unit_price_number,"qty":quantity_integer}]}. Unit price not line total. Default qty=1. Exclude subtotals, taxes, fees, discounts, delivery, tips, totals.' }
            ]
          }],
          max_tokens: 1000
        })
      }
    );
    const data = await response.json();
    console.log('Groq response:', JSON.stringify(data).slice(0, 500));
    const text = data.choices?.[0]?.message?.content || '';
    const parsed = JSON.parse(text.replace(/```json|```/g,'').trim());
    res.status(200).json({ candidates: [{ content: { parts: [{ text: JSON.stringify(parsed) }] } }] });
  } catch(err) {
    console.error('Error:', err.message);
    res.status(500).json({ error: err.message });
  }
}