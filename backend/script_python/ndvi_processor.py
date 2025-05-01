import sys
import json
import os
import rasterio
import numpy as np
import matplotlib.pyplot as plt
from datetime import datetime

def main():
    try:
        # 1. Chargement des arguments depuis un fichier JSON ou directement
        if len(sys.argv) < 2:
            raise ValueError("Arguments manquants")

        # Correction pour Windows
        args_str = sys.argv[1].replace("'", '"')

        try:
            # Essayer de parser comme JSON direct
            args = json.loads(args_str)
        except json.JSONDecodeError:
            # Si échec, traiter comme chemin de fichier
            with open(args_str) as f:
                args = json.load(f)

        # 2. Vérification des chemins (conversion en chemins complets)
        base_dir = os.path.dirname(os.path.abspath(__file__))
        args['red_path'] = os.path.join(base_dir, args['red_path'])
        args['nir_path'] = os.path.join(base_dir, args['nir_path'])
        args['output_path'] = os.path.join(base_dir, args['output_path'])

        # 3. Lecture des bandes
        with rasterio.open(args['red_path']) as red_src:
            red = red_src.read(1).astype('float32')
            profile = red_src.profile

        with rasterio.open(args['nir_path']) as nir_src:
            nir = nir_src.read(1).astype('float32')

        # 4. Calcul NDVI avec gestion des divisions par zéro
        denominator = np.where((nir + red) == 0, np.nan, (nir + red))
        ndvi = (nir - red) / denominator

        # 5. Création du dossier de sortie
        os.makedirs(os.path.dirname(args['output_path']), exist_ok=True)

        # 6. Génération de la carte NDVI
        plt.figure(figsize=(10, 8))
        plt.imshow(ndvi, cmap='RdYlGn', vmin=-1, vmax=1)
        plt.colorbar(label='NDVI')
        plt.title(f"Carte NDVI - {datetime.now().strftime('%Y-%m-%d')}")
        plt.axis('off')
        plt.savefig(args['output_path'], bbox_inches='tight', dpi=150)
        plt.close()

        # 7. Calcul des statistiques
        valid_pixels = np.count_nonzero(~np.isnan(ndvi))
        result = {
            "status": "success",
            "image_path": args['output_path'],
            "statistics": {
                "mean": round(float(np.nanmean(ndvi)), 4),
                "max": round(float(np.nanmax(ndvi)), 4),
                "min": round(float(np.nanmin(ndvi)), 4),
                "valid_pixels": int(valid_pixels),
                "valid_percentage": round(valid_pixels / ndvi.size * 100, 2)
            },
            "metadata": {
                "crs": str(profile['crs']),
                "resolution": float(profile['transform'][0]),
                "dimensions": {
                    "height": int(profile['height']),
                    "width": int(profile['width'])
                }
            }
        }
        print(json.dumps(result, indent=2))

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