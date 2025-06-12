from flask import Flask, request, send_file
from flask_cors import CORS
import os

# 🟢 All the functions (load_transcript_text, etc.) are already defined in this file — no import needed

app = Flask(__name__)
CORS(app)

@app.route('/api/process-docx', methods=['POST'])
def process_docx():
    try:
        file = request.files['file']
        os.makedirs("backend/temp", exist_ok=True)
        input_path = f"backend/temp/{file.filename}"
        file.save(input_path)

        transcript = load_transcript_text(input_path)
        sentences = extract_task_sentences(transcript)
        budgets = extract_all_budgets(transcript)
        grouped, total = process_tasks(sentences, budgets, input_path)

        output_path = input_path.replace('.docx', '.xlsx')
        save_structured_excel(grouped, total, output_path, input_path)

        return send_file(output_path, as_attachment=True)

    except Exception as e:
        print("❌ Error occurred:", e)
        return f"Backend error: {str(e)}", 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)

