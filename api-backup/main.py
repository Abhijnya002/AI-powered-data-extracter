from flask import Flask, request, send_file
from transformers import pipeline
import torch
import docx
import tempfile
import re
import os
from openpyxl import Workbook
from flask_cors import CORS
CORS(app)

app = Flask(__name__)

@app.route("/process_doc", methods=["POST"])
def process_doc():
    try:
        uploaded_file = request.files.get("file")
        if not uploaded_file or not uploaded_file.filename.endswith(".docx"):
            return {"error": "Invalid file. Please upload a .docx file."}, 400

        # Save uploaded docx to a temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".docx") as temp_file:
            uploaded_file.save(temp_file)
            temp_file_path = temp_file.name

        # Extract text
        doc = docx.Document(temp_file_path)
        text = re.sub(r"\s+", " ", " ".join(p.text for p in doc.paragraphs)).strip()
        tasks = [s for s in re.split(r'(?<=[.!?])\s+', text) if len(s.split()) > 4]

        if not tasks:
            return {"error": "No valid task sentences found."}, 400

        # Load model inside route
        summarizer = pipeline("summarization", model="t5-small", device=0 if torch.cuda.is_available() else -1)
        title_gen = pipeline("text2text-generation", model="t5-small", device=0 if torch.cuda.is_available() else -1)

        summary = summarizer(tasks[0], max_length=60, min_length=20, do_sample=False)[0]["summary_text"]
        title = title_gen(f"Create a concise renovation title from: \"{tasks[0]}\"", max_length=20, do_sample=False)[0]["generated_text"]

        # Create Excel file
        wb = Workbook()
        ws = wb.active
        ws.title = "AI Extracted Data"
        ws.append(["Generated Title"])
        ws.append([title])
        ws.append([])
        ws.append(["Summary"])
        ws.append([summary])
        ws.append([])
        ws.append(["Extracted Sentences"])
        for sentence in tasks[:10]:
            ws.append([sentence])

        output_path = tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx").name
        wb.save(output_path)

        return send_file(
    output_path,
    as_attachment=True,
    download_name="ai_output.xlsx",
    mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
)




    except Exception as e:
        return {"error": str(e)}, 500

# Optional homepage to avoid 404 on /
@app.route("/", methods=["GET"])
def home():
    return "📝 AI DOCX Processor is running!"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
