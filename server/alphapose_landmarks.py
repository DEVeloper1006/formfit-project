import cv2
import os
import torch
from alphapose.models import builder
from alphapose.utils.presets import SimpleTransform
from alphapose.utils.presets import get_pose_transforms
from alphapose.utils.transforms import get_func_heatmap_to_coord
from alphapose.utils.vis import vis_frame
from alphapose.utils.presets import SimpleTransform

def visualize_landmarks_on_video_alphapose(input_video_path, output_video_path):
    # Initialize AlphaPose model
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    model = builder.build_sppe(model_name='resnet50', pretrained=True).to(device)
    model.eval()

    # Get pose transformations
    _, pose_trans = get_pose_transforms()

    # Open the input video
    cap = cv2.VideoCapture(input_video_path)
    if not cap.isOpened():
        print(f"Error: Cannot open video {input_video_path}")
        return

    # Get video properties
    frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')  # Codec for .mp4 files

    # Initialize the VideoWriter
    out = cv2.VideoWriter(output_video_path, fourcc, fps, (frame_width, frame_height))
    frame_counter = 0

    # Process the video frame by frame
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        frame_counter += 1

        # Detect pose using AlphaPose
        orig_img = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        transformed_frame, orig_shape, center, scale = pose_trans(orig_img)
        transformed_frame = transformed_frame.unsqueeze(0).to(device)

        with torch.no_grad():
            heatmaps = model(transformed_frame).cpu()
            coords, _ = get_func_heatmap_to_coord('heatmap')(heatmaps, center, scale, orig_shape)

        # Visualize landmarks on the frame
        frame_with_landmarks = vis_frame(frame, coords)

        # Count detected landmarks
        num_landmarks = len(coords)
        print(f"Frame {frame_counter}: Detected {num_landmarks} landmarks")

        # Write the frame to the output video
        out.write(frame_with_landmarks)

    # Release resources
    cap.release()
    out.release()

    print(f"Landmark visualization saved to {output_video_path}")

# List of exercises
exercise_list = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16']

for exercise in exercise_list:
    input_video_path = f'data/0_{exercise}_cam0.mp4'
    output_video_path = f'output/0_{exercise}_cam0.mp4'

    # Ensure output directory exists
    os.makedirs(os.path.dirname(output_video_path), exist_ok=True)

    # Call the function
    visualize_landmarks_on_video_alphapose(input_video_path, output_video_path)
