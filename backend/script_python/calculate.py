import numpy as np
import rasterio
import matplotlib.pyplot as plt
from matplotlib.colors import LinearSegmentedColormap
from pathlib import Path

def lire_ndvi_tiff(chemin_tiff):
    with rasterio.open(chemin_tiff) as src:
        ndvi = src.read(1).astype(np.float32)
    # Remplace valeurs invalides par NaN
    ndvi = np.where((ndvi < -1.0) | (ndvi > 1.0), np.nan, ndvi)
    return ndvi

def sauver_image_ndvi_carte(ndvi, chemin_png):
    colors = [
        (0.0, "#a50026"),
        (0.2, "#f46d43"),
        (0.4, "#fdae61"),
        (0.6, "#fee08b"),
        (0.8, "#d9ef8b"),
        (1.0, "#1a9850"),
    ]
    cmap = LinearSegmentedColormap.from_list("ndvi_carte", [c[1] for c in colors])

    plt.figure(figsize=(8, 8))
    vmin, vmax = -0.2, 0.8
    plt.imshow(ndvi, cmap=cmap, vmin=vmin, vmax=vmax)
    cbar = plt.colorbar(fraction=0.046, pad=0.04)
    cbar.set_label("Indice NDVI")
    plt.title("Carte NDVI")
    plt.axis('off')
    plt.savefig(chemin_png, bbox_inches='tight', pad_inches=0.1, dpi=300)
    plt.close()

def interpret_ndvi(mean_ndvi):
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
    base_path = Path(base_path)
    if base_path.is_file() and base_path.name == "response.tiff":
        return base_path

    if not base_path.exists():
        raise FileNotFoundError(f"Dossier {base_path} introuvable")

    for subdir in base_path.iterdir():
        if subdir.is_dir():
            tiff_path = subdir / "response.tiff"
            if tiff_path.exists():
                return tiff_path

    raise FileNotFoundError(f"Aucun fichier response.tiff trouvé dans {base_path}")



if __name__ == "__main__":
    try:
        # Créer le dossier output s'il n'existe pas
        Path("output").mkdir(exist_ok=True)

        base_upload_dir = "uploads"
        fichier_tiff = find_response_file(base_upload_dir)
        ndvi = lire_ndvi_tiff(fichier_tiff)

        ndvi_min = np.nanmin(ndvi)
        ndvi_max = np.nanmax(ndvi)
        ndvi_mean = np.nanmean(ndvi)



        print(f"NDVI stats — min: {ndvi_min:.3f}, max: {ndvi_max:.3f}, mean: {ndvi_mean:.3f}")

        interpretation= interpret_ndvi(ndvi_mean)
        print(f"Interpretation NDVI moyenne : {interpretation}")

        output_png = "output/ndvi_carte.png"
        sauver_image_ndvi_carte(ndvi, output_png)
        print(f"Image NDVI style carte sauvegardée sous : {output_png}")
    except Exception as e:
        print(f"Erreur: {str(e)}")