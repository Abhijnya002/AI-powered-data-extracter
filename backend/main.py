from flask import Flask, request, send_file
from flask_cors import CORS
import os
from process_doc import (
    load_transcript_text,
    extract_task_sentences,
    extract_all_budgets,
    process_tasks,
    save_structured_excel,
)

app = Flask(__name__)
CORS(app)

@app.route('/api/process-docx', methods=['POST'])
def process_docx():
    file = request.files['file']
    input_path = f"backend/temp/{file.filename}"
    file.save(input_path)

    transcript = load_transcript_text(input_path)
    sentences = extract_task_sentences(transcript)
    budgets = extract_all_budgets(transcript)
    grouped, total = process_tasks(sentences, budgets, input_path)

    output_path = input_path.replace('.docx', '.xlsx')
    save_structured_excel(grouped, total, output_path, input_path)

    return send_file(output_path, as_attachment=True)

if __name__ == "__main__":
    app.run(port=5000)
