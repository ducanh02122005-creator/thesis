import torch
import onnx


import torch

from models.transformer import build_transformer_classifier

# Build architecture

model = build_transformer_classifier(
    d_model=128,
    max_seq_len=3,
    hour_vocab_size=24,
    category_vocab_size=14,  # sửa theo dữ liệu thực tế
    N=2,
    h=8,
    dropout=0.1,
    num_classes=1
)

# Load trained weights

model.load_state_dict(
    torch.load(
        "weights/transformer_fraud_model.pth",
        map_location="cpu"
    )
)

model.eval()

print("Model loaded successfully")
dummy_hour = torch.tensor(
    [17],
    dtype=torch.long
)

dummy_category = torch.tensor(
    [0],
    dtype=torch.long
)

dummy_amt = torch.tensor(
    [3.5],
    dtype=torch.float32
)

torch.onnx.export(
    model,
    (
        dummy_hour,
        dummy_category,
        dummy_amt
    ),
    "weights/transformer_fraud_model.onnx",

    export_params=True,
    external_data=False,   # QUAN TRỌNG

    input_names=[
        "trans_hour",
        "category",
        "amt_log"
    ],

    output_names=[
        "fraud_score"
    ],

    opset_version=18
)


print("ONNX exported successfully.")