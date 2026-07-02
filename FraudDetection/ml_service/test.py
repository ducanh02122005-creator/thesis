import onnxruntime as ort
import numpy as np

session = ort.InferenceSession(
    "weights/transformer_fraud_model.onnx",
    providers=["CPUExecutionProvider"]
)

result = session.run(
    None,
    {
        "trans_hour": np.array([17], dtype=np.int64),
        "category": np.array([0], dtype=np.int64),
        "amt_log": np.array([3.5], dtype=np.float32)
    }
)

print(result)