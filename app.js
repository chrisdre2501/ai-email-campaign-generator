async function generateCampaign() {
  const product  = document.getElementById('product').value.trim();
  const audience = document.getElementById('audience').value.trim();
  const goal     = document.getElementById('goal').value;
  const tone     = document.getElementById('tone').value;
  const apiKey   = document.getElementById('apikey').value.trim();

  if (!product || !audience || !apiKey) {
    alert('Please fill in product, audience, and your API key.');
    return;
  }

  document.getElementById('loading').classList.remove('hidden');
  document.getElementById('loading').textContent = '⟳ Researching product online...';
  document.getElementById('output').classList.add('hidden');
  document.getElementById('generate').disabled = true;

  const prompt = `You are an expert email marketing copywriter for collectibles and high-end products.

First, search the web for current information about this product: "${product}"

Look for:
- Current market prices and recent sales
- Collector reviews and community reactions
- Social media sentiment and buzz
- Any unique features fans specifically praise
- Rarity, condition notes, or special edition details

Then use everything you find to write a highly specific, compelling email campaign.
Avoid generic collector language — use real details that only someone who researched
this specific product would know.

Campaign details:
- Product: ${product}
- Target Audience: ${audience}
- Campaign Goal: ${goal}
- Brand Tone: ${tone}

You MUST return your response using EXACTLY these section headers with EXACTLY this formatting — each header on its own line in all caps followed by a colon:

RESEARCH SUMMARY:
[2-3 sentences on what you found about this product online]

SUBJECT LINE:
[One compelling subject line under 50 characters using a specific detail]

PREVIEW TEXT:
[80-100 characters of preview text with a specific hook]

EMAIL BODY:
[Full email using real product details, specific features fans love, current market context, and authentic collector language]

CALL TO ACTION:
[One specific CTA under 5 words]`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1500,
        tools: [
          {
            type: 'web_search_20250305',
            name: 'web_search'
          }
        ],
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    console.log('RAW API RESPONSE:', data);

    if (data.error) {
      alert('API Error: ' + data.error.message);
      return;
    }

    const text = data.content
      .map(block => block.type === 'text' ? block.text : '')
      .filter(Boolean)
      .join('\n');

    console.log('FULL RESPONSE TEXT:', text);

    if (!text) {
      alert('No text response received. Check console for details.');
      return;
    }

    const extract = (label, nextLabel) => {
      const upperText = text.toUpperCase();
      const upperLabel = label.toUpperCase();
      const start = upperText.indexOf(upperLabel);
      if (start === -1) return '(not found)';
      const content = text.slice(start + label.length).replace(/^[\s:]+/, '');
      if (!nextLabel) return content.trim();
      const upperContent = content.toUpperCase();
      const end = upperContent.indexOf(nextLabel.toUpperCase());
      return content.slice(0, end === -1 ? content.length : end).trim();
    };

    document.getElementById('research').textContent = extract('RESEARCH SUMMARY:', 'SUBJECT LINE:');
    document.getElementById('subject').textContent  = extract('SUBJECT LINE:', 'PREVIEW TEXT:');
    document.getElementById('preview').textContent  = extract('PREVIEW TEXT:', 'EMAIL BODY:');
    document.getElementById('body').textContent     = extract('EMAIL BODY:', 'CALL TO ACTION:');
    document.getElementById('cta').textContent      = extract('CALL TO ACTION:', null);

    document.getElementById('output').classList.remove('hidden');

  } catch (err) {
    alert('Error: ' + err.message);
    console.error(err);
  } finally {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('generate').disabled = false;
  }
}

function copyAll() {
  const research = document.getElementById('research').textContent;
  const subject  = document.getElementById('subject').textContent;
  const preview  = document.getElementById('preview').textContent;
  const body     = document.getElementById('body').textContent;
  const cta      = document.getElementById('cta').textContent;
  const full = `RESEARCH SUMMARY:\n${research}\n\nSUBJECT LINE:\n${subject}\n\nPREVIEW TEXT:\n${preview}\n\nEMAIL BODY:\n${body}\n\nCALL TO ACTION:\n${cta}`;
  navigator.clipboard.writeText(full).then(() => alert('Copied to clipboard!'));
}