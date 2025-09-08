from flask import Flask, request, jsonify, render_template, send_from_directory

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/comparar", methods=["POST"])
def comparar_listas():
    datos = request.get_json()
    listaA = datos.get("listaA", "").splitlines()
    listaB = datos.get("listaB", "").splitlines()

    solo_en_A = [elem for elem in listaA if elem not in listaB]
    solo_en_B = [elem for elem in listaB if elem not in listaA]

    return jsonify({
        "solo_en_A": solo_en_A,
        "solo_en_B": solo_en_B
    })

@app.route("/robots.txt")
def robots():
    return send_from_directory(app.root_path, "robots.txt", mimetype="text/plain")

if __name__ == "__main__":
    app.run(debug=True)
