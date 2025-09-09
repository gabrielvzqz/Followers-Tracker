from flask import Flask, request, jsonify, render_template, Response, url_for

app = Flask(__name__)

# Servir robots.txt
@app.route("/robots.txt")
def robots():
    content = """User-agent: *
Disallow:

Sitemap: https://follower-analyzer.onrender.com/sitemap.xml
"""
    return Response(content, mimetype="text/plain")

# Servir sitemap.xml (ejemplo simple)
@app.route("/sitemap.xml")
def sitemap():
    content = """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
   <url>
      <loc>https://follower-analyzer.onrender.com/</loc>
      <priority>1.0</priority>
   </url>
</urlset>
"""
    return Response(content, mimetype="application/xml")

@app.route("/")
def index():
    return render_template("index.html")
def normalizar(s):
    return ''.join(s.lower().split()) 
@app.route("/comparar", methods=["POST"])
def comparar_listas():
    datos = request.get_json()
    listaA = datos.get("listaA", [])
    listaB = datos.get("listaB", [])


    solo_en_A = [elem for elem in listaA if elem not in listaB]
    solo_en_B = [elem for elem in listaB if elem not in listaA]

    return jsonify({
        "solo_en_A": solo_en_A,
        "solo_en_B": solo_en_B
    })

if __name__ == "__main__":
    app.run(debug=True)
