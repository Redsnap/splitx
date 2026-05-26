export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { base64, mediaType } = req.body;
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [
            { inline_data: { mime_type: mediaType || 'image/jpeg', data: base64 } },
            { text: 'Extract all purchased line items and the purchase date from this receipt or order. Return ONLY a JSON object, no markdown, no backticks. Format: {"date":"YYYY-MM-DD or empty string if not found","items":[{"name":"item name","price":unit_price_number,"qty":quantity_integer}]}. Unit price not line total. Default qty=1. Exclude subtotals, taxes, fees, discounts, delivery, tips, totals.' }
          ]}]
        })
      }
    );
    const data = await response.json();
    console.log('Gemini status:', response.status);
    console.log('Gemini data:', JSON.stringify(data).slice(0, 500));
    res.status(200).json(data);
  } catch(err) {
    console.error('Error:', err.message);
    res.status(500).json({ error: err.message });
  }
}