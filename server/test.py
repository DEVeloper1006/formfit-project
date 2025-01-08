import os
import numpy as np

def validate_npy_files(processed_data_dir, num_angles=6, auto_fix=False):
    for root, _, files in os.walk(processed_data_dir):
        for file in files:
            if file.endswith('.npy'):
                filepath = os.path.join(root, file)
                data = np.load(filepath)

                if len(data) % num_angles != 0:
                    print(f"WARNING: {file} length ({len(data)}) is not divisible by {num_angles}.")

                    if auto_fix:
                        # Trim the data to make it divisible by num_angles
                        new_length = len(data) - (len(data) % num_angles)
                        trimmed_data = data[:new_length]

                        # Save the fixed data back to the same file
                        np.save(filepath, trimmed_data)
                        print(f"Trimmed {file} to new length {new_length} and saved.")
                else:
                    print(f"{file} is valid with length {len(data)}.")

# Example usage
processed_data_dir = "processed_data"  # Replace with your directory path
validate_npy_files(processed_data_dir, num_angles=6, auto_fix=True)