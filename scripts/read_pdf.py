import sys
try:
    import fitz  # PyMuPDF
    doc = fitz.open('c:\\Users\\SERVER\\Documents\\Code\\TPA\\tpm\\planning.pdf')
    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        text = page.get_text()
        print(f"--- PAGE {page_num+1} ---")
        print(text)
except Exception as e:
    print(f"Error: {e}")
