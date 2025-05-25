import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { latitude, longitude } = await request.json();

    // 1. Appel à l'API Spring Boot existante
    const springBootResponse = await fetch(`/ndvi/from-coords`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latitude, longitude }),
    });

    // 2. Lire la réponse comme texte brut
    const rawResponse = await springBootResponse.text();
    
    // 3. Parser la réponse textuelle en objet JSON
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(rawResponse);
    } catch (e) {
      // Fallback pour les réponses non-JSON valides
      parsedResponse = parseTextResponse(rawResponse);
    }

    // 4. Normaliser la structure des données
    const normalizedData = normalizeData(parsedResponse);

    return NextResponse.json(normalizedData);

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process NDVI data' },
      { status: 500 }
    );
  }
}

// Fonction pour parser les réponses textuelles non-JSON
function parseTextResponse(text: string): any {
  const result: any = {
    stats: { min: 0, max: 0, mean: 0 },
    interpretation: "",
    imagePath: "",
    ndviValues: []
  };

  // Exemple pour parser le format texte que vous avez partagé
  const statsMatch = text.match(/min: ([\d.]+), max: ([\d.]+), mean: ([\d.]+)/);
  if (statsMatch) {
    result.stats = {
      min: parseFloat(statsMatch[1]),
      max: parseFloat(statsMatch[2]),
      mean: parseFloat(statsMatch[3])
    };
  }

  const interpretationMatch = text.match(/Interpretation: (.+)/);
  if (interpretationMatch) result.interpretation = interpretationMatch[1];

  const imageMatch = text.match(/Image NDVI: (.+)/);
  if (imageMatch) result.imagePath = imageMatch[1];

  const valuesMatch = text.match(/NDVI_VALUES=\[([\d., ]+)\]/);
  if (valuesMatch) {
    result.ndviValues = valuesMatch[1].split(',').map(parseFloat);
  }

  return result;
}

function normalizeData(data: any) {
  // Extraire min, max, mean depuis la string stats
  if (typeof data.stats === 'string') {
    const statsMatch = data.stats.match(/min:\s*([\d.]+),?\s*max:\s*([\d.]+),?\s*mean:\s*([\d.]+)/i);
    if (statsMatch) {
      data.stats = {
        min: parseFloat(statsMatch[1]),
        max: parseFloat(statsMatch[2]),
        mean: parseFloat(statsMatch[3]),
      };
    } else {
      data.stats = { min: 0, max: 0, mean: 0 };
    }
  }

  // s'assurer que ndviValues est bien un tableau
  if (!Array.isArray(data.ndviValues)) {
    data.ndviValues = [];
  }

  return {
    stats: data.stats,
    interpretation: data.interpretation || "No interpretation available",
    imagePath: data.imagePath || "",
    ndviValues: data.ndviValues,
  };
}
