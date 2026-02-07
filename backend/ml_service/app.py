# app.py
# FINAL STABLE VERSION — SAR Target Recognition (YOLOv5 ONNX + FastAPI)
# FIX: NumPy values converted to native Python types

import io
import os
import json
import numpy as np
import cv2
from PIL import Image
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import onnxruntime as ort

# -------------------- PATHS --------------------
APP_DIR = os.path.dirname(__file__)
MODEL_ONNX = os.path.join(APP_DIR, "models", "best.onnx")
ROLES_PATH = os.path.join(APP_DIR, "roles.json")

# -------------------- CLASSES --------------------
NAMES = ["BMP2", "BTR70", "T72"]

# -------------------- LOAD ROLES --------------------
with open(ROLES_PATH, "r") as f:
    ROLE_MAP = json.load(f)

# -------------------- LOAD MODEL --------------------
sess_opts = ort.SessionOptions()
sess_opts.intra_op_num_threads = 1

session = ort.InferenceSession(
    MODEL_ONNX,
    sess_opts,
    providers=["CPUExecutionProvider"]
)

INPUT_NAME = session.get_inputs()[0].name
OUTPUT_NAME = session.get_outputs()[0].name

# -------------------- FASTAPI --------------------
app = FastAPI(title="SAR Target Recognition API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------- HELPERS --------------------
def letterbox(img, new_shape=(640, 640), color=(114, 114, 114)):
    h, w = img.shape[:2]
    r = min(new_shape[0] / h, new_shape[1] / w)

    new_w, new_h = int(w * r), int(h * r)
    img = cv2.resize(img, (new_w, new_h))

    pad_w = new_shape[1] - new_w
    pad_h = new_shape[0] - new_h
    left = pad_w // 2
    top = pad_h // 2

    img = cv2.copyMakeBorder(
        img,
        top,
        pad_h - top,
        left,
        pad_w - left,
        cv2.BORDER_CONSTANT,
        value=color
    )

    return img, r, left, top


def xywh_to_xyxy(cx, cy, w, h):
    return (
        cx - w / 2,
        cy - h / 2,
        cx + w / 2,
        cy + h / 2
    )


def nms(boxes, scores, iou_thresh=0.45):
    idxs = cv2.dnn.NMSBoxes(
        boxes,
        scores,
        score_threshold=0.25,
        nms_threshold=iou_thresh
    )
    return idxs.flatten().tolist() if len(idxs) > 0 else []


# -------------------- API --------------------
@app.post("/detect")
async def detect(file: UploadFile = File(...)):
    # Read image
    image_bytes = await file.read()
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img_np = np.array(img)
    h0, w0 = img_np.shape[:2]

    img_bgr = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)

    # Preprocess
    img_lb, ratio, pad_x, pad_y = letterbox(img_bgr)
    img_rgb = cv2.cvtColor(img_lb, cv2.COLOR_BGR2RGB)
    img_chw = img_rgb.transpose(2, 0, 1)[None].astype(np.float32) / 255.0

    # Inference
    preds = session.run([OUTPUT_NAME], {INPUT_NAME: img_chw})[0][0]

    CONF_THRESH = 0.35 #0.25

    boxes, scores, class_ids = [], [], []

    for row in preds:
        obj_conf = float(row[4])
        class_probs = row[5:]
        class_id = int(np.argmax(class_probs))
        score = float(obj_conf * class_probs[class_id])

        if score < CONF_THRESH:
            continue

        cx, cy, w, h = row[:4]

        # Handle normalized vs pixel outputs
        if cx <= 1.5:
            cx *= 640
            cy *= 640
            w  *= 640
            h  *= 640

        if w < 5 or h < 5:
            continue

        x1, y1, x2, y2 = xywh_to_xyxy(cx, cy, w, h)

        # Remove padding & rescale
        x1 = float((x1 - pad_x) / ratio)
        y1 = float((y1 - pad_y) / ratio)
        x2 = float((x2 - pad_x) / ratio)
        y2 = float((y2 - pad_y) / ratio)

        # Clip
        x1 = max(0.0, min(float(w0), x1))
        y1 = max(0.0, min(float(h0), y1))
        x2 = max(0.0, min(float(w0), x2))
        y2 = max(0.0, min(float(h0), y2))

        bw = x2 - x1
        bh = y2 - y1

        if bw <= 0 or bh <= 0:
            continue

        boxes.append([float(x1), float(y1), float(bw), float(bh)])
        scores.append(float(score))
        class_ids.append(int(class_id))

    results = []

    if boxes:
        idxs = nms(boxes, scores)

        for i in idxs:
            cname = NAMES[class_ids[i]]
            role = ROLE_MAP.get(cname, ROLE_MAP["UNKNOWN"])

            x, y, w, h = boxes[i]

            results.append({
                "class": cname,
                "confidence": float(round(scores[i], 3)),
                "bbox": [
                    float(round(x, 2)),
                    float(round(y, 2)),
                    float(round(x + w, 2)),
                    float(round(y + h, 2))
                ],
                "type": role["type"],
                "threat": role["threat"],
                "harm": role["harm"]
            })

    return {
        "predictions": results,
        "model": str(os.path.basename(MODEL_ONNX))
    }
