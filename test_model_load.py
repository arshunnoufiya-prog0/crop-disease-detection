import sys
import torch
from transformers import AutoModelForImageClassification, MobileNetV2ImageProcessor
from torchvision import transforms
from PIL import Image

MODEL_ID = "linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification"

print(f"Loading model {MODEL_ID}...")
try:
    model = AutoModelForImageClassification.from_pretrained(MODEL_ID)
    model.eval()
    print("AutoModelForImageClassification loaded successfully!")
    print(f"Label count: {len(model.config.id2label)}")
    print(f"Sample label 0: {model.config.id2label[0]}")
    
    # Preprocessor using standard MobileNetV2ImageProcessor or torchvision transforms
    # From preprocessor_config.json: size=256 shortest_edge, crop=224, mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5]
    preprocess = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])
    ])
    
    # Test with a dummy image
    dummy_img = Image.new("RGB", (300, 300), color=(100, 180, 70))
    tensor = preprocess(dummy_img).unsqueeze(0)
    with torch.no_grad():
        outputs = model(tensor)
        logits = outputs.logits
        probs = torch.softmax(logits, dim=-1)[0]
        top3_probs, top3_indices = torch.topk(probs, 3)
        print("Test prediction successful:")
        for prob, idx in zip(top3_probs, top3_indices):
            print(f"  {model.config.id2label[idx.item()]}: {prob.item():.4f}")
except Exception as e:
    import traceback
    traceback.print_exc()
    sys.exit(1)
