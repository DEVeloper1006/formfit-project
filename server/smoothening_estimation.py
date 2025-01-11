import os
import numpy as np
from scipy.signal import find_peaks
import matplotlib.pyplot as plt
import csv

def estimate_first_cycle(data_dir, output_csv):
    results = []
    
    # Iterate through each .npy file in the data directory
    for filename in os.listdir(data_dir):
        if filename.endswith(".npy"):
            # Load the .npy file containing the joint angles
            file_path = os.path.join(data_dir, filename)
            angles = np.load(file_path)
            
            # Reshape the data into a 2D array (frames x 6 joint angles)
            frames = angles.reshape(-1, 6)  # Ensure it's (frames, 6)
                        
            # Calculate the average angle per frame (mean of the 6 joint angles)
            avg_angle_per_frame = np.mean(frames, axis=1)

            # Apply smoothing with a smaller window size to preserve more detail
            smoothed_angles = np.convolve(avg_angle_per_frame, np.ones(3)/3, mode='same')  # 5-frame smoothing window

            # Detect peaks on the original signal (before smoothing)
            raw_peaks, _ = find_peaks(avg_angle_per_frame, prominence=0.95, distance=50)
 
            # Detect peaks on the smoothed signal (to refine the detection)
            smoothed_peaks, _ = find_peaks(smoothed_angles, prominence=0.95, distance=50)

            # Find the first cycle by looking at the first peak in the smoothed signal
            if len(smoothed_peaks) > 1:
                first_cycle_frame = smoothed_peaks[1]  # The second peak is likely to correspond to the end of the first rep
            else:
                first_cycle_frame = len(smoothed_angles)  # If no peaks detected, assume full video length

            # Save the result for this file
            results.append([filename, first_cycle_frame])

    # Save results to a CSV file
    with open(output_csv, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(["npy_file", "first_cycle_frame_count"])
        writer.writerows(results)
    print(f"Results saved to {output_csv}")
    
    # Display the results in the console
    print("\nFirst Cycle Frame Counts for All Files:")
    for result in results:
        print(f"File: {result[0]}, First Cycle Frame Count: {result[1]}")

# Define paths for your data and output CSV file
data_dir = 'processed_data'
output_csv = 'smooth_estimates.csv'

# Call the function
estimate_first_cycle(data_dir, output_csv)