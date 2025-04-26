from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/detect_fraud', methods=['POST'])
def detect_fraud():
    data = request.json

    try:
        # Convert typing values safely and avoid division by zero
        typingObs = int(data.get('typingObs', '0') or '0')
        typingExp = int(data.get('typingExp', '1') or '1')

        risk_score = (
            int(data.get('metadata', 0)) * 10 +
            int(data.get('location', 0)) * 10 +
            int(data.get('otpFreq', 0)) * 3 +
            abs((typingObs - typingExp) / max(typingExp, 1) * 100) * 0.5 +
            int(data.get('gestureObs', 0)) * 10 +
            int(data.get('sensitiveAction', 0)) * 15 +
            int(data.get('insecureNetwork', 0)) * 10 +
            int(data.get('fraudDB', 0)) * 25 +
            int(data.get('multipleAccounts', 0)) * 10
        )

        alert = risk_score > 70
        return jsonify({"risk_score": round(risk_score, 2), "alert": alert})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=False)
