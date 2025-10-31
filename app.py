from flask import Flask, render_template, jsonify, url_for
import random, time
import os
from datetime import datetime

app = Flask(__name__, 
    template_folder=os.path.join(os.path.dirname(os.path.abspath(__file__)), 'templates'),
    static_folder=os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static'))

# Simulate network traffic data
def generate_traffic():
    protocols = ["TCP", "UDP", "ICMP", "HTTP", "HTTPS", "DNS"]
    data = []
    current_time = datetime.now().strftime("%H:%M:%S")
    
    for _ in range(10):  # Reduced to 10 entries for cleaner display
        protocol = random.choice(protocols)
        data.append({
            "timestamp": current_time,
            "src_ip": f"192.168.0.{random.randint(1, 255)}",
            "dst_ip": f"10.0.0.{random.randint(1, 255)}",
            "protocol": protocol,
            "bytes": random.randint(1024, 10240)  # Increased byte range for better visualization
        })
    return data

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/traffic-data')
def traffic_data():
    return jsonify(generate_traffic())

@app.route('/suggestions')
def suggestions():
    # More realistic analytics
    total_traffic = random.randint(50000, 150000)  # Increased traffic range
    anomaly_chance = random.random()
    
    if anomaly_chance < 0.7:  # 70% chance of normal traffic
        suggestion = "No anomalies detected in network traffic"
    elif anomaly_chance < 0.85:  # 15% chance of suspicious traffic
        suggestion = "Unusual traffic pattern detected on port 443"
    else:  # 15% chance of potential attack
        attacks = [
            "Possible DNS flood attack detected",
            "Unusual number of SSH connection attempts",
            "High volume of ICMP traffic detected",
            "Potential port scan in progress"
        ]
        suggestion = random.choice(attacks)
    
    return jsonify({
       
        "total_traffic": total_traffic,
        "suggestion": suggestion
    })

if __name__ == "__main__":
    app.run(debug=True)
