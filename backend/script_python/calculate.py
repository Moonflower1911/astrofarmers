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
        return "No usable data detected. This could be due to cloud coverage or image acquisition issues. Tip: Try selecting a different date or checking the weather conditions."

    if mean_ndvi < 0:
        return ("NDVI suggests water presence or thick cloud cover. "
                "Tip: This area may be flooded or cloud-obscured. Consider checking field drainage or waiting for a clearer satellite pass.")

    elif mean_ndvi < 0.1:
        return ("Very low vegetation detected: mostly bare soil or recently plowed fields. "
                "Tip: If this is unintended, consider soil preparation or seeding strategies. Monitor irrigation and early crop emergence.")

    elif mean_ndvi < 0.2:
        return ("Sparse vegetation: possibly early-stage growth, poor germination, or stressed crops. "
                "Tip: Evaluate seed quality, nutrient application, and irrigation adequacy. Watch for pests or soil compaction issues.")

    elif mean_ndvi < 0.5:
        return ("Moderate vegetation cover: crops are growing but may not be at optimal health. "
                "Tip: Check for uneven growth, nutrient deficiencies, or localized stress. Consider applying foliar fertilizers or adjusting irrigation.")

    elif mean_ndvi < 0.8:
        return ("Healthy vegetation: crops are developing well and biomass is increasing. "
                "Tip: Continue monitoring regularly to detect any early signs of disease or stress. Maintain current agronomic practices.")

    else:
        return ("Very dense vegetation detected: likely full canopy coverage from mature crops or forested areas. "
                "Tip: If this is your field, it indicates excellent vegetative growth. Plan for harvest timing, yield estimation, and post-harvest logistics.")


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


def extraire_valeurs_ndvi(ndvi):
    valeurs = []
    index = 0
    for row in ndvi:
        for val in row:
            if not np.isnan(val):
                valeurs.append(round(float(val), 3))
                index += 1
    return valeurs



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

        valeurs_ndvi = extraire_valeurs_ndvi(ndvi)

        # Affiche les 15 dernieres valeurs pour test
        print(f"Dernieres valeurs NDVI : {valeurs_ndvi[-15:]}")





    except Exception as e:
        print(f"Erreur: {str(e)}")