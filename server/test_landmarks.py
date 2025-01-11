import cv2
import mediapipe as mp
import os

def visualize_landmarks_on_video(input_video_path, output_video_path, detection_confidence=0.5, tracking_confidence=0.5):
    # Initialize MediaPipe Pose with adjustable confidence
    mp_pose = mp.solutions.pose
    pose = mp_pose.Pose(static_image_mode=False, min_detection_confidence=detection_confidence, min_tracking_confidence=tracking_confidence, smooth_landmarks=True, model_complexity=1, enable_segmentation=True)
    mp_drawing = mp.solutions.drawing_utils

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
        # Convert the frame to RGB as required by MediaPipe
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # Process the frame with MediaPipe Pose
        results = pose.process(rgb_frame)

        # Draw the pose landmarks on the frame
        if results.pose_landmarks:
            mp_drawing.draw_landmarks(
                frame,
                results.pose_landmarks,
                mp_pose.POSE_CONNECTIONS,
                mp_drawing.DrawingSpec(color=(255, 255, 255), thickness=2, circle_radius=2),
                mp_drawing.DrawingSpec(color=(0, 0, 255), thickness=2, circle_radius=2)
            )
            
            num_landmarks = len(results.pose_landmarks.landmark)
            print(f"Frame {frame_counter}: Detected {num_landmarks} landmarks")
        else:
            print(f"Frame {frame_counter}: No landmarks detected")

        # Write the frame to the output video
        out.write(frame)

    # Release resources
    cap.release()
    out.release()
    pose.close()

    print(f"Landmark visualization saved to {output_video_path}")

exercise_list = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16']

for exercise in exercise_list:
    
    input_video_path = f'data/0_{exercise}_cam0.mp4'
    output_video_path = f'output/0_{exercise}_cam0.mp4'

    # Ensure output directory exists
    os.makedirs(os.path.dirname(output_video_path), exist_ok=True)

    # Adjust the confidence thresholds
    detection_confidence = 0.7  # Adjust for stricter pose detection
    tracking_confidence = 0.7   # Adjust for stricter pose tracking

    # Call the function
    visualize_landmarks_on_video(input_video_path, output_video_path, detection_confidence, tracking_confidence)
