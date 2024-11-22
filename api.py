import json
import uuid
from flask import Flask, jsonify, request
from flask_cors import CORS
from PIL import Image
import sys
import os
import numpy as np
import cv2
from tensorflow import keras
import mediapipe as mp
import pandas as pd
import itertools

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')

# load the pre-trained model
model_path = 'model.keras'
model = keras.models.load_model(model_path)

# labels that correspond to the prediction
labels = [
    "Knee bend sitting (no support)",
    "Knee bend sitting (support)",
    "Leg lift (extended)",
    "Knee bend (bed support)",
    "Knee bend sitting (no support)",
    "Knee bend sitting (support)",
    "Leg lift (extended)",
    "Knee bend (bed support)",
    "Shoulder flexion",
    "Horizontal openings",
    "Shoulder rotation (elastic band)",
    "Circular pendulum",
    "Shoulder flexion",
    "Horizontal openings",
    "Shoulder rotation (elastic band)",
    "Circular pendulum"
]
def detect_pose_in_video(filename):
    # Initialize MediaPipe Pose
    mp_pose = mp.solutions.pose
    pose = mp_pose.Pose(
        static_image_mode=False,  # Set to False for video
        model_complexity=1,
        smooth_landmarks=True,
        enable_segmentation=True,
        min_detection_confidence=0.7,
        min_tracking_confidence=0.7
    )

    # Open video file
    cap = cv2.VideoCapture(filename)
    if not cap.isOpened():
        raise ValueError("Could not open video file")

    # Get video properties
    frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = int(cap.get(cv2.CAP_PROP_FPS))

    # Define the codec and create VideoWriter object
    output_filename = "annotated_video.mp4"
    out = cv2.VideoWriter(output_filename, cv2.VideoWriter_fourcc(*'mp4v'), fps, (frame_width, frame_height))

    all_frames_data = []

    frame_index = 0

    # Process video frames
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        frame = cv2.resize(frame, (frame_width, frame_height))

        # Convert to RGB for MediaPipe
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # Process the frame
        results = pose.process(frame_rgb)

        if results.pose_landmarks:
            # Draw landmarks on the frame
            mp_drawing = mp.solutions.drawing_utils
            mp_drawing_styles = mp.solutions.drawing_styles

            body_landmarks = [
                mp_pose.PoseLandmark.LEFT_HIP,
                mp_pose.PoseLandmark.RIGHT_HIP,
                mp_pose.PoseLandmark.LEFT_KNEE,
                mp_pose.PoseLandmark.RIGHT_KNEE,
                mp_pose.PoseLandmark.LEFT_ANKLE,
                mp_pose.PoseLandmark.RIGHT_ANKLE
            ]

            POSE_CONNECTIONS = frozenset([
                (mp_pose.PoseLandmark.LEFT_SHOULDER, mp_pose.PoseLandmark.LEFT_HIP),
                (mp_pose.PoseLandmark.RIGHT_SHOULDER, mp_pose.PoseLandmark.RIGHT_HIP),
                (mp_pose.PoseLandmark.LEFT_HIP, mp_pose.PoseLandmark.RIGHT_HIP),
                (mp_pose.PoseLandmark.LEFT_HIP, mp_pose.PoseLandmark.LEFT_KNEE),
                (mp_pose.PoseLandmark.RIGHT_HIP, mp_pose.PoseLandmark.RIGHT_KNEE),
                (mp_pose.PoseLandmark.LEFT_KNEE, mp_pose.PoseLandmark.LEFT_ANKLE),
                (mp_pose.PoseLandmark.RIGHT_KNEE, mp_pose.PoseLandmark.RIGHT_ANKLE),
            ])

            mp_drawing.draw_landmarks(
                frame,
                results.pose_landmarks,
                POSE_CONNECTIONS,
                landmark_drawing_spec=mp_drawing_styles.get_default_pose_landmarks_style()
            )

            frame_data = {"exercise": 1}
            landmark_positions = {}

            for idx, landmark in enumerate(results.pose_landmarks.landmark):
                if mp_pose.PoseLandmark(idx) in body_landmarks:
                    x_pixel = int(landmark.x * frame_width)
                    y_pixel = int(landmark.y * frame_height)
                    frame_data[f"X_{idx}"] = x_pixel
                    frame_data[f"Y_{idx}"] = y_pixel
                    landmark_positions[idx] = (x_pixel, y_pixel)

            # Calculate averages for specified pairs of body parts
            def calculate_average(landmark1, landmark2):
                x_avg = (landmark_positions[landmark1][0] + landmark_positions[landmark2][0]) / 2
                y_avg = (landmark_positions[landmark1][1] + landmark_positions[landmark2][1]) / 2
                return x_avg, y_avg

            if mp_pose.PoseLandmark.LEFT_HIP in landmark_positions and mp_pose.PoseLandmark.RIGHT_HIP in landmark_positions:
                avg_hip_x, avg_hip_y = calculate_average(mp_pose.PoseLandmark.LEFT_HIP, mp_pose.PoseLandmark.RIGHT_HIP)
                frame_data["x_joint_1"] = avg_hip_x
                frame_data["y_joint_1"] = avg_hip_y

            if mp_pose.PoseLandmark.LEFT_KNEE in landmark_positions and mp_pose.PoseLandmark.RIGHT_KNEE in landmark_positions:
                avg_knee_x, avg_knee_y = calculate_average(mp_pose.PoseLandmark.LEFT_KNEE, mp_pose.PoseLandmark.RIGHT_KNEE)
                frame_data["x_joint_2"] = avg_knee_x
                frame_data["y_joint_2"] = avg_knee_y

            if mp_pose.PoseLandmark.LEFT_ANKLE in landmark_positions and mp_pose.PoseLandmark.RIGHT_ANKLE in landmark_positions:
                avg_ankle_x, avg_ankle_y = calculate_average(mp_pose.PoseLandmark.LEFT_ANKLE, mp_pose.PoseLandmark.RIGHT_ANKLE)
                frame_data["x_joint_3"] = avg_ankle_x
                frame_data["y_joint_3"] = avg_ankle_y

            # Convert items to a list
            items = list(frame_data.items())

            # Select the first item and items starting from the 13th index
            selected_items = items[0:1] + items[13:]

            # Convert back to a dictionary
            frame_data = dict(selected_items)
            all_frames_data.append(frame_data)

        # Write the annotated frame to the output video
        out.write(frame)
        frame_index += 1

    # Release resources
    cap.release()
    out.release()
    pose.close()

    # Uncomment below to save CSV and video files
    df = pd.DataFrame(all_frames_data)
    csv_filename = "uploads/pose_landmarks.csv"
    df.to_csv(csv_filename, index=False)
    print(f"\\nSaved pose landmarks as CSV: '{csv_filename}'")
    print(f"\\nSaved annotated video as '{output_filename}'")

