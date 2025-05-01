import rasterio
import numpy as np
import matplotlib.pyplot as plt
import json
import sys

def calculate_ndvi(nir_band_path, red_band_path, output_image='ndvi_output.png'):
    with rasterio.open(nir_band_path) as nir_src:
        nir = nir_src.read(1).astype(float)
        profile = nir_src.profile

    with rasterio.open(red_band_path) as red_src:
        red = red_src.read(1).astype(float)

    ndvi = (nir - red) / (nir + red + 1e-6)

    plt.figure(figsize=(8, 6))
    plt.imshow(ndvi, cmap='RdYlGn', vmin=-1, vmax=1)
    plt.colorbar(label='NDVI')
    plt.title('Carte NDVI')
    plt.axis('off')
    plt.savefig(output_image)
    plt.close()

    result = {
        "mean_ndvi": round(float(np.nanmean(ndvi)), 3),
        "max_ndvi": round(float(np.nanmax(ndvi)), 3),
        "min_ndvi": round(float(np.nanmin(ndvi)), 3),
        "image_path": output_image
    }

    return result

if __name__ == "__main__":
    try:
        args = json.loads(sys.argv[1])
        red_path = args['red_band']
        nir_path = args['nir_band']
        result = calculate_ndvi(nir_path, red_path)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))

