import sys
import json
import os
import shutil
from sentinelhub import SHConfig, BBox, CRS, SentinelHubRequest, DataCollection

def main():
    try:
        # 1. Parse input arguments
        if len(sys.argv) < 2:
            raise ValueError("Missing JSON input argument")

        input_str = sys.argv[1].replace("'", '"')
        params = json.loads(input_str)

        # 2. Configuration
#         config = SHConfig()
#         config.sh_client_id = '617f78c3-2713-4f5a-8f0f-f7bcd3296815'
#         config.sh_client_secret = 'W6GDcPmDdFyu8EFTwS2NNg38aTU2mjVK'




        config = SHConfig()
        config.sh_client_id = '4b918477-f2ac-42ce-91bc-4ff58f396e18'
        config.sh_client_secret = 'PK0D97docY0jrYeOuBdJ2k0c5FGSKsBu'

        # 3. Prepare and clean directories
        base_dir = "uploads"

        # Nettoyage complet des dossiers avant téléchargement
        for band in ['B04', 'B08']:
            band_dir = os.path.join(base_dir, band)
            shutil.rmtree(band_dir, ignore_errors=True)  # Supprime le dossier et son contenu
            os.makedirs(band_dir, exist_ok=True)  # Recrée le dossier vide

        # 4. Create bounding box (1km x 1km)
        bbox = BBox([
            params['lon'] - 0.005,
            params['lat'] - 0.005,
            params['lon'] + 0.005,
            params['lat'] + 0.005
        ], crs=CRS.WGS84)

        # 5. Download bands with direct save to target folder
        for band in ['B04', 'B08']:
            evalscript = f"""
            //VERSION=3
            function setup() {{
                return {{
                    input: ["{band}"],
                    output: {{ bands: 1, sampleType: "UINT16" }}
                }};
            }}
            function evaluatePixel(sample) {{
                return [sample.{band}];
            }}
            """

            SentinelHubRequest(
                evalscript=evalscript,
                input_data=[
                    SentinelHubRequest.input_data(
                        data_collection=DataCollection.SENTINEL2_L2A,
                        time_interval=("2024-01-01", "2024-04-30"),
                        maxcc=0.8
                    )
                ],
                responses=[
                    SentinelHubRequest.output_response('default', 'tiff')
                ],
                bbox=bbox,
                size=[512, 512],
                config=config,
                data_folder=os.path.abspath(f"{base_dir}/{band}")
            ).get_data(save_data=True)

        print(json.dumps({
            "status": "success",
            "message": "Téléchargement réussi (anciens fichiers écrasés)",
            "fichiers": {
                "B04": os.path.abspath(f"{base_dir}/B04/response.tiff"),
                "B08": os.path.abspath(f"{base_dir}/B08/response.tiff")
            }
        }))

    except json.JSONDecodeError as e:
        print(json.dumps({
            "status": "error",
            "type": "JSONDecodeError",
            "message": "Erreur dans le format JSON",
            "input": sys.argv[1] if len(sys.argv) > 1 else None,
            "details": str(e)
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