import os
import numpy as np
import matplotlib.pyplot as plt
from scipy.signal import find_peaks
import pandas as pd

def estimate_first_cycle (data_dir, num_angles=6):
    results = []
    for filename in os.listdir(data_dir):
        if filename.endswith(".npy"):
            file_path = os.path.join(data_dir, filename)
            data = np.load(file_path).reshape(-1, num_angles)
            print(data.shape)
            avg_angle_per_frame = np.mean(data, axis=1)
            peaks, _ = find_peaks(avg_angle_per_frame, prominence=0.3, distance=55)
            
            if len(peaks) > 1:
                first_cycle_frames = peaks[1] - peaks[0]
                results.append([filename, first_cycle_frames])
                print(f"First cycle for {filename}: {first_cycle_frames} frames")
            else:
                first_cycle_frames = 0
                results.append([filename, first_cycle_frames])
                print(f"No full cycle found for {filename}")
    
    # Save results to a file
    output_path = "estimated_frames.csv"
    df = pd.DataFrame(results, columns=["File Name", "First Cycle Frame"])
    df.to_csv(output_path, index=False)    
    print(f"Saved first cycle frame counts to {output_path}")
    
data_dir = "processed_data"
estimate_first_cycle(data_dir)