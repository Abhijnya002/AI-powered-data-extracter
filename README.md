# 🧠 AI-Powered DOCX-to-Excel Transcript Processor

Transform unstructured `.docx` documents — like meeting transcripts, project logs, and renovation notes — into clean, structured, categorized Excel reports.  
Built using **LLMs**, **Flask**, **React**, and **zero-GPU deployment**.

[🌐 Live Demo](https://ai-powered-data-extracter.vercel.app)

---

## ✨ Features

- 📄 Upload any `.docx` document
- 🔍 Automatically extract:
  - Task-like sentences
  - Budget mentions
  - Drawing references
  - Responsible leads
- 🪄 Generate clean **summaries** and **concise task titles** using LLMs
- 📊 Export a **professionally styled Excel report** with:
  - Categories
  - Budgets
  - Comments
  - Drawing references and leads

---

## 🛠️ Tech Stack

### Frontend
- [React](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [ShadCN UI](https://ui.shadcn.dev/)
- Hosted on [Vercel](https://vercel.com)

### Backend
- [Flask](https://flask.palletsprojects.com/) API
- LLMs via [Hugging Face Transformers](https://huggingface.co/transformers/)
  - Local: `flan-t5-base`, `distilbart-cnn-12-6`
  - Deployed: `sshleifer/tiny-gpt2` (optimized for CPU-only hosting)
- Hosted on [Replit](https://replit.com)

### NLP Fallbacks
- Regex + zero-shot classification
- Graceful degradation when LLMs are not available

### Excel Export
- [openpyxl](https://openpyxl.readthedocs.io/) for Excel styling, categorization, and formatting

---

## 🌟 Skills & Concepts Applied

- LLM prompt engineering & text generation
- Lightweight AI deployment (no GPU required)
- End-to-end full-stack development (frontend, backend, model inference, data export)
- AI UX: progress handling, fallbacks, and async flow
- Optimizing model behavior in **resource-constrained environments**

---

## 🚀 Run Locally

### 1. Clone the repo

git clone https://github.com/your-username/ai-docx-excel-processor.git
cd ai-docx-excel-processor

##2. Backend Setup
cd api/
pip install -r requirements.txt
python main.py
Make sure to install transformers, flask, openpyxl, torch, and docx.

##3. Frontend Setup
cd client/
npm install
npm run dev

##📦 Folder Structure

.
├── api/               # Flask backend with LLM and processing logic
├── client/            # React + Tailwind frontend
├── README.md
└── ...

##📄 Sample Use Cases

Meeting minutes → structured Excel with tasks + budgets
Renovation transcripts → cost-based categorized scope of work
Project notes → summarized deliverables and stakeholder responsibilities
Legal docs → extract action items and references

##🙏 Acknowledgements

Huge thanks to:

🤗 Hugging Face
🧠 OpenAI
💻 Replit
🚀 Vercel
🧩 Open-source and frontend/UI/AI communities
📬 Contact

Built by Abhijnya K G.
Feel free to reach out or open an issue — collaboration and feedback always welcome!

