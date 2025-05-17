import sys
import json
import os
import rasterio
import numpy as np
import matplotlib.pyplot as plt
from datetime import datetime
from pathlib import Path

def interpret_ndvi(mean_ndvi):
    """Interprète la valeur NDVI moyenne"""
    if mean_ndvi is None or np.isnan(mean_ndvi):
        return "Données non disponibles (image probablement nuageuse ou invalide)"
    if mean_ndvi < 0:
        return "Zone d'eau ou de nuages"
    elif mean_ndvi < 0.1:
        return "Sol nu ou très peu de végétation"
    elif mean_ndvi < 0.2:
        return "Végétation très faible"
    elif mean_ndvi < 0.5:
        return "Végétation modérée"
    elif mean_ndvi < 0.8:
        return "Bonne santé de la végétation"
    else:
        return "Végétation très dense (forêt ou culture optimale)"

def find_response_file(base_path):
    """Trouve le fichier response.tiff dans la structure avec hash"""
    base_path = Path(base_path)

    if base_path.name == "response.tiff" and base_path.exists():
        return base_path

    if not base_path.exists():
        raise FileNotFoundError(f"Dossier {base_path} introuvable")

    for subdir in base_path.iterdir():
        if subdir.is_dir():
            tiff_path = subdir / "response.tiff"
            if tiff_path.exists():
                return tiff_path

    raise FileNotFoundError(f"Aucun fichier response.tiff trouvé dans {base_path}")

def validate_and_convert_band(band_data):
    """Convertit et valide les données de bande"""
    # Conversion en float32 et remplacement des valeurs nulles
    band_data = band_data.astype('float32')
    band_data[band_data <= 0] = np.nan  # Remplace les valeurs nulles ou négatives par NaN
    return band_data

def calculate_ndvi(red, nir):
    """Calcule l'NDVI avec gestion robuste des types de données"""
    try:
        # Vérification des dimensions
        if red.shape != nir.shape:
            raise ValueError("Les bandes ont des dimensions différentes")

        # Calcul NDVI seulement sur les pixels valides
        denominator = np.where((nir + red) == 0, np.nan, (nir + red))
        ndvi = (nir - red) / denominator

        return ndvi
    except Exception as e:
        raise RuntimeError(f"Erreur lors du calcul NDVI: {str(e)}")

def main():
    try:
        # 1. Chargement des arguments
        if len(sys.argv) < 2:
            raise ValueError("Veuillez fournir un fichier JSON de configuration")

        args = json.loads(sys.argv[1].replace("'", '"'))

        # 2. Configuration des chemins
        script_dir = Path(__file__).parent.absolute()

        # Chemins d'entrée
        red_dir = Path(args.get('red_dir', script_dir / "uploads" / "B04"))
        nir_dir = Path(args.get('nir_dir', script_dir / "uploads" / "B08"))
        output_path = Path(args.get('output_path', script_dir / "output" / "ndvi_map.png"))

        # 3. Recherche des fichiers
        red_file = find_response_file(red_dir)
        nir_file = find_response_file(nir_dir)
        print(f"Fichiers trouvés:\n- Rouge: {red_file}\n- NIR: {nir_file}", file=sys.stderr)

        # 4. Lecture et conversion des bandes
        with rasterio.open(red_file) as src:
            red = validate_and_convert_band(src.read(1))
            profile = src.profile

        with rasterio.open(nir_file) as src:
            nir = validate_and_convert_band(src.read(1))

        # 5. Calcul NDVI
        ndvi = calculate_ndvi(red, nir)
        valid_pixels = np.sum(~np.isnan(ndvi))
        total_pixels = ndvi.size

        # 6. Statistiques
        stats = {
            "valid_pixels": int(valid_pixels),
            "valid_percentage": round((valid_pixels / total_pixels * 100) if total_pixels > 0 else 0, 2),
            "mean": None,
            "max": None,
            "min": None
        }

        if valid_pixels > 0:
            stats.update({
                "mean": round(float(np.nanmean(ndvi)), 4),
                "max": round(float(np.nanmax(ndvi)), 4),
                "min": round(float(np.nanmin(ndvi)), 4)
            })

        # 7. Génération de la carte
        output_path.parent.mkdir(parents=True, exist_ok=True)
        plt.figure(figsize=(10, 8))

        if valid_pixels > 0:
            plt.imshow(ndvi, cmap='RdYlGn', vmin=-1, vmax=1)
            plt.colorbar(label='NDVI')
            plt.title(f"Carte NDVI - {datetime.now().strftime('%Y-%m-%d')}")
        else:
            plt.text(0.5, 0.5, 'Aucune donnée valide',
                    ha='center', va='center', fontsize=12)
            plt.title(f"Aucune donnée valide - {datetime.now().strftime('%Y-%m-%d')}")

        plt.axis('off')
        plt.savefig(output_path, bbox_inches='tight', dpi=150)
        plt.close()

        # 8. Résultat final
        result = {
            "status": "success",
            "image_path": str(output_path),
            "source_files": {
                "red_band": str(red_file),
                "nir_band": str(nir_file)
            },
            "statistics": stats,
            "metadata": {
                "crs": str(profile['crs']),
                "resolution": float(profile['transform'][0]),
                "dimensions": {
                    "height": int(profile['height']),
                    "width": int(profile['width'])
                }
            },
            "interpretation": interpret_ndvi(stats["mean"])
        }

        print(json.dumps(result, indent=2))

    except json.JSONDecodeError as e:
        print(json.dumps({
            "status": "error",
            "type": "JSONDecodeError",
            "message": f"Erreur dans le JSON: {str(e)}",
            "usage": "Utiliser: python script.py '{\"red_dir\":\"chemin/B04\",\"nir_dir\":\"chemin/B08\",\"output_path\":\"chemin/sortie.png\"}'"
        }), file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(json.dumps({
            "status": "error",
            "type": type(e).__name__,
            "message": str(e),
            "args": sys.argv[1] if len(sys.argv) > 1 else None
        }), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()