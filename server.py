from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

# ─── Email Config ───
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS", "anuragkodge@gmail.com")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "")  # Gmail App Password


@app.route('/')
def index():
    return send_from_directory('.', 'index.html')


@app.route('/send', methods=['POST'])
def send_message():
    try:
        data = request.get_json()

        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        subject = data.get('subject', 'No Subject').strip()
        message = data.get('message', '').strip()

        # Validate
        if not name or not email or not message:
            return jsonify({"success": False, "error": "Please fill all required fields."}), 400

        # Build email
        msg = MIMEMultipart("alternative")
        msg["From"] = EMAIL_ADDRESS
        msg["To"] = EMAIL_ADDRESS
        msg["Subject"] = f"Portfolio Contact: {subject}"
        msg["Reply-To"] = email

        # Plain text version
        text = f"Name: {name}\nEmail: {email}\nSubject: {subject}\n\nMessage:\n{message}"

        # HTML version
        html = f"""
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <div style="background:linear-gradient(135deg,#6c5ce7,#a855f7);padding:20px;border-radius:12px 12px 0 0;">
                <h2 style="color:#fff;margin:0;">📬 New Portfolio Message</h2>
            </div>
            <div style="background:#f9f9f9;padding:24px;border-radius:0 0 12px 12px;border:1px solid #eee;">
                <table style="width:100%;border-collapse:collapse;">
                    <tr><td style="padding:8px;font-weight:bold;color:#555;">Name:</td><td style="padding:8px;">{name}</td></tr>
                    <tr><td style="padding:8px;font-weight:bold;color:#555;">Email:</td><td style="padding:8px;"><a href="mailto:{email}">{email}</a></td></tr>
                    <tr><td style="padding:8px;font-weight:bold;color:#555;">Subject:</td><td style="padding:8px;">{subject}</td></tr>
                </table>
                <hr style="margin:16px 0;border:none;border-top:1px solid #eee;">
                <p style="font-weight:bold;color:#555;">Message:</p>
                <p style="background:#fff;padding:16px;border-radius:8px;border:1px solid #eee;line-height:1.6;">{message}</p>
            </div>
        </div>
        """

        msg.attach(MIMEText(text, "plain"))
        msg.attach(MIMEText(html, "html"))

        # Send email
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            server.send_message(msg)

        return jsonify({"success": True, "message": "Message sent successfully!"})

    except smtplib.SMTPAuthenticationError:
        return jsonify({"success": False, "error": "Email authentication failed. Check your App Password."}), 500
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"success": False, "error": "Something went wrong. Please try again."}), 500


if __name__ == '__main__':
    if not EMAIL_PASSWORD:
        print("\n⚠️  WARNING: EMAIL_PASSWORD not set!")
        print("   Create a .env file with your Gmail App Password.")
        print("   See README for instructions.\n")
    print("🚀 Portfolio server running at http://localhost:5000")
    app.run(debug=True, port=5000)