def predict(pose_path):
    print("\n\n\n\n\n\n")
    df = pd.read_csv(pose_path)
    
    df = df.iloc[:,1:].to_numpy()
    inputs = np.mean(df, axis=0)
    print(inputs.shape)
    print("\n\n\n\n\n\n")
    reshaped_input = np.expand_dims(inputs, axis=0)
    if inputs is None:
        raise ValueError("Image not found")
    
    scaler_mean = [681.76253029,399.63394363,682.8167135,408.80794974,683.71533759,438.41028803]
    scaler_scale = [99.01007262,80.17065715,154.38127606,77.32635443,201.82723357,116.66497098]
    
    # do preprocessing
    inputs = (inputs - scaler_mean) / scaler_scale
    
    # make prediction
    predictions = model.predict(reshaped_input)
    prediction = np.argmax(predictions)
    print(predictions)
    print(prediction)
    # return the right format for the prediction
    # return labels[prediction]
    return labels[prediction]

@app.route('/image_posting',methods=['POST'])
def image_posting():
    # print("Request headers:", request.headers) 
    # print("Request method:", request.method)    
    # print("Files:", request.files)
    # print("Form Data:", request.form)
    print("Files:", request.files)
    
    if 'video' not in request.files:
        return jsonify({"error": "No video part in the request"}), 400
    
    video = request.files.get('video')
    
    if isinstance(video, list):
        video = video[0]  # Use the first file from the list
    
    results = []
    if video.filename == '':
        return jsonify({"error": "No selected file"}), 400
    video.save(f'/Users/jasimrazamomin/Desktop/mac-ai/formfit-project/uploads/{video.filename}')
    # file_name = f"{uuid.uuid4()}_{video.filename}"
    file_name = video.filename
    # file_path = os.path.join(UPLOAD_FOLDER, file_name)
    file_path = os.path.join('/Users/jasimrazamomin/Desktop/mac-ai/formfit-project/uploads', video.filename)
    if os.path.exists(file_path):
        print(f"File saved successfully at: {file_path}")
    else:
        print(f"File not found at: {file_path}")
    
    
    print(f"Video saved to {file_path}")
    # Usage example
    try:
        detect_pose_in_video(file_path)
        pose_path = os.path.join(UPLOAD_FOLDER, "pose_landmarks.csv")
    except Exception as e:
        print(f"Error: {str(e)}")
    
    try:
        result = predict(pose_path)
        print(f"Predicted exercise: {result}")

        results.append({"name": video.filename, "label": result})

    except ValueError as e:
        print(e)
    
    
    print("********")
    print(results)
    return jsonify({"message": results}), 200


if __name__ == '__main__':
    # Use the PORT environment variable, default to 8080 if not set
    port = int(os.environ.get("PORT", 8080))
    app.run(host='0.0.0.0',port=port)