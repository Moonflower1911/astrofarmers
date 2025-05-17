import os
import shutil
from sentinelhub import SHConfig, BBox, CRS, SentinelHubRequest, DataCollection

def download_ndvi(lon, lat, output_dir="uploads"):
    # Supprime le dossier s'il existe déjà, puis recrée-le vide
    if os.path.exists(output_dir):
        shutil.rmtree(output_dir)
    os.makedirs(output_dir, exist_ok=True)

    # Configuration Sentinel Hub - remplace par tes clés
    config = SHConfig()
    config.sh_client_id = '4b918477-f2ac-42ce-91bc-4ff58f396e18'
    config.sh_client_secret = 'PK0D97docY0jrYeOuBdJ2k0c5FGSKsBu'

    # Définition de la zone d'intérêt (bbox 1km x 1km)
    bbox = BBox(
        [lon - 0.005, lat - 0.005, lon + 0.005, lat + 0.005],
        crs=CRS.WGS84
    )

    # Evalscript calculant NDVI
    evalscript = """
    //VERSION=3
    function setup() {
        return {
            input: ["B04", "B08"],
            output: { bands: 1, sampleType: "FLOAT32" }
        };
    }
    function evaluatePixel(sample) {
        let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
        return [ndvi];
    }
    """

    # Prépare la requête Sentinel Hub
    request = SentinelHubRequest(
        evalscript=evalscript,
        input_data=[
            SentinelHubRequest.input_data(
                data_collection=DataCollection.SENTINEL2_L2A,
                time_interval=("2025-05-01", "2025-05-17"),
                maxcc=0.3
            )
        ],
        responses=[SentinelHubRequest.output_response("default", "tiff")],
        bbox=bbox,
        size=(512, 512),
        config=config,
        data_folder=os.path.abspath(output_dir)  # dossier pour sauvegarder
    )

    # Télécharge et sauvegarde l’image NDVI
    data = request.get_data(save_data=True)

    print(f"NDVI téléchargé et sauvegardé dans : {output_dir}")
    return data


if __name__ == "__main__":
    import sys
    if len(sys.argv) >= 3:
        lon = float(sys.argv[1])
        lat = float(sys.argv[2])
        download_ndvi(lon, lat)
    else:
        print("Usage: python download_ndvi.py longitude latitude")
