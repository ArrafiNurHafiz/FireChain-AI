import os
import subprocess
from gtts import gTTS

audio_dir = "/home/arrafi/lomba/IEEE ClimateChain Global Hackathon/video-production/audio"
os.makedirs(audio_dir, exist_ok=True)

scripts = {
    "seg1_deteksi.mp3": (
        "Across the vulnerable tropical peatlands of Kalimantan, early detection and transparent verification "
        "are essential for global climate action. FireChain AI integrates live NASA FIRMS satellite telemetry with "
        "decentralized blockchain technology. As the Suomi-NPP VIIRS satellite passes overhead, the system ingests "
        "thousands of thermal anomalies, instantly feeding ambient weather into the Canadian FWI model and our custom "
        "PeatNet neural network to predict subterranean smoldering ignition risk."
    ),
    "seg2_spasial.mp3": (
        "Next: precision spatial targeting. Operators launch the high-resolution ESRI satellite Live Map, "
        "powered by a 60 frames-per-second GPU Canvas rendering engine. By toggling the Critical Priority filter, "
        "the team immediately isolates extreme hotspots exceeding 20 Megawatts. The Hotspot Inspector reveals "
        "exact GPS coordinates, brightness temperature, and automated AI PeatNet containment directives over "
        "Kalimantan's deep peat hydrological units."
    ),
    "seg3_laporan.mp3": (
        "From this spatial intelligence, operators file an official field incident report. Exact GPS coordinates, "
        "peat depth, vegetation status, and severity are logged. What sets FireChain AI apart: every report is "
        "cryptographically hashed with SHA-256 and anchored directly to the Polygon Amoy blockchain. Field status "
        "transitions to Response Active as Manggala Agni firefighting units deploy with high-pressure trench pumps."
    ),
    "seg4_audit_emisi.mp3": (
        "Every operational action remains publicly verifiable and tamper-proof. In the Blockchain Audit Trail, "
        "operators execute full SHA-256 consensus verification to prove immutable chain integrity across all blocks. "
        "Each block provides direct links to the Polygonscan Amoy Explorer with ECDSA validator signatures. "
        "Finally, the IPCC Tier 2 Carbon Accounting module calculates avoided greenhouse gas emissions, "
        "turning rapid ground suppression into certified, high-integrity carbon credits."
    )
}

for filename, text in scripts.items():
    raw_path = f"/tmp/raw_en_{filename}"
    out_path = os.path.join(audio_dir, filename)
    print(f"Generating English TTS for {filename}...")
    tts = gTTS(text=text, lang="en", tld="com", slow=False)
    tts.save(raw_path)

    # Master with FFmpeg
    cmd = [
        "ffmpeg", "-y", "-i", raw_path,
        "-af", (
            "equalizer=f=120:width_type=h:width=80:g=1.5,"
            "equalizer=f=2800:width_type=h:width=1000:g=2.8,"
            "equalizer=f=6500:width_type=h:width=2000:g=3.2,"
            "treble=g=2.5:f=8000,"
            "compand=attacks=0.03:decays=0.15:points=-80/-80|-36/-22|-16/-10|0/-1.5:soft-knee=6,"
            "loudnorm=I=-16:TP=-1.5:LRA=11,"
            "aresample=48000"
        ),
        "-ar", "48000",
        "-b:a", "192k",
        out_path
    ]
    subprocess.run(cmd, check=True)
    
    # Check duration
    probe = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", out_path],
        stdout=subprocess.PIPE, text=True, check=True
    )
    dur = float(probe.stdout.strip())
    frames = int(dur * 30)
    print(f"Done {filename}: {dur:.2f}s (~{frames} frames)")
