/**
 * Service API pour récupérer les données EcoScore
 * Single Source of Truth : le backend est l'unique source de vérité
 */

export interface EcoScoreData {
  product_id: number;
  grade: string;
  numeric_score: number;
  confidence: number;
  created_at?: string;
  updated_at?: string;
  data_source?: string;
  product_name?: string;
  brand?: string;
  manufacturer?: string;
  category?: string;
  origin?: string;
  country?: string;
  barcode?: string;
  ean?: string;
  details?: {
    weights?: {
      co2?: number;
      water?: number;
      energy?: number;
    };
    normalized_indicators?: {
      co2?: number;
      water?: number;
      energy?: number;
    };
    packaging_type?: string;
    packaging_penalty?: number;
    data_completeness?: number;
  };
}

export interface ProductListItem {
  id: number;
  name?: string;
  score?: number;
  grade?: string;
}

/**
 * Récupère la liste de tous les produits disponibles
 * @param apiBase - URL de base de l'API (défaut: http://127.0.0.1:8005)
 * @returns Promise avec la liste des produits
 */
export async function fetchProductList(
  apiBase: string = "http://127.0.0.1:8005"
): Promise<ProductListItem[]> {
  try {
    // Essayer différents endpoints possibles
    const endpoints = [
      `${apiBase}/public/products`,
      `${apiBase}/public/product/list`,
      `${apiBase}/public/products/list`,
      `${apiBase}/products`,
      `${apiBase}/api/products`,
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint);
        if (response.ok) {
          const data = await response.json();
          // Si c'est un tableau, le retourner directement
          if (Array.isArray(data)) {
            return data;
          }
          // Si c'est un objet avec une propriété products ou items
          if (data.products && Array.isArray(data.products)) {
            return data.products;
          }
          if (data.items && Array.isArray(data.items)) {
            return data.items;
          }
        }
      } catch {
        // Continuer avec le prochain endpoint
        continue;
      }
    }

    // Si aucun endpoint ne fonctionne, utiliser un fallback intelligent
    // Récupérer tous les produits en testant une plage large d'IDs
    const products: ProductListItem[] = [];
    const maxId = 200; // Plage maximale à tester
    const batchSize = 10; // Traiter par lots pour améliorer les performances
    
    // Créer des promesses pour tester plusieurs IDs en parallèle
    const promises: Promise<ProductListItem | null>[] = [];
    
    for (let i = 1; i <= maxId; i++) {
      promises.push(
        fetchEcoScore(i, apiBase)
          .then((product) => ({
            id: product.product_id,
            name: product.product_name,
            score: product.numeric_score,
            grade: product.grade,
          }))
          .catch(() => null) // Retourner null si le produit n'existe pas
      );
      
      // Traiter par lots pour éviter de surcharger l'API
      if (promises.length >= batchSize || i === maxId) {
        const batchResults = await Promise.all(promises);
        const validProducts = batchResults.filter(
          (p): p is ProductListItem => p !== null
        );
        products.push(...validProducts);
        promises.length = 0; // Réinitialiser pour le prochain lot
        
        // Si on trouve des produits, continuer, sinon arrêter plus tôt
        if (i > 50 && products.length === 0) {
          // Si on n'a trouvé aucun produit après 50 tentatives, arrêter
          break;
        }
      }
    }
    
    // Trier par product_id pour un affichage cohérent
    return products.sort((a, b) => a.id - b.id);
  } catch (error) {
    console.error("Error fetching product list:", error);
    return [];
  }
}

/**
 * Récupère les données EcoScore pour un produit donné
 * @param productId - ID du produit
 * @param apiBase - URL de base de l'API (défaut: http://127.0.0.1:8005)
 * @returns Promise avec les données ou une erreur
 */
export async function fetchEcoScore(
  productId: number | string,
  apiBase: string = "http://127.0.0.1:8005"
): Promise<EcoScoreData> {
  if (!productId || productId === "") {
    throw new Error("Product ID is required");
  }

  const response = await fetch(`${apiBase}/public/product/${productId}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("NOT_FOUND");
    }
    const json = await response.json().catch(() => ({}));
    throw new Error(json?.detail || `API error: ${response.status}`);
  }

  const data: EcoScoreData = await response.json();
  return data;
}

