import { useEffect, useState } from "react";
import { fetchEcoScore, EcoScoreData } from "../services/ecoScoreApi";

export interface UseEcoScoreResult {
  data: EcoScoreData | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

/**
 * Hook React centralisé pour récupérer les données EcoScore
 * Gère uniquement la logique de récupération des données (loading, error)
 * Aucune logique UI ici
 * 
 * @param productId - ID du produit
 * @param apiBase - URL de base de l'API
 * @returns État des données (data, loading, error) + fonction retry
 */
export function useEcoScore(
  productId: number | string | undefined | null,
  apiBase: string = "http://127.0.0.1:8005"
): UseEcoScoreResult {
  const [data, setData] = useState<EcoScoreData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (productId === undefined || productId === null || productId === "") {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    const ctrl = new AbortController();
    setError(null);
    setLoading(true);
    setData(null);

    fetchEcoScore(productId, apiBase)
      .then((result) => {
        if (!ctrl.signal.aborted) {
          setData(result);
        }
      })
      .catch((e: any) => {
        if (!ctrl.signal.aborted && e?.name !== "AbortError") {
          setError(e?.message || "Impossible de charger le produit.");
        }
      })
      .finally(() => {
        if (!ctrl.signal.aborted) {
          setLoading(false);
        }
      });

    return () => {
      ctrl.abort();
    };
  }, [productId, apiBase]);

  const retry = () => {
    if (productId === undefined || productId === null || productId === "") {
      return;
    }

    setError(null);
    setLoading(true);
    setData(null);

    fetchEcoScore(productId, apiBase)
      .then((result) => {
        setData(result);
      })
      .catch((e: any) => {
        setError(e?.message || "Impossible de charger le produit.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return { data, loading, error, retry };
}

