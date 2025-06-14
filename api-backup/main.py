# from flask import Flask, request, send_file
# from transformers import pipeline
# import torch
# import docx
# import tempfile
# import re
# import os
# from openpyxl import Workbook
# from flask import Flask, request, send_file, jsonify
# from flask_cors import CORS

# app = Flask(__name__)
# CORS(app, expose_headers=["Content-Disposition"])

# @app.route("/", methods=["GET"])
# def home():
#     return "✅ Replit API is live"


# @app.route("/process_doc", methods=["POST"])
# def process_doc():
#     try:
#         uploaded_file = request.files.get("file")
#         if not uploaded_file or not uploaded_file.filename.endswith(".docx"):
#             return {"error": "Invalid file. Please upload a .docx file."}, 400

#         # Save uploaded docx to a temp file
#         with tempfile.NamedTemporaryFile(delete=False, suffix=".docx") as temp_file:
#             uploaded_file.save(temp_file)
#             temp_file_path = temp_file.name

#         # Extract text
#         doc = docx.Document(temp_file_path)
#         text = re.sub(r"\s+", " ", " ".join(p.text for p in doc.paragraphs)).strip()
#         tasks = [s for s in re.split(r'(?<=[.!?])\s+', text) if len(s.split()) > 4]

#         if not tasks:
#             return {"error": "No valid task sentences found."}, 400

#         # Load model inside route
#         summarizer = pipeline("summarization", model="t5-small", device=0 if torch.cuda.is_available() else -1)
#         title_gen = pipeline("text2text-generation", model="t5-small", device=0 if torch.cuda.is_available() else -1)

#         summary = summarizer(tasks[0], max_length=60, min_length=20, do_sample=False)[0]["summary_text"]
#         title = title_gen(f"Create a concise renovation title from: \"{tasks[0]}\"", max_length=20, do_sample=False)[0]["generated_text"]

#         # Create Excel file
#         wb = Workbook()
#         ws = wb.active
#         ws.title = "AI Extracted Data"
#         ws.append(["Generated Title"])
#         ws.append([title])
#         ws.append([])
#         ws.append(["Summary"])
#         ws.append([summary])
#         ws.append([])
#         ws.append(["Extracted Sentences"])
#         for sentence in tasks[:10]:
#             ws.append([sentence])

#         output_path = tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx").name
#         wb.save(output_path)

#         return send_file(
#     output_path,
#     as_attachment=True,
#     download_name="ai_output.xlsx",
#     mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
# )




#     except Exception as e:
#         print("❌ Backend error:", e)
#         return jsonify({"error": str(e)}), 500


# # Optional homepage to avoid 404 on /
# @app.route("/", methods=["GET"])
# def home():
#     return "📝 AI DOCX Processor is running!"

# if __name__ == "__main__":
#     app.run(host="0.0.0.0", port=8080)
from flask import Flask, request, send_file, jsonify
from transformers import pipeline
import torch
import docx
import tempfile
import re
import os
from openpyxl import Workbook
from flask_cors import CORS

app = Flask(__name__)
CORS(app, expose_headers=["Content-Disposition"])

# Initialize models at startup to avoid loading them repeatedly
print("🔄 Loading AI models...")
try:
    summarizer = pipeline("summarization", model="t5-small", device=0 if torch.cuda.is_available() else -1)
    title_gen = pipeline("text2text-generation", model="t5-small", device=0 if torch.cuda.is_available() else -1)
    print("✅ Models loaded successfully")
except Exception as e:
    print(f"❌ Error loading models: {e}")
    summarizer = None
    title_gen = None

@app.route("/", methods=["GET"])
def home():
    return "✅ AI DOCX Processor is running!"

@app.route("/process_doc", methods=["POST"])
def process_doc():
    temp_file_path = None
    output_path = None
    
    try:
        # Check if models are loaded
        if not summarizer or not title_gen:
            return jsonify({"error": "AI models not loaded properly"}), 500
            
        uploaded_file = request.files.get("file")
        if not uploaded_file or not uploaded_file.filename.endswith(".docx"):
            return jsonify({"error": "Invalid file. Please upload a .docx file."}), 400

        # Save uploaded docx to a temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".docx") as temp_file:
            uploaded_file.save(temp_file)
            temp_file_path = temp_file.name

        print(f"📄 Processing file: {uploaded_file.filename}")

        # Extract text
        doc = docx.Document(temp_file_path)
        text = re.sub(r"\s+", " ", " ".join(p.text for p in doc.paragraphs)).strip()
        
        if not text:
            return jsonify({"error": "No text found in the document"}), 400
            
        tasks = [s.strip() for s in re.split(r'(?<=[.!?])\s+', text) if len(s.split()) > 4]

        if not tasks:
            return jsonify({"error": "No valid task sentences found in the document"}), 400

        print(f"📊 Found {len(tasks)} task sentences")

        # Generate AI content with error handling
        try:
            # Use the first substantial task for summary
            main_task = tasks[0][:512]  # Limit input length for T5
            
            summary_result = summarizer(main_task, max_length=60, min_length=20, do_sample=False)
            summary = summary_result[0]["summary_text"] if summary_result else "Summary generation failed"
            
            title_prompt = f"Create a concise renovation title: {main_task[:100]}"
            title_result = title_gen(title_prompt, max_length=20, do_sample=False)
            title = title_result[0]["generated_text"] if title_result else "Title generation failed"
            
        except Exception as ai_error:
            print(f"❌ AI processing error: {ai_error}")
            # Fallback to simple text processing
            summary = text[:200] + "..." if len(text) > 200 else text
            title = uploaded_file.filename.replace('.docx', ' - Processed')

        # Create Excel file
        wb = Workbook()
        ws = wb.active
        ws.title = "AI Extracted Data"
        
        # Add headers and content
        ws.append(["Generated Title"])
        ws.append([title])
        ws.append([])
        ws.append(["Summary"])
        ws.append([summary])
        ws.append([])
        ws.append(["Extracted Sentences"])
        
        # Add up to 10 sentences
        for sentence in tasks[:10]:
            if sentence.strip():
                ws.append([sentence.strip()])

        # Create output file
        output_path = tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx").name
        wb.save(output_path)
        
        print(f"✅ Excel file created: {output_path}")

        # Verify file was created and has content
        if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
            return jsonify({"error": "Failed to create Excel file"}), 500

        # Send file with proper headers
        response = send_file(
            output_path,
            as_attachment=True,
            download_name=f"{uploaded_file.filename.replace('.docx', '.xlsx')}",
            mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        
        # Add CORS headers
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Expose-Headers'] = 'Content-Disposition'
        
        return response

    except Exception as e:
        print(f"❌ Backend error: {e}")
        return jsonify({"error": f"Processing failed: {str(e)}"}), 500
        
    finally:
        # Cleanup temporary files
        try:
            if temp_file_path and os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
            if output_path and os.path.exists(output_path):
                # Don't delete output_path immediately as it's being sent
                # Flask will handle cleanup after sending
                pass
        except Exception as cleanup_error:
            print(f"⚠️ Cleanup error: {cleanup_error}")

@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "models_loaded": bool(summarizer and title_gen),
        "cuda_available": torch.cuda.is_available()
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=False)