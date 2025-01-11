import os
import numpy as np
from scipy.signal import find_peaks
import matplotlib.pyplot as plt
import csv

def estimate_first_cycle(data_dir, output_csv):
    results = []
    
    for filename in os.listdir(data_dir):
        if filename.endswith(".npy"):
            file_path = os.path.join(data_dir, filename)
            angles = np.load(file_path)
            
            # Reshape and compute average angle
            frames = angles.reshape(-1, 6)
            avg_angle_per_frame = np.mean(frames, axis=1)
            
            # Smoothing with dynamic window size (based on total frames)
            smoothing_window = max(3, len(avg_angle_per_frame) // 100)  # Example: 1% of total frames
            smoothed_angles = np.convolve(avg_angle_per_frame, np.ones(smoothing_window)/smoothing_window, mode='same')
            
            # Peak detection with adaptive parameters
            prominence = 0.90  # Starting prominence
            distance = len(avg_angle_per_frame) // 20  # Adjust based on signal length
            smoothed_peaks, _ = find_peaks(smoothed_angles, prominence=prominence, distance=distance)
            
            # Analyze gaps to adjust parameters dynamically
            if len(smoothed_peaks) > 1:
                gaps = np.diff(smoothed_peaks)  # Differences between peaks
                avg_gap = np.mean(gaps)
                std_gap = np.std(gaps)
                print(f"File: {filename}, Avg Gap: {avg_gap:.2f}, Std Gap: {std_gap:.2f}")
                
                # Determine first cycle based on gaps
                first_cycle_frame = smoothed_peaks[1]  # Second peak as end of first cycle
            else:
                first_cycle_frame = 0
            
            results.append([filename, first_cycle_frame])

    # Save results
    with open(output_csv, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(["npy_file", "first_cycle_frame_count"])
        writer.writerows(results)
    print(f"Results saved to {output_csv}")

# Usage
data_dir = 'processed_data'
output_csv = 'adaptive_estimates.csv'
estimate_first_cycle(data_dir, output_csv)