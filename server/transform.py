import os
import numpy as np

def reshape_npy_to_matrix(processed_data_dir, output_dir, num_angles=6):
    # Create the output directory if it doesn't exist
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    for root, _, files in os.walk(processed_data_dir):
        for file in files:
            if file.endswith('.npy'):
                filepath = os.path.join(root, file)
                # Load the 1D array
                data = np.load(filepath)

                # Ensure the total number of elements is divisible by num_angles
                if len(data) % num_angles != 0:
                    raise ValueError(f"Data in {file} cannot be reshaped into a matrix with {num_angles} columns.")

                # Reshape into a 2D matrix
                num_frames = len(data) // num_angles
                reshaped_data = data.reshape((num_frames, num_angles))

                # Define the output file path
                output_filepath = os.path.join(output_dir, file)

                # Save the reshaped matrix in the new directory
                np.save(output_filepath, reshaped_data)
                print(f"Reshaped {file} and saved to {output_filepath} with shape {reshaped_data.shape}")

# Example usage
processed_data_dir = "processed_data"  # Original directory with .npy files
output_dir = "final_data"          # Directory where reshaped files will be saved
reshape_npy_to_matrix(processed_data_dir, output_dir)