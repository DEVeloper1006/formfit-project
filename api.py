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

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')

# load the pre-trained model
# model_path = '../backend/4_conv.keras'
model_path = os.path.join(os.getcwd(), 'backend', '4_conv.keras')
model = keras.models.load_model(model_path)

# labels that correspond to the prediction
labels = []

def predict(image_path):
    img = cv2.imread(image_path)

    if img is None:
        raise ValueError("Image not found")
    
    # do preprocessing
    
    # make prediction
    predictions = model.predict(np.array([img]))
    prediction = np.argmax(predictions)
    
    # return the right format for the prediction
    return labels[prediction]

@app.route('/image_posting',methods=['POST'])
def image_posting():
    # print("Request headers:", request.headers) 
    # print("Request method:", request.method)    
    # print("Files:", request.files)
    # print("Form Data:", request.form)
    
    if 'images' not in request.files:
        return jsonify({"error": "No image part in the request"}), 400
    
    images = request.files.getlist('images')
    
    results = []
    for image in images:
        if image.filename == '':
            return jsonify({"error": "No selected file"}), 400
        
        file_name = f"{uuid.uuid4()}_{image.filename}"
        file_path = os.path.join(UPLOAD_FOLDER, file_name)
        
        try:
            img = Image.open(image.stream)
            img.save(file_path)
            print(f"Image saved to {file_path}")

            try:
                result = predict(file_path)
                print(f"Predicted exercise: {result}")

                results.append({"name": image.filename, "label": result})

            except ValueError as e:
                print(e)
        
        except Exception as e:
            print(f"Failed to save or process image {file_name}: {e}")
            return jsonify({"error": f"Failed to save image {file_name}"}), 500
    print("********")
    print(results)
    return jsonify({"message": results}), 200


if __name__ == '__main__':
    # Use the PORT environment variable, default to 8080 if not set
    port = int(os.environ.get("PORT", 8080))
    app.run(host='0.0.0.0',port=port)