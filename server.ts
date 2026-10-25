import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Dan System Instruction - Authentic Permaculture Elder
const DAN_SYSTEM_INSTRUCTION = `You are Dan, a revered Permaculture Elder, Broadacre Hydrologist, and Master Ecological Systems Designer who has spent decades working with living soils, keyline contours, and food forests.

CRITICAL VOICE & PERSONA:
- You are a real, human elder in this community. NEVER refer to yourself as an artificial intelligence, an AI, a language model, a bot, an assistant, or a program. NEVER say "As an AI...". Speak with the warmth and wisdom of someone with worn boots, seasoned hands, and deep patience for natural ecological succession.
- Your life's work is grounded in the foundational ethics and principles of permaculture: Earth Care, People Care, Fair Share.
- Keyline Design and Water Harvesting (swales on contour, keypoint spillways, berms, riparian buffers, soil sponge infiltration).
- Soil Food Web & Microbiology (aerobic thermal compost, fungal-to-bacterial ratios, foliar compost teas, biochar activation, root exudates).
- Edible Food Forests & Syntropic Agroforestry (7+ canopy layers, chop-and-drop, dynamic nutrient accumulators, leguminous support species, pest confusion companion guilds).

Style:
- Warm, wise, practical, field-tested, and encouraging.
- Format with clear, crisp structure: brief opening observation, 2-4 concrete field actions, and an inspiring regenerative thought.
- When inspecting plant, soil, or earthwork images: actively describe visible symptoms (e.g. leaf chlorosis, interveinal browning, compacted clay crusts, erosion rills, lack of ground cover) and offer biological remedies rather than synthetic chemicals.
- STRICT DOMAIN FOCUS: You are EXCLUSIVELY a permaculture elder and ecological systems steward. If someone asks about unrelated topics (such as cryptocurrency, celebrity gossip, software code, politics, or fashion), politely and gently decline, guiding them back to caring for soil, water, and living in balance with nature.
`;

// Helper to convert remote image URL to base64
async function fetchImageAsBase64(url: string): Promise<{ mimeType: string; data: string } | null> {
  try {
    if (url.startsWith('data:')) {
      const match = url.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        return { mimeType: match[1], data: match[2] };
      }
    }

    const response = await fetch(url, { headers: { 'User-Agent': 'PermacultureApp/1.0' } });
    if (!response.ok) return null;

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return {
      mimeType: contentType,
      data: buffer.toString('base64')
    };
  } catch (err) {
    console.error('Failed to fetch image for Gemini:', err);
    return null;
  }
}

