import subprocess, os

segments = [
    {
        "id": "seg1_deteksi",
        "text": "Di tengah ancaman kebakaran hutan dan lahan gambut Kalimantan, kecepatan deteksi dan transparansi adalah kunci penyelamatan iklim global. FireChain AI hadir memadukan telemetri satelit NASA FIRMS dan pembukuan terdesentralisasi. Begitu satelit Suomi-NPP VIIRS melintas, sistem langsung menyerap ribuan titik anomali termal dan menghitung indeks risiko cuaca secara real-time."
    },
    {
        "id": "seg2_spasial",
        "text": "Langkah berikutnya: targeting spasial. Operator membuka Live Map resolusi tinggi satelit ESRI dengan engine akselerasi GPU Canvas 60 FPS. Dengan filter prioritas kritis, tim langsung mengisolasi titik api berdaya radiasi tinggi di atas 20 Megawatt. Inspektor titik panas memberikan telemetri presisi: koordinat geografis, suhu kecerahan, hingga kedalaman kesatuan hidrologis gambut."
    },
    {
        "id": "seg3_laporan",
        "text": "Dari temuan spasial ini, operator langsung menerbitkan laporan penanganan terpadu. Koordinat GPS, tingkat keparahan, dan kondisi vegetasi dicatat resmi. Yang membedakan FireChain AI: setiap laporan langsung dicetak permanen ke dalam blok kriptografis blockchain yang anti manipulasi. Status tindakan diperbarui, dan tim posko Manggala Agni segera dimobilisasi ke lapangan."
    },
    {
        "id": "seg4_audit_emisi",
        "text": "Setiap bukti tindakan dapat diaudit oleh publik dan pihak internasional. Di menu Blockchain Audit, operator menjalankan verifikasi SHA-256 independen untuk membuktikan integritas seluruh rantai data. Terakhir, modul Akuntansi Emisi Karbon IPCC menghitung biomassa gambut yang terselamatkan, menghasilkan ribuan ton emisi yang dihindari dan siap dikonversi menjadi kredit karbon berkualitas tinggi."
    }
]

audio_dir = "/home/arrafi/lomba/IEEE ClimateChain Global Hackathon/video-production/audio"
os.makedirs(audio_dir, exist_ok=True)

for seg in segments:
    raw_path = f"{audio_dir}/{seg['id']}_raw.mp3"
    mastered_path = f"{audio_dir}/{seg['id']}.mp3"
    
    # Generate edge-tts
    cmd = [
        "edge-tts",
        "--voice", "id-ID-ArdiNeural",
        "--rate=+5%",
        "--pitch=+0Hz",
        "--text", seg["text"],
        "--write-media", raw_path
    ]
    subprocess.run(cmd, check=True)
    
    # Master audio with ffmpeg filter
    af = "equalizer=f=120:width_type=h:width=80:g=1.5,equalizer=f=2800:width_type=h:width=1000:g=2.5,compand=attacks=0.03:decays=0.15:points=-80/-80|-36/-22|-16/-10|0/-1.5:soft-knee=6,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000"
    cmd_master = [
        "ffmpeg", "-y", "-i", raw_path,
        "-af", af,
        "-b:a", "192k",
        mastered_path
    ]
    subprocess.run(cmd_master, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    # Probe duration
    probe = subprocess.check_output([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", mastered_path
    ]).decode().strip()
    print(f"Segment {seg['id']}: duration = {float(probe):.2f}s")