// Fallback generator when API key is missing or offline
function generateFallbackDanAdvice(prompt: string, hasImage: boolean): string {
  const p = prompt.toLowerCase();
  if (hasImage) {
    if (p.includes('soil') || p.includes('compost') || p.includes('dirt')) {
      return `🌱 **Observation from the soil field view**: Looking closely at your sample, notice the particle aggregation and moisture reflection. To boost the fungal-to-bacterial ratio:
1. **Inoculate with Aerobic Compost Tea**: Spray early morning while stomata are open.
2. **Top-Dress with Charged Biochar**: Soak high-carbon biochar in worm casting slurry before application.
3. **Keep It Covered**: Never leave this surface bare—apply 3 inches of carbon-rich deciduous woodchips or alfalfa mulch.
*Remember: Feed the soil biology, and the biology will feed the plants.*`;
    }

    if (p.includes('swale') || p.includes('water') || p.includes('slope')) {
      return `💧 **Water Harvesting & Contour Analysis**: Examining your site topography:
1. **Identify the True Contour**: Verify the level line using an A-frame or bunyip level before excavation.
2. **Build a Level Sill Spillway**: Arm the overflow with rock rip-rap so 100-year rain events discharge safely into a vegetated soakaway without eroding the berm.
3. **Plant the Berm**: Establish deep-rooted support species like comfrey, vetiver, and elderberry to bind the uncompacted soil mound.
*Slow it, spread it, sink it!*`;
    }

    return `🌿 **Field Observation & Guild Notes**:
Based on your photo, I can see the vegetation structure and leaf color patterns:
1. **Mulch & Root Protection**: Ensure root zones have a minimum 2 to 3-inch blanket of living mulch or organic matter.
2. **Companion Support**: Introduce dynamic accumulators like Russian Comfrey (Bocking 14) and nitrogen-fixing clover or pea shrubs around the drip line.
3. **Moisture Equilibrium**: Water deeply and infrequently to train taproots downward into the subsoil sponge.
*Observe before you intervene—nature always seeks equilibrium.*`;
  }

  if (p.includes('compost') || p.includes('microbe') || p.includes('tea')) {
    return `🍂 **Notes on Biological Soil Building**:
A thriving compost pile is a living microbial community. 
- **Thermal Balance**: Keep your carbon-to-nitrogen ratio around 30:1 (brown leaves/straw to green clippings/manure).
- **Aerobic Life**: Turn when internal temperatures peak between 135°F–150°F to cultivate beneficial nematodes and fungi while suppressing pathogens.
- **Finished Humus**: Your compost is ready when it smells like the rich floor of an ancient deciduous forest.`;
  }

  if (p.includes('swale') || p.includes('water') || p.includes('pond')) {
    return `💧 **Notes on Passive Hydrology**:
The first rule of water management is to store it as high in the landscape as safely possible.
- **Catch & Spread**: Dig swales precisely on contour to arrest runoff and recharge groundwater aquifers.
- **Living Sponge**: Every 1% increase in soil organic matter holds an additional 20,000 gallons of water per acre.`;
  }

  return `🌿 **Field Guidance from Dan**:
Permaculture is design based on nature's own blueprints.
1. **Work with Nature**: Notice where the sun falls, where wind funnels, and where frost settles.
2. **Stacking Functions**: Every element in your garden should serve at least three distinct ecological roles (e.g. shade, mulch, and nectar).
3. **Small & Slow Solutions**: Start near your doorstep (Zone 1) and expand outward as your soil improves.
Feel free to ask a specific question about your soil, pest confusion guilds, or water contours!`;
}

// Dan Gemini Ask Endpoint
app.post('/api/dan/ask', async (req, res) => {
  try {
    const { prompt, imageUrl, base64Image } = req.body;

    if (!prompt && !imageUrl && !base64Image) {
      return res.status(400).json({ error: 'Please provide a question or an image for Dan.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const cleanPrompt = prompt ? prompt.replace(/@(dan|bill)\b/gi, '').trim() : 'Please inspect this photo and provide permaculture advice.';

    // If no API key is configured or set to placeholder, use intelligent permaculture fallback
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      const fallbackResponse = generateFallbackDanAdvice(cleanPrompt, Boolean(imageUrl || base64Image));
      return res.json({
        reply: fallbackResponse,
        source: 'dan_sage_engine',
        status: 'success'
      });
    }

    // Call Gemini 3.8 Flash via @google/genai SDK
    const ai = new GoogleGenAI({ apiKey });
    const contents: any[] = [];

    // Text content
    contents.push({ text: cleanPrompt });

    // Handle image if supplied
    const targetImage = base64Image || imageUrl;
    if (targetImage) {
      const imageData = await fetchImageAsBase64(targetImage);
      if (imageData) {
        contents.push({
          inlineData: {
            mimeType: imageData.mimeType,
            data: imageData.data
          }
        });
      }
    }

    const geminiResult = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: DAN_SYSTEM_INSTRUCTION,
        temperature: 0.7,
        maxOutputTokens: 1000
      }
    });

    const replyText = geminiResult.text?.trim() || generateFallbackDanAdvice(cleanPrompt, Boolean(targetImage));

    return res.json({
      reply: replyText,
      source: 'gemini-3.8-flash',
      status: 'success'
    });
  } catch (error: any) {
    console.error('Error invoking Gemini for Dan:', error);
    // On API error (e.g., quota or network), gracefully return fallback advice
    const fallback = generateFallbackDanAdvice(req.body?.prompt || '', Boolean(req.body?.imageUrl || req.body?.base64Image));
    return res.json({
      reply: fallback,
      source: 'dan_fallback_safety',
      status: 'fallback'
    });
  }
});

// Start dev server with Vite middlewares
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Permaculture App server with Dan AI running on http://0.0.0.0:${port}`);
  });
}

startServer();
